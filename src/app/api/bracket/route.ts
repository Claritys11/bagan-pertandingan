import { NextRequest, NextResponse } from "next/server";
import { getActiveTournament } from "@/lib/services/tournament.service";
import {
  getBracketSlots,
  validateBracket,
  assignTeamToSlot,
  lockBracket,
  emergencyOverrideBracket,
} from "@/lib/services/bracket.service";
import { getSession, canManageBracket, canManageTournament } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  try {
    const tournament = await getActiveTournament();
    if (!tournament) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    const [slots, validation] = await Promise.all([
      getBracketSlots(tournament.id),
      validateBracket(tournament.id),
    ]);

    return NextResponse.json({
      tournament,
      slots,
      validation,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !canManageBracket(session.role)) {
      return NextResponse.json(
        { error: "Unauthorized. Memerlukan hak akses Tournament Admin atau Director." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { action, tournamentId, slotNumber, teamId, reason } = body;

    const actor = {
      id: session.userId,
      name: session.name || session.username,
      role: session.role,
    };

    if (action === "ASSIGN") {
      const updatedSlot = await assignTeamToSlot(
        tournamentId,
        Number(slotNumber),
        teamId ? String(teamId) : null,
        actor
      );
      return NextResponse.json({ success: true, slot: updatedSlot });
    }

    if (action === "LOCK") {
      const locked = await lockBracket(tournamentId, actor);
      return NextResponse.json({ success: true, tournament: locked });
    }

    if (action === "OVERRIDE") {
      if (!canManageTournament(session.role)) {
        return NextResponse.json(
          { error: "Emergency override hanya dapat dilakukan oleh TOURNAMENT_ADMIN." },
          { status: 403 }
        );
      }
      const overridden = await emergencyOverrideBracket(tournamentId, reason, actor);
      return NextResponse.json({ success: true, tournament: overridden });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
