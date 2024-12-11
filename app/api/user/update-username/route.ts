import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { username } = await request.json();

    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    if (!usernameRegex.test(username)) {
      return NextResponse.json(
        { message: "Invalid username format" },
        { status: 400 }
      );
    }

    // Update in database
    await prisma.user.update({
      where: { id: session.user.id },
      data: { username },
    });

    return NextResponse.json({ message: "Username updated successfully" });
  } catch (error) {
    console.error("Error updating username:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
