import { redirect } from "next/navigation";
import { stripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";
import CheckoutStatus from "@/app/components/CheckoutStatus";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { processSuccessfulCheckout } from "@/app/services/checkout";

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

    await processSuccessfulCheckout(
      searchParams.session_id,
      session.user.id,
      checkoutSession.metadata.cartId
    );

    return (
      <CheckoutStatus
        status="success"
        message="Payment successful! Redirecting to your downloads..."
        redirect="/presets?view=downloaded"
      />
    );
  } catch (error) {
    console.error("Detailed checkout error:", {
      error,
      sessionId: searchParams.session_id,
      userId: session?.user?.id,
    });

    return (
      <CheckoutStatus
        status="error"
        message={error instanceof Error ? error.message : "Something went wrong with your purchase. Please contact support."}
        redirect="/cart"
      />
    );
  }
}