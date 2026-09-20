import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getActiveTournament } from "@/lib/services/tournament.service";
import { getSession, canPublishAnnouncements } from "@/lib/auth/session";
import { createAuditLog } from "@/lib/services/audit.service";
import { broadcastTournamentEvent } from "@/lib/realtime/broadcast";
import { AnnouncementSeverity } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const tournament = await getActiveTournament();
    if (!tournament) {
      return NextResponse.json({ announcements: [] });
    }

    const announcements = await prisma.announcement.findMany({
      where: {
        tournamentId: tournament.id,
        isPublished: true,
      },
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ tournament, announcements });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !canPublishAnnouncements(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const tournament = await getActiveTournament();
    if (!tournament) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    const body = await req.json();
    const { title, content, severity, isPinned } = body;

    const announcement = await prisma.announcement.create({
      data: {
        tournamentId: tournament.id,
        title,
        content,
        severity: severity || AnnouncementSeverity.INFO,
        isPinned: Boolean(isPinned),
        authorName: session.name || session.username,
      },
    });

    await createAuditLog({
      tournamentId: tournament.id,
      actorId: session.userId,
      actorName: session.name || session.username,
      actorRole: session.role,
      action: "ANNOUNCEMENT_CREATED",
      entityType: "ANNOUNCEMENT",
      entityId: announcement.id,
      details: { title, severity },
      isPublic: true,
    });

    broadcastTournamentEvent("ANNOUNCEMENT_CREATED", tournament.id, announcement);

    return NextResponse.json({ success: true, announcement });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
