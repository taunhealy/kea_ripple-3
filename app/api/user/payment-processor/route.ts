import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { lemonSqueezyStoreId } = await req.json();

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { 
        lemonSqueezyStoreId,
        stripeAccountId: null // Remove Stripe connection
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating payment processor:", error);
    return NextResponse.json(
      { error: "Failed to update payment processor" },
      { status: 500 }
    );
  }
} 