import { prisma } from "@/lib/prisma";

export interface LogAuditParams {
  tournamentId: string;
  actorId?: string;
  actorName: string;
  actorRole: string;
  action: string;
  entityType: "MATCH" | "BRACKET" | "TEAM" | "SCHEDULE" | "TOURNAMENT" | "STAFF" | "VENUE" | "ANNOUNCEMENT";
  entityId?: string;
  details?: Record<string, any>;
  isPublic?: boolean;
}

export async function createAuditLog(params: LogAuditParams) {
  return await prisma.auditLog.create({
    data: {
      tournamentId: params.tournamentId,
      actorId: params.actorId,
      actorName: params.actorName,
      actorRole: params.actorRole,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      details: params.details ?? {},
      isPublic: params.isPublic ?? true,
    },
  });
}

export async function getAuditLogs(
  tournamentId: string,
  options?: {
    entityType?: string;
    isPublicOnly?: boolean;
    limit?: number;
  }
) {
  return await prisma.auditLog.findMany({
    where: {
      tournamentId,
      ...(options?.entityType ? { entityType: options.entityType } : {}),
      ...(options?.isPublicOnly ? { isPublic: true } : {}),
    },
    orderBy: {
      createdAt: "desc",
    },
    take: options?.limit ?? 100,
  });
}
