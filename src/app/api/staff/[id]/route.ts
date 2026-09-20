import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const staff = await prisma.staff.findUnique({
      where: { id },
      include: {
        refereeMatches: {
          include: { teamA: true, teamB: true, venue: true },
          orderBy: { scheduledAt: "asc" },
        },
        pjMatches: {
          include: { teamA: true, teamB: true, venue: true },
          orderBy: { scheduledAt: "asc" },
        },
        observerMatches: {
          include: { teamA: true, teamB: true, venue: true },
          orderBy: { scheduledAt: "asc" },
        },
      },
    });

    if (!staff) {
      return NextResponse.json({ error: "Staff not found" }, { status: 404 });
    }

    return NextResponse.json({ staff });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
