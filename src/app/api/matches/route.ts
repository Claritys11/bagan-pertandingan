import { NextRequest, NextResponse } from "next/server";
import { getActiveTournament } from "@/lib/services/tournament.service";
import { getMatches, MatchFilterOptions } from "@/lib/services/match.service";
import { MatchRound, MatchStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const tournament = await getActiveTournament();
    if (!tournament) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    const filters: MatchFilterOptions = {
      round: searchParams.get("round") as MatchRound | undefined,
      status: searchParams.get("status") as MatchStatus | undefined,
      date: searchParams.get("date") || undefined,
      venueId: searchParams.get("venueId") || undefined,
      teamId: searchParams.get("teamId") || undefined,
      search: searchParams.get("search") || undefined,
    };

    const matches = await getMatches(tournament.id, filters);

    return NextResponse.json({
      tournament,
      matches,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
