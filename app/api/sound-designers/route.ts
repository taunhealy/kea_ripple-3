import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locations = searchParams.get("locations")?.split(",") || [];
  const priceRange = searchParams.get("priceRange");
  const minEditedPhotos = searchParams.get("minEditedPhotos");
  const minShootingHours = searchParams.get("minShootingHours");
  const maxTurnaroundDays = searchParams.get("maxTurnaroundDays");

  const photographers = await prisma.photographer.findMany({
    where: {
      location: locations.length > 0 ? { in: locations } : undefined,
      priceRange: priceRange || undefined,
      packages: {
        some: {
          editedPhotos: minEditedPhotos
            ? { gte: parseInt(minEditedPhotos) }
            : undefined,
          shootingHours: minShootingHours
            ? { gte: parseInt(minShootingHours) }
            : undefined,
          turnaroundDays: maxTurnaroundDays
            ? { lte: parseInt(maxTurnaroundDays) }
            : undefined,
        },
      },
    },
    include: {
      packages: true,
    },
  });

  return NextResponse.json(photographers);
}
