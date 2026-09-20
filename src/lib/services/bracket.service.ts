import { prisma } from "@/lib/prisma";
import { TournamentStatus, MatchStatus, BracketSide } from "@prisma/client";
import { createAuditLog } from "./audit.service";
import { broadcastTournamentEvent } from "@/lib/realtime/broadcast";

export interface BracketValidationResult {
  isValid: boolean;
  errors: string[];
  stats: {
    totalSlots: number;
    filledSlots: number;
    uniqueTeams: number;
    totalRegisteredTeams: number;
  };
}

export async function getBracketSlots(tournamentId: string) {
  return await prisma.bracketSlot.findMany({
    where: { tournamentId },
    include: {
      team: {
        include: {
          players: true,
        },
      },
    },
    orderBy: {
      slotNumber: "asc",
    },
  });
}

export async function assignTeamToSlot(
  tournamentId: string,
  slotNumber: number,
  teamId: string | null,
  actor: { name: string; role: string; id?: string }
) {
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
  });

  if (!tournament) {
    throw new Error("Tournament not found");
  }

  if (tournament.status === TournamentStatus.BRACKET_LOCKED || tournament.status === TournamentStatus.LIVE || tournament.status === TournamentStatus.COMPLETED) {
    throw new Error("Cannot modify a locked bracket. Administrative override required.");
  }

  // If assigning a team, check if team is already in another slot
  if (teamId) {
    const existingSlot = await prisma.bracketSlot.findFirst({
      where: {
        tournamentId,
        teamId,
        NOT: { slotNumber },
      },
    });

    if (existingSlot) {
      // Clear the other slot to allow re-assignment/swapping
      await prisma.bracketSlot.update({
        where: { id: existingSlot.id },
        data: { teamId: null },
      });
    }
  }

  const updatedSlot = await prisma.bracketSlot.update({
    where: {
      tournamentId_slotNumber: {
        tournamentId,
        slotNumber,
      },
    },
    data: { teamId },
    include: { team: true },
  });

  await createAuditLog({
    tournamentId,
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    action: "TEAM_ASSIGNED_TO_SLOT",
    entityType: "BRACKET",
    entityId: updatedSlot.id,
    details: {
      slotNumber,
      teamId,
      teamName: updatedSlot.team?.name ?? "EMPTY",
    },
  });

  broadcastTournamentEvent("BRACKET_UPDATED", tournamentId, {
    slotNumber,
    team: updatedSlot.team,
  });

  return updatedSlot;
}

export async function validateBracket(tournamentId: string): Promise<BracketValidationResult> {
  const slots = await prisma.bracketSlot.findMany({
    where: { tournamentId },
    include: { team: true },
    orderBy: { slotNumber: "asc" },
  });

  const totalRegisteredTeams = await prisma.team.count({
    where: { tournamentId },
  });

  const errors: string[] = [];
  const assignedTeamIds = new Set<string>();
  let filledSlots = 0;

  for (const slot of slots) {
    if (slot.teamId) {
      filledSlots++;
      if (assignedTeamIds.has(slot.teamId)) {
        errors.push(`Slot #${slot.slotNumber}: Tim "${slot.team?.name}" duplikat (sudah ditugaskan ke slot lain).`);
      }
      assignedTeamIds.add(slot.teamId);
    } else {
      errors.push(`Slot #${slot.slotNumber} (${slot.side} Side) masih kosong.`);
    }
  }

  if (slots.length !== 32) {
    errors.push(`Total slot harus 32 (saat ini ${slots.length}).`);
  }

  if (filledSlots < 32) {
    errors.push(`Hanya ${filledSlots} / 32 slot yang terisi.`);
  }

  if (assignedTeamIds.size < totalRegisteredTeams && totalRegisteredTeams === 32) {
    errors.push(`Belum semua dari 32 tim terdaftar masuk ke bagan.`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    stats: {
      totalSlots: slots.length,
      filledSlots,
      uniqueTeams: assignedTeamIds.size,
      totalRegisteredTeams,
    },
  };
}

export async function lockBracket(
  tournamentId: string,
  actor: { name: string; role: string; id?: string }
) {
  const validation = await validateBracket(tournamentId);
  if (!validation.isValid) {
    throw new Error(`Validasi bagan gagal: ${validation.errors.join("; ")}`);
  }

  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
  });

  if (!tournament) {
    throw new Error("Tournament not found");
  }

  const slots = await prisma.bracketSlot.findMany({
    where: { tournamentId },
    orderBy: { slotNumber: "asc" },
  });

  const slotMap = new Map<number, string>();
  for (const s of slots) {
    if (s.teamId) {
      slotMap.set(s.slotNumber, s.teamId);
    }
  }

  return await prisma.$transaction(async (tx) => {
    // 1. Update tournament status
    const updatedTournament = await tx.tournament.update({
      where: { id: tournamentId },
      data: {
        status: TournamentStatus.BRACKET_LOCKED,
        bracketLockedAt: new Date(),
        bracketLockedBy: actor.name,
      },
    });

    // 2. Populate Round of 32 Matches (M01 - M16)
    // M01: Slot 1 vs Slot 2, M02: Slot 3 vs Slot 4, etc.
    for (let m = 1; m <= 16; m++) {
      const slotA = m * 2 - 1;
      const slotB = m * 2;
      const teamAId = slotMap.get(slotA);
      const teamBId = slotMap.get(slotB);

      await tx.match.update({
        where: {
          tournamentId_matchNumber: {
            tournamentId,
            matchNumber: m,
          },
        },
        data: {
          teamAId: teamAId ?? null,
          teamBId: teamBId ?? null,
          status: MatchStatus.SCHEDULED,
        },
      });
    }

    // 3. Create Audit Log
    await tx.auditLog.create({
      data: {
        tournamentId,
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        action: "BRACKET_LOCKED",
        entityType: "BRACKET",
        entityId: tournamentId,
        details: {
          timestamp: new Date().toISOString(),
          lockedBy: actor.name,
          teamsCount: 32,
        },
        isPublic: true,
      },
    });

    broadcastTournamentEvent("BRACKET_LOCKED", tournamentId, {
      lockedAt: new Date().toISOString(),
      lockedBy: actor.name,
    });

    return updatedTournament;
  });
}

export async function emergencyOverrideBracket(
  tournamentId: string,
  reason: string,
  actor: { name: string; role: string; id?: string }
) {
  if (!reason || reason.trim().length < 5) {
    throw new Error("Alasan override administratif wajib diisi minimal 5 karakter.");
  }

  const updatedTournament = await prisma.tournament.update({
    where: { id: tournamentId },
    data: {
      status: TournamentStatus.SETUP,
      bracketLockedAt: null,
      bracketLockedBy: null,
    },
  });

  await createAuditLog({
    tournamentId,
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    action: "BRACKET_EMERGENCY_OVERRIDE",
    entityType: "BRACKET",
    entityId: tournamentId,
    details: {
      reason,
      timestamp: new Date().toISOString(),
    },
    isPublic: true,
  });

  broadcastTournamentEvent("BRACKET_UPDATED", tournamentId, {
    status: TournamentStatus.SETUP,
    reason,
  });

  return updatedTournament;
}
