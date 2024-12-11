import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const vsts = await prisma.vST.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(vsts);
  } catch (error) {
    console.error("Error fetching VSTs:", error);
    return NextResponse.json(
      { error: "Failed to fetch VSTs" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name } = await request.json();
    const vst = await prisma.vST.create({
      data: { name },
    });
    return NextResponse.json(vst);
  } catch (error) {
    console.error("Error creating VST:", error);
    return NextResponse.json(
      { error: "Failed to create VST" },
      { status: 500 }
    );
  }
}
