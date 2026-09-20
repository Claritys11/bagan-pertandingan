import { prisma } from "@/lib/prisma";
import { MatchStatus, MatchRound, TournamentStatus, NextMatchSlot } from "@prisma/client";
import { createAuditLog } from "./audit.service";
import { broadcastTournamentEvent } from "@/lib/realtime/broadcast";

export interface MatchFilterOptions {
  round?: MatchRound;
  status?: MatchStatus;
  date?: string;
  venueId?: string;
  teamId?: string;
  search?: string;
}

export async function getMatches(tournamentId: string, filters?: MatchFilterOptions) {
  return await prisma.match.findMany({
    where: {
      tournamentId,
      ...(filters?.round ? { round: filters.round } : {}),
      ...(filters?.status ? { status: filters.status } : {}),
      ...(filters?.venueId ? { venueId: filters.venueId } : {}),
      ...(filters?.teamId
        ? {
            OR: [{ teamAId: filters.teamId }, { teamBId: filters.teamId }],
          }
        : {}),
      ...(filters?.search
        ? {
            OR: [
              { matchCode: { contains: filters.search, mode: "insensitive" } },
              { teamA: { name: { contains: filters.search, mode: "insensitive" } } },
              { teamB: { name: { contains: filters.search, mode: "insensitive" } } },
            ],
          }
        : {}),
    },
    include: {
      teamA: {
        include: { players: true },
      },
      teamB: {
        include: { players: true },
      },
      winner: true,
      venue: true,
      referee: true,
      pj: true,
      observer: true,
      nextMatch: true,
    },
    orderBy: {
      matchNumber: "asc",
    },
  });
}

export async function getMatchById(matchId: string) {
  return await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      tournament: true,
      teamA: {
        include: { players: true },
      },
      teamB: {
        include: { players: true },
      },
      winner: true,
      venue: true,
      referee: true,
      pj: true,
      observer: true,
      nextMatch: {
        include: {
          teamA: true,
          teamB: true,
        },
      },
      previousMatches: {
        include: {
          teamA: true,
          teamB: true,
          winner: true,
        },
      },
    },
  });
}

export async function updateMatchStatus(
  matchId: string,
  newStatus: MatchStatus,
  actor: { name: string; role: string; id?: string },
  notes?: string
) {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { tournament: true },
  });

  if (!match) {
    throw new Error("Match not found");
  }

  const oldStatus = match.status;

  const updatedMatch = await prisma.match.update({
    where: { id: matchId },
    data: {
      status: newStatus,
      ...(notes ? { internalNotes: notes } : {}),
    },
    include: {
      teamA: true,
      teamB: true,
      venue: true,
    },
  });

  // If match becomes LIVE and tournament is not yet LIVE, transition tournament to LIVE
  if (newStatus === MatchStatus.LIVE && match.tournament.status !== TournamentStatus.LIVE) {
    await prisma.tournament.update({
      where: { id: match.tournamentId },
      data: { status: TournamentStatus.LIVE },
    });
  }

  await createAuditLog({
    tournamentId: match.tournamentId,
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    action: "MATCH_STATUS_CHANGED",
    entityType: "MATCH",
    entityId: matchId,
    details: {
      matchCode: match.matchCode,
      oldStatus,
      newStatus,
      notes,
    },
    isPublic: true,
  });

  broadcastTournamentEvent("MATCH_UPDATED", match.tournamentId, {
    matchId,
    matchCode: match.matchCode,
    status: newStatus,
    updatedMatch,
  });

  return updatedMatch;
}

export interface SubmitResultInput {
  scoreA: number;
  scoreB: number;
  winnerId: string;
  notes?: string;
  confirmedOfficial: boolean;
}

export async function submitMatchResult(
  matchId: string,
  input: SubmitResultInput,
  actor: { name: string; role: string; id?: string }
) {
  if (!input.confirmedOfficial) {
    throw new Error("Konfirmasi hasil resmi wajib dicentang sebelum submit.");
  }

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      tournament: true,
      teamA: true,
      teamB: true,
      nextMatch: true,
    },
  });

  if (!match) {
    throw new Error("Pertandingan tidak ditemukan.");
  }

  if (!match.teamAId || !match.teamBId) {
    throw new Error("Pertandingan belum memiliki 2 tim yang bertanding.");
  }

  if (input.winnerId !== match.teamAId && input.winnerId !== match.teamBId) {
    throw new Error("Pemenang yang dipilih tidak valid untuk pertandingan ini.");
  }

  if (input.scoreA < 0 || input.scoreB < 0) {
    throw new Error("Skor tidak boleh negatif.");
  }

  if (input.winnerId === match.teamAId && input.scoreA <= input.scoreB) {
    throw new Error("Skor Tim A harus lebih tinggi daripada Tim B jika Tim A dinyatakan sebagai pemenang.");
  }

  if (input.winnerId === match.teamBId && input.scoreB <= input.scoreA) {
    throw new Error("Skor Tim B harus lebih tinggi daripada Tim A jika Tim B dinyatakan sebagai pemenang.");
  }

  return await prisma.$transaction(async (tx) => {
    // 1. Update Match to COMPLETED
    const completedMatch = await tx.match.update({
      where: { id: matchId },
      data: {
        scoreA: input.scoreA,
        scoreB: input.scoreB,
        winnerId: input.winnerId,
        status: MatchStatus.COMPLETED,
        resultConfirmedAt: new Date(),
        resultConfirmedBy: actor.name,
        publicNotes: input.notes,
      },
      include: {
        teamA: true,
        teamB: true,
        winner: true,
      },
    });

    // 2. Automated Winner Progression
    let progressionInfo: any = null;

    if (match.nextMatchId && match.nextMatchSlot) {
      const updateData: any = {};
      if (match.nextMatchSlot === NextMatchSlot.TEAM_A) {
        updateData.teamAId = input.winnerId;
      } else if (match.nextMatchSlot === NextMatchSlot.TEAM_B) {
        updateData.teamBId = input.winnerId;
      }

      const updatedNextMatch = await tx.match.update({
        where: { id: match.nextMatchId },
        data: updateData,
        include: {
          teamA: true,
          teamB: true,
        },
      });

      // If both teams in nextMatch are now known, transition status to READY if currently DRAFT or SCHEDULED
      if (
        updatedNextMatch.teamAId &&
        updatedNextMatch.teamBId &&
        (updatedNextMatch.status === MatchStatus.DRAFT || updatedNextMatch.status === MatchStatus.SCHEDULED)
      ) {
        await tx.match.update({
          where: { id: match.nextMatchId },
          data: { status: MatchStatus.READY },
        });
      }

      progressionInfo = {
        advancedToMatchId: match.nextMatchId,
        slot: match.nextMatchSlot,
        winnerTeam: completedMatch.winner?.name,
      };
    } else if (match.round === MatchRound.FINAL) {
      // Grand Final Finished! Tournament Completed!
      const runnerUpId = input.winnerId === match.teamAId ? match.teamBId : match.teamAId;

      await tx.tournament.update({
        where: { id: match.tournamentId },
        data: {
          status: TournamentStatus.COMPLETED,
          championTeamId: input.winnerId,
          runnerUpTeamId: runnerUpId,
        },
      });

      progressionInfo = {
        tournamentCompleted: true,
        championId: input.winnerId,
        championName: completedMatch.winner?.name,
        runnerUpId,
      };
    }

    // 3. Create Audit Log
    await tx.auditLog.create({
      data: {
        tournamentId: match.tournamentId,
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        action: "RESULT_SUBMITTED",
        entityType: "MATCH",
        entityId: matchId,
        details: {
          matchCode: match.matchCode,
          scoreA: input.scoreA,
          scoreB: input.scoreB,
          teamAName: completedMatch.teamA?.name,
          teamBName: completedMatch.teamB?.name,
          winnerName: completedMatch.winner?.name,
          progression: progressionInfo,
          confirmedBy: actor.name,
        },
        isPublic: true,
      },
    });

    // 4. Broadcast Realtime Updates
    broadcastTournamentEvent("RESULT_SUBMITTED", match.tournamentId, {
      matchId,
      matchCode: match.matchCode,
      scoreA: input.scoreA,
      scoreB: input.scoreB,
      winner: completedMatch.winner,
      progression: progressionInfo,
    });

    broadcastTournamentEvent("BRACKET_UPDATED", match.tournamentId, {
      matchId,
      winnerId: input.winnerId,
      progression: progressionInfo,
    });

    return {
      match: completedMatch,
      progression: progressionInfo,
    };
  });
}
