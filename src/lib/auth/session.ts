import { cookies } from "next/headers";
import { StaffRole } from "@prisma/client";

export interface AuthSession {
  userId: string;
  username: string;
  role: StaffRole;
  staffId?: string;
  name?: string;
}

const SESSION_COOKIE_NAME = "baganmec_session";

export async function getSession(): Promise<AuthSession | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) {
    return null;
  }
  try {
    const session = JSON.parse(decodeURIComponent(sessionCookie)) as AuthSession;
    return session;
  } catch {
    return null;
  }
}

export function canManageBracket(role?: StaffRole): boolean {
  return role === StaffRole.TOURNAMENT_ADMIN || role === StaffRole.TOURNAMENT_DIRECTOR;
}

export function canManageTournament(role?: StaffRole): boolean {
  return role === StaffRole.TOURNAMENT_ADMIN;
}

export function canManageSettings(role?: StaffRole): boolean {
  return role === StaffRole.TOURNAMENT_ADMIN;
}

export function canManageMatches(role?: StaffRole): boolean {
  return (
    role === StaffRole.TOURNAMENT_ADMIN ||
    role === StaffRole.TOURNAMENT_DIRECTOR ||
    role === StaffRole.REFEREE
  );
}

export function canSubmitMatchResult(
  role?: StaffRole,
  staffId?: string,
  matchRefereeId?: string | null
): boolean {
  if (role === StaffRole.TOURNAMENT_ADMIN || role === StaffRole.TOURNAMENT_DIRECTOR) {
    return true;
  }
  if (role === StaffRole.REFEREE && staffId && matchRefereeId === staffId) {
    return true;
  }
  return false;
}

export function canManageSchedule(role?: StaffRole): boolean {
  return role === StaffRole.TOURNAMENT_ADMIN || role === StaffRole.TOURNAMENT_DIRECTOR;
}

export function canManageStaff(role?: StaffRole): boolean {
  return role === StaffRole.TOURNAMENT_ADMIN;
}

export function canPublishAnnouncements(role?: StaffRole): boolean {
  return role === StaffRole.TOURNAMENT_ADMIN || role === StaffRole.TOURNAMENT_DIRECTOR;
}
