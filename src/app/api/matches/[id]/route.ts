import { NextRequest, NextResponse } from "next/server";
import { getMatchById, updateMatchStatus } from "@/lib/services/match.service";
import { getSession, canManageMatches } from "@/lib/auth/session";
import { MatchStatus } from "@prisma/client";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const match = await getMatchById(id);
    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }
    return NextResponse.json({ match });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !canManageMatches(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status, notes } = body;

    const actor = {
      id: session.userId,
      name: session.name || session.username,
      role: session.role,
    };

    if (status) {
      const updated = await updateMatchStatus(id, status as MatchStatus, actor, notes);
      return NextResponse.json({ success: true, match: updated });
    }

    return NextResponse.json({ error: "No update parameters provided" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
