import { NextRequest, NextResponse } from "next/server";
import { getTeamById } from "@/lib/services/team.service";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const team = await getTeamById(id);
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }
    return NextResponse.json({ team });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
