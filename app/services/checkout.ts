import prisma from "@/lib/prisma";

export async function processSuccessfulCheckout(
    sessionId: string,
    userId: string,
    cartId: string
  ) {
    const cartItems = await prisma.cartItem.findMany({
      where: { cartId },
      include: { preset: true, pack: true },
    });
  
    // Create downloads using upsert to handle existing records
    const downloads = await Promise.all(
      cartItems.map(async (item) => {
        if (item.itemType === "PRESET" && item.presetId) {
          return prisma.presetDownload.upsert({
            where: {
              userId_presetId: {
                userId,
                presetId: item.presetId,
              },
            },
            update: {}, // No updates needed if it exists
            create: {
              userId,
              presetId: item.presetId,
              amount: item.preset?.price || 0,
            },
          });
        } else if (item.itemType === "PACK" && item.packId) {
          return prisma.presetPackDownload.upsert({
            where: {
              userId_packId: {
                userId,
                packId: item.packId,
              },
            },
            update: {}, // No updates needed if it exists
            create: {
              userId,
              packId: item.packId,
              amount: item.pack?.price || 0,
            },
          });
        }
        return null;
      })
    );
  
    // Cleanup cart using transaction
    await prisma.$transaction([
      prisma.cartItem.deleteMany({ where: { cartId } }),
      prisma.cart.delete({ where: { id: cartId } }),
    ]);
  
    return downloads;
  }