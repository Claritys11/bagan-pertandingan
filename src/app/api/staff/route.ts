import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getActiveTournament } from "@/lib/services/tournament.service";
import { getSession, canManageStaff } from "@/lib/auth/session";

export async function GET() {
  try {
    const tournament = await getActiveTournament();
    if (!tournament) {
      return NextResponse.json({ staff: [] });
    }

    const staff = await prisma.staff.findMany({
      where: { tournamentId: tournament.id },
      include: {
        refereeMatches: {
          orderBy: { scheduledAt: "asc" },
          include: { teamA: true, teamB: true, venue: true },
        },
        pjMatches: {
          orderBy: { scheduledAt: "asc" },
          include: { teamA: true, teamB: true, venue: true },
        },
        observerMatches: {
          orderBy: { scheduledAt: "asc" },
          include: { teamA: true, teamB: true, venue: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ tournament, staff });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !canManageStaff(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const tournament = await getActiveTournament();
    if (!tournament) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    const body = await req.json();
    const { name, displayName, role, phone, email, notes } = body;

    const newStaff = await prisma.staff.create({
      data: {
        tournamentId: tournament.id,
        name,
        displayName: displayName || name,
        role,
        phone,
        email,
        notes,
      },
    });

    return NextResponse.json({ success: true, staff: newStaff });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
