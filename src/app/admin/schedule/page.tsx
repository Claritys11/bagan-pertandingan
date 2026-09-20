import React from "react";
import { AdminNavbar } from "@/components/layout/AdminNavbar";
import { AdminScheduleManager } from "@/components/admin/AdminScheduleManager";
import { getActiveTournament } from "@/lib/services/tournament.service";
import { getMatches } from "@/lib/services/match.service";
import { prisma } from "@/lib/prisma";

export const revalidate = 0;

export default async function AdminSchedulePage() {
  const tournament = await getActiveTournament();
  if (!tournament) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p>Belum ada turnamen.</p>
      </div>
    );
  }

  const [matches, venues, staffList] = await Promise.all([
    getMatches(tournament.id),
    prisma.venue.findMany({
      where: { tournamentId: tournament.id },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.staff.findMany({
      where: { tournamentId: tournament.id },
      select: { id: true, displayName: true, role: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col">
      <AdminNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AdminScheduleManager
          initialMatches={matches as any}
          tournamentId={tournament.id}
          venues={venues}
          staffList={staffList}
        />
      </main>
    </div>
  );
}
