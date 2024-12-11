import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

enum GenreType {
  SYSTEM = "SYSTEM",
  CUSTOM = "CUSTOM",
}

// Add this helper function at the top
function isSystemGenre(name: string): boolean {
  return Object.values(GenreType).includes(name as GenreType);
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json();

    // Check if genre already exists
    const existingGenre = await prisma.genre.findFirst({
      where: { name },
    });

    if (existingGenre) {
      return NextResponse.json(existingGenre);
    }

    // Determine if it's a system genre
    const isSystem = isSystemGenre(name);

    // Create new genre
    const genre = await prisma.genre.create({
      data: {
        name,
        type: isSystem ? (name as GenreType) : GenreType.CUSTOM,
        isSystem,
      },
    });

    return NextResponse.json(genre);
  } catch (error) {
    console.error("Error creating genre:", error);
    return NextResponse.json(
      { error: "Failed to create genre" },
      { status: 500 }
    );
  }
}
