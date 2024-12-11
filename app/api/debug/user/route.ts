import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No session" }, { status: 401 });
    }

    // Check user by ID
    const userById = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        accounts: true,
        presetRequests: {
          take: 1, // Just get one to verify relationship
        },
      },
    });

    // Check user by email
    const userByEmail = await prisma.user.findUnique({
      where: { email: session.user.email! },
      include: {
        accounts: true,
        presetRequests: {
          take: 1,
        },
      },
    });

    return NextResponse.json({
      session: {
        ...session,
        user: {
          ...session.user,
          // Redact any sensitive info if needed
          email: session.user.email?.replace(/(?<=.{3}).(?=.*@)/g, "*"),
        },
      },
      dbUserById: userById
        ? {
            ...userById,
            email: userById.email?.replace(/(?<=.{3}).(?=.*@)/g, "*"),
          }
        : null,
      dbUserByEmail: userByEmail
        ? {
            ...userByEmail,
            email: userByEmail.email?.replace(/(?<=.{3}).(?=.*@)/g, "*"),
          }
        : null,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Debug route error:", error);
    return NextResponse.json(
      {
        error: "Server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
