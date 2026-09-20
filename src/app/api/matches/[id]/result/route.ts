import { NextRequest, NextResponse } from "next/server";
import { submitMatchResult } from "@/lib/services/match.service";
import { getMatchById } from "@/lib/services/match.service";
import { getSession, canSubmitMatchResult } from "@/lib/auth/session";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    const { id } = await params;

    const match = await getMatchById(id);
    if (!match) {
      return NextResponse.json({ error: "Pertandingan tidak ditemukan." }, { status: 404 });
    }

    if (!session || !canSubmitMatchResult(session.role, session.staffId, match.refereeId)) {
      return NextResponse.json(
        {
          error:
            "Akses ditolak. Hanya Tournament Admin, Director, atau Wasit resmi yang ditugaskan yang dapat mengirimkan hasil pertandingan resmi.",
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { scoreA, scoreB, winnerId, notes, confirmedOfficial } = body;

    const actor = {
      id: session.userId,
      name: session.name || session.username,
      role: session.role,
    };

    const result = await submitMatchResult(
      id,
      {
        scoreA: Number(scoreA),
        scoreB: Number(scoreB),
        winnerId: String(winnerId),
        notes,
        confirmedOfficial: Boolean(confirmedOfficial),
      },
      actor
    );

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
