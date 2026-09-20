import { NextRequest, NextResponse } from "next/server";
import { getActiveTournament } from "@/lib/services/tournament.service";
import { getTeams, createTeam } from "@/lib/services/team.service";
import { getSession, canManageTournament } from "@/lib/auth/session";

export async function GET() {
  try {
    const tournament = await getActiveTournament();
    if (!tournament) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    const teams = await getTeams(tournament.id);
    return NextResponse.json({ tournament, teams });
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
    const actor = {
      id: session.userId,
      name: session.name || session.username,
      role: session.role,
    };

    const team = await createTeam(tournament.id, body, actor);
    return NextResponse.json({ success: true, team });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
