import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const submissionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  guide: z.string().optional(),
  soundPreviewUrl: z.string().optional(),
  presetFileUrl: z.string().optional(),
  presetType: z.string(),
  vstId: z.string().optional(),
  price: z.number().optional(),
  priceType: z.enum(["FREE", "PREMIUM"]).default("FREE"),
});

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const validated = submissionSchema.parse(data);

    const submission = await prisma.presetSubmission.create({
      data: {
        ...validated,
        userId: session.user.id,
        presetRequestId: params.id,
      },
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
    });

    return NextResponse.json(submission);
  } catch (error) {
    console.error("Error creating submission:", error);
    return NextResponse.json(
      { error: "Failed to create submission" },
      { status: 500 }
    );
  }
}
