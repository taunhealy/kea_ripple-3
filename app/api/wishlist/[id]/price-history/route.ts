import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { itemId: string } }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const priceHistory = await prisma.priceHistory.findMany({
    where: {
      cartItemId: params.itemId,
    },
    orderBy: { timestamp: "desc" },
  });

  return NextResponse.json(priceHistory);
}
