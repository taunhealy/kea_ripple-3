import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const results = await prisma.presetSubmission.findMany({
      include: {
        presetRequest: true,
        user: true,
      },
    });

    console.log("[DEBUG] Found submissions:", results.length);
    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch preset submissions" },
      { status: 500 }
    );
  }
}
