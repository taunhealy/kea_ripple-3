import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const presetPackSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  price: z.number().min(5),
  priceType: z.enum(["FREE", "PREMIUM"]).default("PREMIUM"),
  presetIds: z
    .array(z.string())
    .length(5, "Pack must contain exactly 5 presets"),
  genre: z.string().min(1, "Genre is required"),
  vstId: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const validated = presetPackSchema.parse(data);

    // Create the preset pack with connections
    const pack = await prisma.presetPackUpload.create({
      data: {
        title: validated.title,
        description: validated.description,
        price: validated.price,
        priceType: validated.priceType,
        genreId: validated.genre,
        vstId: validated.vstId,
        tags: validated.tags,
        userId: session.user.id,
        presets: {
          create: validated.presetIds.map((presetId) => ({
            presetId,
            addedAt: new Date(),
          })),
        },
      },
      include: {
        presets: {
          include: {
            preset: true,
          },
        },
        user: {
          select: {
            username: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(pack);
  } catch (error) {
    console.error("Error creating preset pack:", error);
    return NextResponse.json(
      { error: "Failed to create preset pack" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userStatus = searchParams.get("userStatus");

    const where = {
      ...(userStatus === "UPLOADED"
        ? {
            userId: session.user.id,
          }
        : userStatus === "DOWNLOADED"
        ? {
            downloads: {
              some: {
                userId: session.user.id,
              },
            },
          }
        : {}),
    };

    const packs = await prisma.presetPackUpload.findMany({
      where,
      include: {
        presets: {
          include: {
            preset: {
              include: {
                genre: true,
                vst: true,
                user: {
                  select: {
                    username: true,
                    image: true,
                  },
                },
              },
            },
          },
        },
        user: {
          select: {
            username: true,
            image: true,
          },
        },
        downloads: {
          where: {
            userId: session.user.id,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(packs);
  } catch (error) {
    console.error("Error fetching preset packs:", error);
    return NextResponse.json(
      { error: "Failed to fetch preset packs" },
      { status: 500 }
    );
  }
}
