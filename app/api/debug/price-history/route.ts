import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Get all price history records
    const priceHistoryRecords = await prisma.priceHistory.findMany({
      include: {
        preset: {
          select: { title: true }
        },
        cartItem: {
          select: { 
            id: true,
            preset: {
              select: { title: true }
            }
          }
        }
      },
      orderBy: {
        timestamp: 'desc'
      }
    });

    // Get direct preset price histories
    const presetPriceHistories = await prisma.presetUpload.findMany({
      where: {
        priceHistory: {
          some: {}
        }
      },
      select: {
        id: true,
        title: true,
        price: true,
        priceHistory: {
          orderBy: {
            timestamp: 'desc'
          }
        }
      }
    });

    return NextResponse.json({
      priceHistoryCount: priceHistoryRecords.length,
      priceHistoryRecords,
      presetPriceHistoriesCount: presetPriceHistories.length,
      presetPriceHistories
    });
  } catch (error) {
    console.error("Debug endpoint error:", error);
    return NextResponse.json({ error: "Failed to fetch debug data" }, { status: 500 });
  }
}
