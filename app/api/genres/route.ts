import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

// Validation schema
const genreSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["SYSTEM", "CUSTOM"]).default("CUSTOM"),
});

export async function GET() {
  try {
    const genres = await prisma.genre.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        type: true,
        isSystem: true,
      },
    });

    return NextResponse.json(genres);
  } catch (error) {
    console.error("Error fetching genres:", error);
    return NextResponse.json(
      { error: "Failed to fetch genres" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = genreSchema.parse(body);

    // Check for existing genre
    const existing = await prisma.genre.findFirst({
      where: { name: validatedData.name.trim() },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Genre already exists" },
        { status: 400 }
      );
    }

    const genre = await prisma.genre.create({
      data: {
        name: validatedData.name.trim(),
        type: validatedData.type,
        isSystem: false,
      },
    });

    return NextResponse.json(genre);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating genre:", error);
    return NextResponse.json(
      { error: "Failed to create genre" },
      { status: 500 }
    );
  }
}
