import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // @ts-ignore
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const presets = await prisma.presetUpload.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
        title: true,
        price: true,
        presetType: true,
        priceType: true,
        genre: {
          select: {
            name: true,
          },
        },
        vst: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(presets);
  } catch (error) {
    console.error("Error fetching user presets:", error);
    const errorMessage =
      process.env.NODE_ENV === "development"
        ? `Failed to fetch presets: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        : "Failed to fetch presets";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
