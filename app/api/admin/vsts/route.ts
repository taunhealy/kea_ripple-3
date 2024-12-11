import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authOptions, isAdmin } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { VstType } from "@prisma/client";
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !(await isAdmin(session.user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const vsts = await prisma.vST.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(vsts);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch VSTs" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !(await isAdmin(session.user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name } = await request.json();
    // Convert the name to uppercase for enum consistency
    const vstName = name.toUpperCase();

    const vst = await prisma.vST.create({
      data: { name: vstName, type: VstType.VITAL },
    });
    return NextResponse.json(vst);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create VST" },
      { status: 500 }
    );
  }
}
