import { prisma } from "@/lib/prisma";
import { createAuditLog } from "./audit.service";
import { broadcastTournamentEvent } from "@/lib/realtime/broadcast";

export interface ConflictItem {
  type: "VENUE" | "REFEREE" | "PJ" | "OBSERVER";
  message: string;
  conflictingMatchCode: string;
  conflictingMatchId: string;
  scheduledTime: string;
}

export interface CheckConflictParams {
  tournamentId: string;
  matchId: string;
  scheduledAt: Date;
  venueId?: string | null;
  refereeId?: string | null;
  pjId?: string | null;
  observerId?: string | null;
  windowMinutes?: number; // default 45 mins overlap window
}

export async function detectSchedulingConflicts(params: CheckConflictParams): Promise<ConflictItem[]> {
  const {
    tournamentId,
    matchId,
    scheduledAt,
    venueId,
    refereeId,
    pjId,
    observerId,
    windowMinutes = 45,
  } = params;

  const windowMs = windowMinutes * 60 * 1000;
  const startTime = new Date(scheduledAt.getTime() - windowMs);
  const endTime = new Date(scheduledAt.getTime() + windowMs);

  // Find all other matches in this tournament scheduled within this window
  const overlappingMatches = await prisma.match.findMany({
    where: {
      tournamentId,
      NOT: { id: matchId },
      scheduledAt: {
        gte: startTime,
        lte: endTime,
      },
      status: {
        notIn: ["CANCELLED", "VOID", "COMPLETED"],
      },
    },
    include: {
      venue: true,
      referee: true,
      pj: true,
      observer: true,
    },
  });

  const conflicts: ConflictItem[] = [];

  for (const m of overlappingMatches) {
    const formattedTime = m.scheduledAt
      ? new Intl.DateTimeFormat("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Asia/Jakarta",
        }).format(new Date(m.scheduledAt))
      : "-";

    // Venue check
    if (venueId && m.venueId === venueId) {
      conflicts.push({
        type: "VENUE",
        message: `Venue "${m.venue?.name}" sudah dijadwalkan untuk ${m.matchCode} pada ${formattedTime} WIB.`,
        conflictingMatchCode: m.matchCode,
        conflictingMatchId: m.id,
        scheduledTime: formattedTime,
      });
    }

    // Referee check
    if (refereeId && m.refereeId === refereeId) {
      conflicts.push({
        type: "REFEREE",
        message: `Wasit "${m.referee?.displayName}" sudah bertugas pada ${m.matchCode} di jam ${formattedTime} WIB.`,
        conflictingMatchCode: m.matchCode,
        conflictingMatchId: m.id,
        scheduledTime: formattedTime,
      });
    }

    // PJ check
    if (pjId && m.pjId === pjId) {
      conflicts.push({
        type: "PJ",
        message: `PJ "${m.pj?.displayName}" sudah bertugas pada ${m.matchCode} di jam ${formattedTime} WIB.`,
        conflictingMatchCode: m.matchCode,
        conflictingMatchId: m.id,
        scheduledTime: formattedTime,
      });
    }

    // Observer check
    if (observerId && m.observerId === observerId) {
      conflicts.push({
        type: "OBSERVER",
        message: `Observer "${m.observer?.displayName}" sudah bertugas pada ${m.matchCode} di jam ${formattedTime} WIB.`,
        conflictingMatchCode: m.matchCode,
        conflictingMatchId: m.id,
        scheduledTime: formattedTime,
      });
    }
  }

  return conflicts;
}

export interface UpdateScheduleInput {
  scheduledAt?: string | null;
  venueId?: string | null;
  refereeId?: string | null;
  pjId?: string | null;
  observerId?: string | null;
  streamUrl?: string | null;
  allowOverrideConflicts?: boolean;
}

export async function updateMatchSchedule(
  matchId: string,
  input: UpdateScheduleInput,
  actor: { name: string; role: string; id?: string }
) {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
  });

  if (!match) {
    throw new Error("Match not found");
  }

  const scheduledDate = input.scheduledAt ? new Date(input.scheduledAt) : null;

  if (scheduledDate) {
    const conflicts = await detectSchedulingConflicts({
      tournamentId: match.tournamentId,
      matchId: match.id,
      scheduledAt: scheduledDate,
      venueId: input.venueId !== undefined ? input.venueId : match.venueId,
      refereeId: input.refereeId !== undefined ? input.refereeId : match.refereeId,
      pjId: input.pjId !== undefined ? input.pjId : match.pjId,
      observerId: input.observerId !== undefined ? input.observerId : match.observerId,
    });

    if (conflicts.length > 0 && !input.allowOverrideConflicts) {
      const messages = conflicts.map((c) => c.message).join("\n");
      const err = new Error(`Konflik Penjadwalan Terdeteksi:\n${messages}`);
      (err as any).conflicts = conflicts;
      throw err;
    }
  }

  const updatedMatch = await prisma.match.update({
    where: { id: matchId },
    data: {
      scheduledAt: scheduledDate,
      venueId: input.venueId,
      refereeId: input.refereeId,
      pjId: input.pjId,
      observerId: input.observerId,
      streamUrl: input.streamUrl,
    },
    include: {
      teamA: true,
      teamB: true,
      venue: true,
      referee: true,
      pj: true,
      observer: true,
    },
  });

  await createAuditLog({
    tournamentId: match.tournamentId,
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    action: "SCHEDULE_UPDATED",
    entityType: "SCHEDULE",
    entityId: matchId,
    details: {
      matchCode: match.matchCode,
      scheduledAt: input.scheduledAt,
      venueId: input.venueId,
      refereeId: input.refereeId,
      pjId: input.pjId,
      observerId: input.observerId,
    },
    isPublic: true,
  });

  broadcastTournamentEvent("SCHEDULE_CHANGED", match.tournamentId, {
    matchId,
    matchCode: match.matchCode,
    updatedMatch,
  });

  return updatedMatch;
}
