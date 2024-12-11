import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ItemType } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") as ItemType;

    if (!type || !Object.values(ItemType).includes(type)) {
      return NextResponse.json({ error: "Invalid item type" }, { status: 400 });
    }

    // Get all unique tags for the specified item type
    let tags: string[] = [];

    if (type === ItemType.PRESET) {
      const presets = await prisma.presetUpload.findMany({
        select: {
          tags: true,
        },
      });
      tags = [...new Set(presets.flatMap((preset) => preset.tags || []))];
    } else if (type === ItemType.PACK) {
      const packs = await prisma.presetPackUpload.findMany({
        select: {
          tags: true,
        },
      });
      tags = [...new Set(packs.flatMap((pack) => pack.tags || []))];
    }

    return NextResponse.json(tags);
  } catch (error) {
    console.error("Error fetching tags:", error);
    return NextResponse.json(
      { error: "Failed to fetch tags" },
      { status: 500 }
    );
  }
}
