import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

// Validation schema for preset request
const presetRequestSchema = z.object({
  title: z.string().min(1, "Title is required"),
  youtubeLink: z.string().optional().nullable(),
  genreId: z.string().min(1, "Genre is required"),
  enquiryDetails: z.string().min(1, "Enquiry details are required"),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.log("No session or user ID:", session);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found. Please sign in again." },
        { status: 404 }
      );
    }

    const body = await request.json();
    console.log("Received request body:", body);

    // Validate request data using safeParse
    const validation = presetRequestSchema.safeParse(body);

    if (!validation.success) {
      console.log("Validation errors:", validation.error.format());
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.format() },
        { status: 400 }
      );
    }

    const validatedData = validation.data;
    console.log("Validated data:", validatedData);

    // Create the preset request with the user (either found or newly created)
    const presetRequest = await prisma.presetRequest.create({
      data: {
        userId: user.id,
        title: validatedData.title,
        youtubeLink: validatedData.youtubeLink,
        genreId: validatedData.genreId,
        enquiryDetails: validatedData.enquiryDetails,
        status: "OPEN",
      },
      include: {
        genre: true,
        user: {
          select: {
            username: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(presetRequest);
  } catch (error) {
    console.error("Full error details:", error);
    return NextResponse.json(
      {
        error: "Failed to create preset request",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
