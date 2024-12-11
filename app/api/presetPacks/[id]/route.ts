import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the specific pack by ID
    const pack = await prisma.presetPackUpload.findUnique({
      where: {
        id: params.id
      },
      include: {
        presets: {
          include: {
            preset: {
              include: {
                genre: true,
                vst: true,
                soundDesigner: {
                  select: {
                    username: true,
                    profileImage: true,
                  },
                },
              },
            },
          },
        },
        soundDesigner: {
          select: {
            username: true,
            profileImage: true,
          },
        },
      },
    });

    if (!pack) {
      return NextResponse.json({ error: "Pack not found" }, { status: 404 });
    }

    return NextResponse.json(pack);
  } catch (error) {
    console.error("Error fetching preset pack:", error);
    return NextResponse.json(
      { error: "Failed to fetch preset pack" },
      { status: 500 }
    );
  }
}
