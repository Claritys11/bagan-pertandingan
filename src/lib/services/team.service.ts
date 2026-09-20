import { prisma } from "@/lib/prisma";
import { PlayerRole, TeamStatus, TournamentStatus } from "@prisma/client";
import { createAuditLog } from "./audit.service";

export async function getTeams(tournamentId: string) {
  return await prisma.team.findMany({
    where: { tournamentId },
    include: {
      players: true,
      bracketSlot: true,
      _count: {
        select: {
          matchesWon: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });
}

export async function getTeamById(teamId: string) {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      tournament: true,
      players: {
        orderBy: { role: "asc" },
      },
      bracketSlot: true,
      matchesAsTeamA: {
        include: {
          teamA: true,
          teamB: true,
          winner: true,
          venue: true,
        },
        orderBy: { matchNumber: "asc" },
      },
      matchesAsTeamB: {
        include: {
          teamA: true,
          teamB: true,
          winner: true,
          venue: true,
        },
        orderBy: { matchNumber: "asc" },
      },
    },
  });

  if (!team) return null;

  // Combine matches and sort by matchNumber
  const allMatches = [...team.matchesAsTeamA, ...team.matchesAsTeamB].sort(
    (a, b) => a.matchNumber - b.matchNumber
  );

  return {
    ...team,
    matches: allMatches,
  };
}

export interface CreateTeamInput {
  name: string;
  shortName: string;
  tag: string;
  captainName?: string;
  contactInfo?: string;
  registrationNumber?: string;
  players?: Array<{
    nickname: string;
    realName?: string;
    role: PlayerRole;
    inGameId?: string;
    jerseyNumber?: string;
  }>;
}

export async function createTeam(
  tournamentId: string,
  input: CreateTeamInput,
  actor: { name: string; role: string; id?: string }
) {
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
  });

  if (!tournament) throw new Error("Tournament not found");

  if (tournament.status === TournamentStatus.BRACKET_LOCKED || tournament.status === TournamentStatus.LIVE || tournament.status === TournamentStatus.COMPLETED) {
    throw new Error("Cannot add teams after bracket is locked.");
  }

  const team = await prisma.team.create({
    data: {
      tournamentId,
      name: input.name,
      shortName: input.shortName,
      tag: input.tag,
      captainName: input.captainName,
      contactInfo: input.contactInfo,
      registrationNumber: input.registrationNumber,
      players: input.players
        ? {
            create: input.players,
          }
        : undefined,
    },
    include: { players: true },
  });

  await createAuditLog({
    tournamentId,
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    action: "TEAM_REGISTERED",
    entityType: "TEAM",
    entityId: team.id,
    details: { name: team.name, shortName: team.shortName },
    isPublic: true,
  });

  return team;
}
