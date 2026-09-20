import { prisma } from "@/lib/prisma";
import { TournamentStatus } from "@prisma/client";
import { createAuditLog } from "./audit.service";
import { broadcastTournamentEvent } from "@/lib/realtime/broadcast";

export async function getActiveTournament() {
  let tournament = await prisma.tournament.findFirst({
    where: {
      status: {
        not: TournamentStatus.ARCHIVED,
      },
    },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          teams: true,
          matches: true,
          staff: true,
          venues: true,
        },
      },
    },
  });

  if (!tournament) {
    tournament = await prisma.tournament.findFirst({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            teams: true,
            matches: true,
            staff: true,
            venues: true,
          },
        },
      },
    });
  }

  return tournament;
}

export async function getTournamentMetrics(tournamentId: string) {
  const [
    tournament,
    totalTeams,
    completedMatches,
    liveMatches,
    scheduledMatches,
    venuesCount,
    staffCount,
  ] = await Promise.all([
    prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        teams: {
          where: {
            id: { in: [] }, // placeholder
          },
        },
      },
    }),
    prisma.team.count({ where: { tournamentId } }),
    prisma.match.count({ where: { tournamentId, status: "COMPLETED" } }),
    prisma.match.count({ where: { tournamentId, status: "LIVE" } }),
    prisma.match.count({ where: { tournamentId, status: "SCHEDULED" } }),
    prisma.venue.count({ where: { tournamentId } }),
    prisma.staff.count({ where: { tournamentId } }),
  ]);

  let championTeam = null;
  let runnerUpTeam = null;

  if (tournament?.championTeamId) {
    championTeam = await prisma.team.findUnique({
      where: { id: tournament.championTeamId },
    });
  }

  if (tournament?.runnerUpTeamId) {
    runnerUpTeam = await prisma.team.findUnique({
      where: { id: tournament.runnerUpTeamId },
    });
  }

  return {
    tournament,
    totalTeams,
    totalMatches: 31,
    completedMatches,
    liveMatches,
    scheduledMatches,
    venuesCount,
    staffCount,
    progressPercentage: Math.round((completedMatches / 31) * 100),
    championTeam,
    runnerUpTeam,
  };
}

export async function updateTournamentStatus(
  tournamentId: string,
  newStatus: TournamentStatus,
  actor: { name: string; role: string; id?: string }
) {
  const tournament = await prisma.tournament.update({
    where: { id: tournamentId },
    data: { status: newStatus },
  });

  await createAuditLog({
    tournamentId,
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    action: "TOURNAMENT_STATUS_CHANGED",
    entityType: "TOURNAMENT",
    entityId: tournamentId,
    details: {
      newStatus,
    },
    isPublic: true,
  });

  broadcastTournamentEvent("TOURNAMENT_STATUS_CHANGED", tournamentId, {
    status: newStatus,
  });

  return tournament;
}
