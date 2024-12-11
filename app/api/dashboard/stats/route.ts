import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;

    // Get total sales amount from both preset and pack downloads
    const [presetSales, packSales] = await Promise.all([
      prisma.presetDownload.aggregate({
        where: {
          preset: {
            userId: userId,
          },
          amount: { gt: 0 }, // Only paid downloads
        },
        _sum: {
          amount: true,
        },
      }),
      prisma.presetPackDownload.aggregate({
        where: {
          pack: {
            userId: userId,
          },
          amount: { gt: 0 }, // Only paid downloads
        },
        _sum: {
          amount: true,
        },
      }),
    ]);

    // Get total number of downloads (both free and paid)
    const [totalPresets, totalPacks] = await Promise.all([
      prisma.presetDownload.count({
        where: {
          preset: {
            userId: userId,
          },
        },
      }),
      prisma.presetPackDownload.count({
        where: {
          pack: {
            userId: userId,
          },
        },
      }),
    ]);

    // Get 5 most recent sales (combining presets and packs)
    const recentPresetDownloads = await prisma.presetDownload.findMany({
      where: {
        preset: {
          userId: userId,
        },
        amount: { gt: 0 },
      },
      include: {
        preset: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    });

    const recentPackDownloads = await prisma.presetPackDownload.findMany({
      where: {
        pack: {
          userId: userId,
        },
        amount: { gt: 0 },
      },
      include: {
        pack: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    });

    // Combine and sort recent downloads
    const recentSales = [...recentPresetDownloads, ...recentPackDownloads]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 5);

    return NextResponse.json({
      totalSales:
        (presetSales._sum?.amount || 0) + (packSales._sum?.amount || 0),
      totalDownloads: totalPresets + totalPacks,
      recentSales,
    });
  } catch (error) {
    console.error("[DASHBOARD_STATS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
