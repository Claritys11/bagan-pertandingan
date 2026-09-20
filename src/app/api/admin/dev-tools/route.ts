import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getActiveTournament } from "@/lib/services/tournament.service";
import { getSession, canManageTournament } from "@/lib/auth/session";
import { lockBracket, emergencyOverrideBracket } from "@/lib/services/bracket.service";
import { submitMatchResult } from "@/lib/services/match.service";
import { TournamentStatus, MatchStatus } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !canManageTournament(session.role)) {
      return NextResponse.json({ error: "Unauthorized. Admin only." }, { status: 403 });
    }

    const tournament = await getActiveTournament();
    if (!tournament) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    const body = await req.json();
    const { action } = body;
    const actor = {
      id: session.userId,
      name: session.name || session.username,
      role: session.role,
    };

    if (action === "QUICK_FILL_DRAW") {
      // Fetch 32 teams and assign each to slots 1..32 sequentially or based on registered order
      const teams = await prisma.team.findMany({
        where: { tournamentId: tournament.id },
        orderBy: { name: "asc" },
        take: 32,
      });

      if (teams.length < 32) {
        return NextResponse.json({ error: "Need 32 registered teams to fill slots" }, { status: 400 });
      }

      for (let i = 0; i < 32; i++) {
        await prisma.bracketSlot.update({
          where: {
            tournamentId_slotNumber: {
              tournamentId: tournament.id,
              slotNumber: i + 1,
            },
          },
          data: { teamId: teams[i].id },
        });
      }

      return NextResponse.json({ success: true, message: "32 slot bagan berhasil diisi dari 32 tim resmi." });
    }

    if (action === "LOCK_BRACKET") {
      const locked = await lockBracket(tournament.id, actor);
      return NextResponse.json({ success: true, tournament: locked });
    }

    if (action === "SIMULATE_R32") {
      // Simulate results for matches 1..16
      const matches = await prisma.match.findMany({
        where: {
          tournamentId: tournament.id,
          round: "ROUND_OF_32",
          status: { not: "COMPLETED" },
        },
      });

      for (const m of matches) {
        if (m.teamAId && m.teamBId) {
          // Team A wins 2 - 0 or 2 - 1
          await submitMatchResult(
            m.id,
            {
              scoreA: 2,
              scoreB: 1,
              winnerId: m.teamAId,
              notes: "Simulasi skor hasil pertandingan Round of 32",
              confirmedOfficial: true,
            },
            actor
          );
        }
      }

      return NextResponse.json({ success: true, message: "Simulasi Round of 32 selesai!" });
    }

    if (action === "SIMULATE_CHAMPION") {
      // Progress all remaining matches until final champion
      const rounds = ["ROUND_OF_32", "ROUND_OF_16", "QUARTER_FINAL", "SEMI_FINAL", "FINAL"] as const;

      for (const round of rounds) {
        const matches = await prisma.match.findMany({
          where: {
            tournamentId: tournament.id,
            round,
            status: { not: "COMPLETED" },
          },
          orderBy: { matchNumber: "asc" },
        });

        for (const m of matches) {
          if (m.teamAId && m.teamBId) {
            await submitMatchResult(
              m.id,
              {
                scoreA: 2,
                scoreB: 0,
                winnerId: m.teamAId,
                notes: `Simulasi resmi ${round}`,
                confirmedOfficial: true,
              },
              actor
            );
          }
        }
      }

      return NextResponse.json({ success: true, message: "Simulasi turnamen hingga Champion selesai!" });
    }

    if (action === "RESET_DRAFT") {
      // Reset tournament back to clean setup
      await prisma.match.updateMany({
        where: { tournamentId: tournament.id },
        data: {
          teamAId: null,
          teamBId: null,
          winnerId: null,
          scoreA: 0,
          scoreB: 0,
          status: MatchStatus.DRAFT,
          scheduledAt: null,
          venueId: null,
          refereeId: null,
          pjId: null,
          observerId: null,
          resultConfirmedAt: null,
          resultConfirmedBy: null,
        },
      });

      await prisma.bracketSlot.updateMany({
        where: { tournamentId: tournament.id },
        data: { teamId: null },
      });

      await prisma.tournament.update({
        where: { id: tournament.id },
        data: {
          status: TournamentStatus.SETUP,
          bracketLockedAt: null,
          bracketLockedBy: null,
          championTeamId: null,
          runnerUpTeamId: null,
        },
      });

      return NextResponse.json({ success: true, message: "Bagan dan pertandingan berhasil direset ke DRAFT." });
    }

    return NextResponse.json({ error: "Unknown dev action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
