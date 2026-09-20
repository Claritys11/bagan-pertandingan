import { NextRequest, NextResponse } from "next/server";
import { getActiveTournament } from "@/lib/services/tournament.service";
import { getAuditLogs } from "@/lib/services/audit.service";
import { getSession } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  try {
    const tournament = await getActiveTournament();
    if (!tournament) {
      return NextResponse.json({ logs: [] });
    }

    const session = await getSession();
    const isPublicOnly = !session || session.role === "PUBLIC";
    const entityType = req.nextUrl.searchParams.get("entityType") || undefined;
    const limit = Number(req.nextUrl.searchParams.get("limit") || 100);

    const logs = await getAuditLogs(tournament.id, {
      entityType,
      isPublicOnly,
      limit,
    });

    return NextResponse.json({ tournament, logs });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
