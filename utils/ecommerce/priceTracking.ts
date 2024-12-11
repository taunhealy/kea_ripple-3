import prisma from "@/lib/prisma";
import { PriceType } from "@prisma/client";

interface PriceChange {
  presetId?: string;
  packId?: string;
  oldPrice: number | null;
  newPrice: number | null;
  oldPriceType: PriceType;
  newPriceType: PriceType;
  percentageChange?: number;
}

export async function trackPriceChange(
  id: string,
  type: "PRESET" | "PRESET_PACK",
  newPrice: number
) {
  console.log(
    `[PriceTracking] Starting price change for ${type} ${id} to ${newPrice}`
  );

  return await prisma.$transaction(async (tx) => {
    // Get current price history
    const currentHistory = await tx.priceHistory.findFirst({
      where: type === "PRESET" ? { preset: { id } } : { pack: { id } },
      orderBy: { timestamp: "desc" },
    });

    console.log("[PriceTracking] Current history:", currentHistory);

    // Only create new entry if price changed or no history exists
    if (!currentHistory || Number(currentHistory.price) !== newPrice) {
      const priceHistoryEntry = await tx.priceHistory.create({
        data:
          type === "PRESET"
            ? { preset: { connect: { id } }, price: newPrice }
            : { pack: { connect: { id } }, price: newPrice },
      });

      console.log(
        "[PriceTracking] Created new price history:",
        priceHistoryEntry
      );

      // Find all cart items containing this preset/pack
      const cartItems = await tx.cartItem.findMany({
        where:
          type === "PRESET"
            ? { itemType: "PRESET", presetId: id }
            : { itemType: "PACK", packId: id },
        include: {
          cart: true,
          priceHistory: {
            orderBy: { timestamp: "desc" },
            take: 1,
          },
        },
      });

      console.log(
        `[PriceTracking] Found ${cartItems.length} cart items to update`
      );

      // Update cart item price histories
      for (const item of cartItems) {
        const lastPrice = item.priceHistory?.[0]?.price;

        if (!lastPrice || Number(lastPrice) !== newPrice) {
          const cartItemHistory = await tx.priceHistory.create({
            data: {
              cartItemId: item.id,
              price: newPrice,
            },
          });
          console.log(
            `[PriceTracking] Created cart item price history:`,
            cartItemHistory
          );
        }
      }

      return cartItems;
    } else {
      console.log("[PriceTracking] No price change detected, skipping update");
      return [];
    }
  });
}
