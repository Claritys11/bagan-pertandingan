import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { StaffRole } from "@prisma/client";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  return NextResponse.json({
    session: session ?? {
      userId: "guest",
      username: "Guest",
      role: "PUBLIC",
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { role, username, staffId } = body;

    const validRoles = Object.values(StaffRole);
    const targetRole = validRoles.includes(role) ? role : StaffRole.TOURNAMENT_ADMIN;

    // Find staff if staffId provided
    let staffName = username;
    if (staffId) {
      const staff = await prisma.staff.findUnique({ where: { id: staffId } });
      if (staff) staffName = staff.displayName;
    }

    const sessionData = {
      userId: staffId ?? "user-admin",
      username: username ?? "Admin",
      role: targetRole,
      staffId: staffId ?? undefined,
      name: staffName ?? "Tournament Staff",
    };

    const cookieStore = await cookies();
    cookieStore.set({
      name: "baganmec_session",
      value: encodeURIComponent(JSON.stringify(sessionData)),
      httpOnly: false, // Accessible to client for instant role preview/switch
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({ success: true, session: sessionData });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete("baganmec_session");
  return NextResponse.json({ success: true });
}
