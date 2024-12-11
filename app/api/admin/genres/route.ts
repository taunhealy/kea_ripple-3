import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Add debug logging
    console.log("Attempting to fetch genres for user:", userId);

    // Fetch all genres
    const genres = await prisma.genre.findMany({
      orderBy: {
        name: "asc",
      },
    });

    // Add debug logging
    console.log("Successfully fetched genres:", genres);

    return NextResponse.json(genres);
  } catch (error: any) {  // Add type annotation here
    console.error("[GENRES_GET] Detailed error:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name } = await request.json();

    // Validate input
    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Invalid genre name" },
        { status: 400 }
      );
    }

    // Check for existing genre
    const existing = await prisma.genre.findFirst({
      where: { name: name },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Genre already exists" },
        { status: 400 }
      );
    }

    // Create new genre
    const genre = await prisma.genre.create({
      data: {
        name,
        type: "CUSTOM",
        isSystem: false,
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
