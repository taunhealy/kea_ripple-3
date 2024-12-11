import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // First check if the preset exists
    const preset = await prisma.presetUpload.findUnique({
      where: {
        id: params.id,
      },
      select: { id: true }
    });

    if (!preset) {
      return NextResponse.json(
        { error: "Preset not found" },
        { status: 404 }
      );
    }

    const priceHistory = await prisma.priceHistory.findMany({
      where: {
        presetId: params.id,
      },
      orderBy: {
        timestamp: "desc",
      },
      select: {
        price: true,
        timestamp: true,
      },
    });

    return NextResponse.json(priceHistory);
  } catch (error) {
    console.error("Error fetching price history:", error);
    return NextResponse.json(
      { error: "Failed to fetch price history" },
      { status: 500 }
    );
  }
}
