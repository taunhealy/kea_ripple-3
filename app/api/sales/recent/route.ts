import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const data = await prisma.order.findMany({
      select: {
        id: true,
        amount: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            image: true,
            email: true,
          },
        },
      },
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 7,
    });

    // Format the data for the frontend
    const formattedData = data.map((order) => ({
      id: order.id,
      amount: order.amount,
      user: {
        name: order.user.name,
        profileImage: order.user.image,
        email: order.user.email,
      },
    }));

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("[RECENT_SALES_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
