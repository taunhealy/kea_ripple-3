import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { ItemType } from "@prisma/client";
import { getServerSession } from "next-auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const itemType = searchParams.get("itemType") as ItemType;
    const view = searchParams.get("view");
    const searchTerm = searchParams.get("searchTerm") || "";
    const genres = searchParams.get("genres")?.split(",").filter(Boolean);
    const presetTypes = searchParams
      .get("presetTypes")
      ?.split(",")
      .filter(Boolean);
    const vstTypes = searchParams.get("vstTypes")?.split(",").filter(Boolean);
    const priceTypes = searchParams
      .get("priceTypes")
      ?.split(",")
      .filter(Boolean);

    // Get user session
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    // Check auth for personal views
    if ((view === "UPLOADED" || view === "DOWNLOADED") && !userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Build base where clause
    const whereClause: any = {
      // Add view-specific conditions first
      ...(view === "UPLOADED"
        ? { userId }
        : view === "DOWNLOADED"
        ? {
            downloads: {
              some: {
                userId,
              },
            },
          }
        : {}),

      // Add search term conditions
      ...(searchTerm && {
        OR: [
          { title: { contains: searchTerm, mode: "insensitive" as const } },
          { tags: { has: searchTerm } },
          {
            description: { contains: searchTerm, mode: "insensitive" as const },
          },
        ],
      }),

      // Add other filters
      ...(genres?.length && {
        genreId: { in: genres },
      }),
      ...(presetTypes?.length && {
        presetType: { in: presetTypes },
      }),
      ...(vstTypes?.length && {
        vstId: { in: vstTypes },
      }),
      ...(priceTypes?.length && {
        priceType: { in: priceTypes },
      }),
    };

    console.log(
      "Search query whereClause:",
      JSON.stringify(whereClause, null, 2)
    );

    const skip = (page - 1) * pageSize;

    console.log("[DEBUG] Search params:", {
      page,
      pageSize,
      itemType,
      view,
      searchParams: Object.fromEntries(searchParams),
    });

    console.log("[DEBUG] Final whereClause:", whereClause);

    switch (itemType) {
      case ItemType.PRESET:
        const items = await prisma.presetUpload.findMany({
          where: whereClause,
          include: {
            Genre: {
              select: {
                id: true,
                name: true
              }
            },
            vst: {
              select: {
                id: true,
                name: true
              }
            },
            User: {
              select: {
                username: true,
                image: true
              }
            }
          },
          orderBy: {
            createdAt: "desc"
          },
          take: pageSize,
          skip: skip
        });

        console.log("[DEBUG] Found presets:", {
          count: items.length,
          firstPreset: items[0],
          totalPresets: await prisma.presetUpload.count({ where: whereClause }),
        });

        // Simplified response to match what ContentExplorer expects
        return NextResponse.json(items);

      case ItemType.PACK:
        const packs = await prisma.presetPackUpload.findMany({
          where: whereClause,
          include: {
            PackPresets: {
              include: {
                PresetUpload: {
                  include: {
                    Genre: true,
                    vst: true,
                    User: {
                      select: {
                        username: true,
                        image: true,
                      },
                    },
                  },
                },
              },
            },
            User: {
              select: {
                username: true,
                image: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: pageSize,
          skip: skip
        });
        return NextResponse.json(packs);

      default:
        return NextResponse.json(
          { error: "Invalid item type" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch content" },
      { status: 500 }
    );
  }
}
