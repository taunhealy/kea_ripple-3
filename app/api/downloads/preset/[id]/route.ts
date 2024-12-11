import { NextResponse } from "next/server";
import prismaClient from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const preset = await prismaClient.presetUpload.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        presetFileUrl: true,
        originalFileName: true,
        title: true,
      },
    });

    if (!preset) {
      return new NextResponse(JSON.stringify({ error: "Preset not found" }), {
        status: 404,
      });
    }

    if (!preset.presetFileUrl) {
      return new NextResponse(
        JSON.stringify({ error: "No file URL available" }),
        { status: 404 }
      );
    }

    return NextResponse.json({
      downloadUrl: preset.presetFileUrl,
      filename:
        preset.originalFileName ||
        `${preset.title}.preset` ||
        `preset_${preset.id}.preset`,
    });
  } catch (error) {
    console.error("[DOWNLOAD_PRESET] Error:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
}
