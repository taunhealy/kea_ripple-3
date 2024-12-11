import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Fetch data
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const preset = await prisma.presetUpload.findUnique({
      where: { id: params.id },
      include: {
        genre: true,
        vst: true,
        user: {
          select: {
            id: true,
            username: true,
            image: true,
          },
        },
      },
    });

    if (!preset) {
      return NextResponse.json({ error: "Preset not found" }, { status: 404 });
    }

    // Check if user is authorized to edit (should be the creator)
    if (preset.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json(preset);
  } catch (error) {
    console.error("Error fetching preset:", error);
    return NextResponse.json(
      { error: "Failed to fetch preset" },
      { status: 500 }
    );
  }
}

// Edit data
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    // Verify ownership
    const existingPreset = await prisma.presetUpload.findUnique({
      where: { id: params.id },
    });

    if (!existingPreset || existingPreset.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Update the preset
    const updatedPreset = await prisma.presetUpload.update({
      where: {
        id: params.id,
      },
      data: {
        title: data.title,
        description: data.description,
        guide: data.guide,
        spotifyLink: data.spotifyLink,
        genreId: data.genreId,
        vstId: data.vstId,
        priceType: data.priceType,
        presetType: data.presetType,
        price: data.price,
        presetFileUrl: data.presetFileUrl,
        originalFileName: data.originalFileName,
        soundPreviewUrl: data.soundPreviewUrl,
      },
      include: {
        genre: true,
        vst: true,
        user: {
          select: {
            id: true,
            username: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(updatedPreset);
  } catch (error) {
    console.error("Error updating preset:", error);
    return NextResponse.json(
      { error: "Failed to update preset" },
      { status: 500 }
    );
  }
}

// Delete data
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify ownership
    const existingPreset = await prisma.presetUpload.findUnique({
      where: { id: params.id },
    });

    if (!existingPreset || existingPreset.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Delete the preset
    await prisma.presetUpload.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ message: "Preset deleted successfully" });
  } catch (error) {
    console.error("Error deleting preset:", error);
    return NextResponse.json(
      { error: "Failed to delete preset" },
      { status: 500 }
    );
  }
}
