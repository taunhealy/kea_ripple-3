import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { CartType } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: { type: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const cart = await prisma.cart.findFirst({
      where: {
        userId: session.user.id,
        type: params.type.toUpperCase() as CartType,
      },
      include: {
        items: {
          include: {
            priceHistory: {
              orderBy: {
                timestamp: "desc",
              },
            },
            preset: {
              include: {
                priceHistory: {
                  orderBy: {
                    timestamp: "desc",
                  },
                },
                user: {
                  select: {
                    username: true,
                  },
                },
              },
            },
            pack: {
              include: {
                priceHistory: {
                  orderBy: {
                    timestamp: "desc",
                  },
                },
                user: {
                  select: {
                    username: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const items =
      cart?.items.map((item) => ({
        id: item.id,
        name: item.preset?.title ?? item.pack?.title ?? "",
        price: Number(item.preset?.price ?? item.pack?.price ?? 0),
        imageString:
          item.preset?.soundPreviewUrl ?? item.pack?.soundPreviewUrl ?? "",
        quantity: item.quantity,
        creator: item.preset?.user?.username ?? item.pack?.user?.username ?? "",
        itemType: item.itemType,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
        cartId: item.cartId,
        presetId: item.presetId,
        packId: item.packId,
      })) || [];

    return NextResponse.json(items);
  } catch (error) {
    console.error("Cart error:", error);
    return NextResponse.json(
      { error: `Failed to fetch ${params.type}` },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { type: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { itemId, from, to } = await request.json();

    // Log for debugging
    console.log("Moving item:", { itemId, from, to, userId });

    const result = await prisma.$transaction(async (tx) => {
      // Find the item in the source cart
      const item = await tx.cartItem.findFirst({
        where: {
          id: itemId,
          cart: {
            userId: userId,
            type: from.toUpperCase() as CartType,
          },
        },
      });

      if (!item) {
        throw new Error("Item not found or unauthorized");
      }

      // Create or find destination cart
      const destCart = await tx.cart.upsert({
        where: {
          userId_type: {
            userId: userId,
            type: to.toUpperCase() as CartType,
          },
        },
        create: {
          userId: userId,
          type: to.toUpperCase() as CartType,
        },
        update: {},
      });

      // Move the item to the destination cart
      const movedItem = await tx.cartItem.update({
        where: { id: itemId },
        data: { cartId: destCart.id },
        include: {
          preset: true,
          pack: true,
        },
      });

      return movedItem;
    });

    return NextResponse.json({ success: true, item: result });
  } catch (error) {
    console.error("Cart operation failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to move item" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { type: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { presetId, packId } = await request.json();
    const cartType = params.type.toUpperCase() as CartType;

    // First check if item already exists in THIS cart type
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cart: {
          userId: session.user.id,
          type: cartType,
        },
        AND: [
          {
            OR: [{ presetId: presetId || null }, { packId: packId || null }],
          },
        ],
      },
    });

    if (existingItem) {
      return NextResponse.json(
        { error: "Item already exists in cart" },
        { status: 400 }
      );
    }

    // Create cart and item within a transaction
    const result = await prisma.$transaction(async (tx) => {
      const cart = await tx.cart.upsert({
        where: {
          userId_type: {
            userId: session.user.id,
            type: cartType,
          },
        },
        create: {
          userId: session.user.id,
          type: cartType,
        },
        update: {},
      });

      return await tx.cartItem.create({
        data: {
          cartId: cart.id,
          itemType: packId ? "PACK" : "PRESET",
          presetId: presetId || null,
          packId: packId || null,
          quantity: 1,
        },
        include: {
          preset: {
            include: {
              user: { select: { username: true } },
            },
          },
          pack: {
            include: {
              user: { select: { username: true } },
            },
          },
        },
      });
    });

    // Transform the response
    const responseItem = {
      id: result.id,
      name: result.preset?.title ?? result.pack?.title ?? "",
      price: Number(result.preset?.price ?? result.pack?.price ?? 0),
      imageString:
        result.preset?.soundPreviewUrl ?? result.pack?.soundPreviewUrl ?? "",
      quantity: result.quantity,
      creator:
        result.preset?.user?.username ?? result.pack?.user?.username ?? "",
      itemType: result.itemType,
      createdAt: result.createdAt.toISOString(),
      updatedAt: result.updatedAt.toISOString(),
      cartId: result.cartId,
      presetId: result.presetId,
      packId: result.packId,
    };

    return NextResponse.json(responseItem);
  } catch (error) {
    console.error("Cart operation failed:", error);
    return NextResponse.json(
      { error: "Failed to add item to cart" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { type: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { itemId } = await request.json();

    await prisma.$transaction(async (tx) => {
      // First delete all price history records
      await tx.priceHistory.deleteMany({
        where: {
          cartItemId: itemId,
        },
      });

      // Then delete the cart item
      await tx.cartItem.delete({
        where: {
          id: itemId,
          cart: {
            userId: userId,
            type: params.type.toUpperCase() as CartType,
          },
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error deleting ${params.type} item:`, error);
    return NextResponse.json(
      { error: `Failed to delete item from ${params.type}` },
      { status: 500 }
    );
  }
}
