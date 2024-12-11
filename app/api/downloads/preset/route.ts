import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await request.json();

    // Verify the preset exists and is free
    const preset = await prisma.presetUpload.findUnique({
      where: { id },
    });

    if (!preset) {
      return NextResponse.json({ error: "Preset not found" }, { status: 404 });
    }

    if (preset.priceType !== "FREE") {
      return NextResponse.json(
        { error: "Preset is not free" },
        { status: 403 }
      );
    }

    // Before creating a PresetDownload
    const existingDownload = await prisma.presetDownload.findUnique({
      where: {
        userId_presetId: {
          userId: session.user.id,
          presetId: id,
        },
      },
    });

    if (!existingDownload) {
      await prisma.presetDownload.create({
        data: {
          userId: session.user.id,
          presetId: id,
          amount: preset?.price || 0,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error downloading preset:", error);
    return NextResponse.json(
      { error: "Failed to process download" },
      { status: 500 }
    );
  }
}
