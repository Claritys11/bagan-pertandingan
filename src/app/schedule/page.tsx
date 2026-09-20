import React from "react";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicScheduleList } from "@/components/schedule/PublicScheduleList";
import { getActiveTournament } from "@/lib/services/tournament.service";
import { getMatches } from "@/lib/services/match.service";
import { prisma } from "@/lib/prisma";

export const revalidate = 10;

export default async function PublicSchedulePage() {
  const tournament = await getActiveTournament();
  if (!tournament) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <p>Turnamen belum aktif.</p>
      </div>
    );
  }

  const [matches, venues] = await Promise.all([
    getMatches(tournament.id),
    prisma.venue.findMany({
      where: { tournamentId: tournament.id },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col">
      <PublicNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <PublicScheduleList
          initialMatches={matches as any}
          tournamentId={tournament.id}
          venues={venues}
        />
      </main>

      <footer className="border-t border-slate-850 py-6 text-xs text-slate-500 text-center">
        Jadwal sewaktu-waktu dapat bergeser sesuai durasi jalannya pertandingan di arena.
      </footer>
    </div>
  );
}
