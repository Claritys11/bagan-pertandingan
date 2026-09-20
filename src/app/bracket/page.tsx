import React from "react";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { TournamentBracket } from "@/components/bracket/TournamentBracket";
import { getActiveTournament, getTournamentMetrics } from "@/lib/services/tournament.service";
import { getMatches } from "@/lib/services/match.service";

export const revalidate = 10;

export default async function PublicBracketPage() {
  const tournament = await getActiveTournament();
  if (!tournament) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <p>Turnamen belum aktif.</p>
      </div>
    );
  }

  const [metrics, matches] = await Promise.all([
    getTournamentMetrics(tournament.id),
    getMatches(tournament.id),
  ]);

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col">
      <PublicNavbar />

      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <TournamentBracket
          initialMatches={matches as any}
          tournamentId={tournament.id}
          tournamentName={tournament.name}
          championTeam={metrics.championTeam}
          runnerUpTeam={metrics.runnerUpTeam}
        />
      </main>

      <footer className="border-t border-slate-850 py-6 text-xs text-slate-500 text-center">
        Bagan diperbarui otomatis saat wasit/panitia melakukan konfirmasi hasil pertandingan.
      </footer>
    </div>
  );
}
