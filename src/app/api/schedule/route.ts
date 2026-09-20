import { NextRequest, NextResponse } from "next/server";
import { getActiveTournament } from "@/lib/services/tournament.service";
import { updateMatchSchedule, detectSchedulingConflicts } from "@/lib/services/schedule.service";
import { getMatches } from "@/lib/services/match.service";
import { getSession, canManageSchedule } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  try {
    const tournament = await getActiveTournament();
    if (!tournament) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    const matches = await getMatches(tournament.id);

    return NextResponse.json({
      tournament,
      matches,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !canManageSchedule(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { matchId, scheduledAt, venueId, refereeId, pjId, observerId, streamUrl, allowOverrideConflicts } = body;

    const actor = {
      id: session.userId,
      name: session.name || session.username,
      role: session.role,
    };

    const updated = await updateMatchSchedule(
      matchId,
      {
        scheduledAt,
        venueId,
        refereeId,
        pjId,
        observerId,
        streamUrl,
        allowOverrideConflicts,
      },
      actor
    );

    return NextResponse.json({ success: true, match: updated });
  } catch (err: any) {
    return NextResponse.json(
      {
        error: err.message,
        conflicts: err.conflicts ?? [],
      },
      { status: 400 }
    );
  }
}
