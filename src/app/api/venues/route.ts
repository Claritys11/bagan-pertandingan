import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getActiveTournament } from "@/lib/services/tournament.service";
import { getSession, canManageTournament } from "@/lib/auth/session";

export async function GET() {
  try {
    const tournament = await getActiveTournament();
    if (!tournament) {
      return NextResponse.json({ venues: [] });
    }

    const venues = await prisma.venue.findMany({
      where: { tournamentId: tournament.id },
      include: {
        matches: {
          where: {
            status: { in: ["READY", "LIVE", "SCHEDULED"] },
          },
          orderBy: { scheduledAt: "asc" },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ tournament, venues });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !canManageTournament(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const tournament = await getActiveTournament();
    if (!tournament) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    const body = await req.json();
    const { name, location, capacity, notes } = body;

    const venue = await prisma.venue.create({
      data: {
        tournamentId: tournament.id,
        name,
        location,
        capacity: Number(capacity) || 10,
        notes,
      },
    });

    return NextResponse.json({ success: true, venue });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
