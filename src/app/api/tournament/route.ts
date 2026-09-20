import { NextResponse } from "next/server";
import { getActiveTournament, getTournamentMetrics } from "@/lib/services/tournament.service";

export async function GET() {
  try {
    const tournament = await getActiveTournament();
    if (!tournament) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    const metrics = await getTournamentMetrics(tournament.id);

    return NextResponse.json({
      tournament,
      metrics,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
