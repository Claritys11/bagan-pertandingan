import React from "react";
import Link from "next/link";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { StatusBadge } from "@/components/common/StatusBadge";
import { getActiveTournament } from "@/lib/services/tournament.service";
import { getMatches } from "@/lib/services/match.service";
import { Swords, Trophy, Clock, ArrowRight } from "lucide-react";

export const revalidate = 10;

export default async function PublicMatchesPage() {
  const tournament = await getActiveTournament();
  if (!tournament) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <p>Turnamen belum aktif.</p>
      </div>
    );
  }

  const matches = await getMatches(tournament.id);

  const rounds = [
    { key: "ROUND_OF_32", label: "Round of 32 (16 Pertandingan)" },
    { key: "ROUND_OF_16", label: "Round of 16 (8 Pertandingan)" },
    { key: "QUARTER_FINAL", label: "Quarter Final (4 Pertandingan)" },
    { key: "SEMI_FINAL", label: "Semi Final (2 Pertandingan)" },
    { key: "FINAL", label: "Grand Final (1 Pertandingan)" },
  ];

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col">
      <PublicNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        <div className="p-6 rounded-2xl esports-glass border border-slate-800">
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
            <Swords className="w-7 h-7 text-cyan-400" />
            Daftar Seluruh 31 Pertandingan Turnamen
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Format Single Elimination: setiap kemenangan membawa tim melaju ke babak berikutnya
            hingga perebutan gelar juara di Grand Final.
          </p>
        </div>

        <div className="space-y-8">
          {rounds.map((r) => {
            const roundMatches = matches.filter((m) => m.round === r.key);
            if (roundMatches.length === 0) return null;

            return (
              <div key={r.key} className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <h2 className="text-base font-black text-slate-100 uppercase tracking-wide">
                    {r.label}
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {roundMatches.map((m) => {
                    const isCompleted = m.status === "COMPLETED";
                    const isLive = m.status === "LIVE";
                    const teamAWon = isCompleted && m.winner?.id === m.teamA?.id;
                    const teamBWon = isCompleted && m.winner?.id === m.teamB?.id;

                    return (
                      <Link
                        key={m.id}
                        href={`/matches/${m.id}`}
                        className={`block group rounded-xl p-4 border transition-all ${
                          isLive
                            ? "bg-slate-900/90 border-red-500/50 shadow-md shadow-red-950/40"
                            : isCompleted
                            ? "bg-slate-900/60 border-slate-800 hover:border-cyan-500/40"
                            : "bg-slate-950/70 border-slate-850 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800/80 mb-3">
                          <span className="font-mono font-black text-cyan-400">{m.matchCode}</span>
                          <StatusBadge status={m.status} size="sm" />
                        </div>

                        <div className="space-y-2">
                          {/* Team A */}
                          <div
                            className={`flex items-center justify-between text-xs p-2 rounded ${
                              teamAWon
                                ? "bg-emerald-950/40 text-emerald-300 font-bold border border-emerald-500/30"
                                : "text-slate-200"
                            }`}
                          >
                            <span className="truncate pr-2">{m.teamA?.name ?? "TBD (Menunggu)"}</span>
                            <span className="font-mono font-black">{m.scoreA}</span>
                          </div>

                          {/* Team B */}
                          <div
                            className={`flex items-center justify-between text-xs p-2 rounded ${
                              teamBWon
                                ? "bg-emerald-950/40 text-emerald-300 font-bold border border-emerald-500/30"
                                : "text-slate-200"
                            }`}
                          >
                            <span className="truncate pr-2">{m.teamB?.name ?? "TBD (Menunggu)"}</span>
                            <span className="font-mono font-black">{m.scoreB}</span>
                          </div>
                        </div>

                        <div className="mt-3 pt-2 border-t border-slate-850 flex items-center justify-between text-[11px] text-slate-400">
                          <span className="truncate">{m.venue?.name ?? "Arena"}</span>
                          <span className="text-cyan-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 font-bold">
                            Lihat <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
