import { redirect } from "next/navigation";
import { stripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";
import CheckoutStatus from "@/app/components/CheckoutStatus";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { session_id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !searchParams.session_id) {
    redirect("/");
  }

  try {
    const checkoutSession = await stripe.checkout.sessions.retrieve(
      searchParams.session_id,
      {
        expand: ["line_items", "line_items.data.price.product"],
      }
    );

    if (!checkoutSession.metadata?.cartId) {
      throw new Error("No cart ID found in session metadata");
    }

    const cartItems = await prisma.cartItem.findMany({
      where: {
        cartId: checkoutSession.metadata.cartId,
      },
      include: {
        preset: true,
        pack: true,
      },
    });

    const downloads = await Promise.all(
      cartItems.map(async (item) => {
        if (item.itemType === "PRESET" && item.presetId) {
          return prisma.presetDownload.create({
            data: {
              userId: session.user.id,
              presetId: item.presetId,
              amount: item.preset?.price || 0,
            },
          });
        } else if (item.itemType === "PACK" && item.packId) {
          return prisma.presetPackDownload.create({
            data: {
              userId: session.user.id,
              packId: item.packId,
              amount: item.pack?.price || 0,
            },
          });
        }
        return null;
      })
    );

    // Delete cart items after successful download records creation
    await prisma.cartItem.deleteMany({
      where: {
        cartId: checkoutSession.metadata.cartId,
      },
    });

    // Delete the cart itself
    await prisma.cart.delete({
      where: {
        id: checkoutSession.metadata.cartId,
      },
    });

    console.log("Checkout completed successfully, redirecting to downloads");

    return (
      <CheckoutStatus
        status="success"
        message="Payment successful! Redirecting to your downloads..."
        redirect="/presets?view=downloaded"
      />
    );
  } catch (error) {
    console.error("Checkout error:", error);
    return (
      <CheckoutStatus
        status="error"
        message="Something went wrong with your purchase. Please contact support."
        redirect="/cart"
      />
    );
  }
}