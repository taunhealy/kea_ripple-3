import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { PriceType } from "@prisma/client";
import { createCheckout } from "@/app/services/checkout";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cart = await prisma.cart.findUnique({
      where: {
        userId_type: {
          userId: session.user.id,
          type: "CART"
        }
      },
      include: {
        items: {
          include: {
            preset: {
              select: {
                id: true,
                title: true,
                priceType: true,
                price: true,
                user: {
                  select: {
                    id: true,
                    stripeAccountId: true,
                    lemonSqueezyStoreId: true
                  }
                }
              }
            },
            pack: {
              select: {
                id: true,
                title: true,
                price: true,
                user: {
                  select: {
                    id: true,
                    stripeAccountId: true,
                    lemonSqueezyStoreId: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: "No items in cart" }, { status: 400 });
    }

    // Check if all items are free
    const allItemsFree = cart.items.every(
      item => item.preset?.priceType === PriceType.FREE || item.pack?.price === 0
    );

    if (allItemsFree) {
      // Process free downloads
      await prisma.$transaction(async (tx) => {
        // Create downloads first
        for (const item of cart.items) {
          if (item.preset?.id) {
            await tx.presetDownload.upsert({
              where: {
                userId_presetId: {
                  userId: session.user.id,
                  presetId: item.preset.id,
                },
              },
              update: {},
              create: {
                userId: session.user.id,
                presetId: item.preset.id,
                amount: 0,
              },
            });
          } else if (item.pack?.id) {
            await tx.presetPackDownload.upsert({
              where: {
                userId_packId: {
                  userId: session.user.id,
                  packId: item.pack.id,
                },
              },
              update: {},
              create: {
                userId: session.user.id,
                packId: item.pack.id,
                amount: 0,
              },
            });
          }
        }

        // Delete cart items first
        await tx.cartItem.deleteMany({
          where: { cartId: cart.id }
        });

        // Then delete the cart
        await tx.cart.delete({
          where: { id: cart.id }
        });
      });

      return NextResponse.json({ url: "/presets?view=downloaded" });
    }

    // Handle paid checkout
    const result = await createCheckout(cart, session.user.id);
    return NextResponse.json({ url: result.url });

  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Something went wrong", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
