import React from "react";
import Link from "next/link";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { StatusBadge } from "@/components/common/StatusBadge";
import { getActiveTournament } from "@/lib/services/tournament.service";
import { getMatches } from "@/lib/services/match.service";
import { Radio, Swords, Clock, MapPin, ArrowRight } from "lucide-react";

export const revalidate = 5;

export default async function PublicLivePage() {
  const tournament = await getActiveTournament();
  if (!tournament) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <p>Turnamen belum aktif.</p>
      </div>
    );
  }

  const matches = await getMatches(tournament.id);
  const liveMatches = matches.filter((m) => m.status === "LIVE");
  const upcomingMatches = matches.filter(
    (m) => m.status === "READY" || m.status === "SCHEDULED"
  );

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col">
      <PublicNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        <div className="p-6 rounded-2xl esports-glass border border-red-500/30 shadow-xl shadow-red-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <span className="text-xs font-black tracking-widest text-red-400 uppercase">
                LIVE SPECTATOR ROOM
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Siapa yang Sedang Main Sekarang?
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Pembaruan skor dan status berlangsung secara instan melalui koneksi Server-Sent Events.
            </p>
          </div>

          <div className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-center shrink-0">
            <span className="text-2xl font-black text-red-400 block">{liveMatches.length}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Match Berlangsung
            </span>
          </div>
        </div>

        {/* Live Matches Feed */}
        {liveMatches.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {liveMatches.map((m) => (
              <div
                key={m.id}
                className="rounded-2xl bg-slate-900/90 border border-red-500/50 p-6 space-y-6 shadow-xl shadow-red-950/40"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-red-400 text-base">{m.matchCode}</span>
                    <span className="text-xs text-slate-400">({m.round.replace(/_/g, " ")})</span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-950 text-red-300 text-xs font-black border border-red-500/50 pulse-live">
                    <Radio className="w-3.5 h-3.5" /> LIVE
                  </span>
                </div>

                {/* Scoreboard */}
                <div className="py-4 flex items-center justify-between gap-4">
                  <div className="flex-1 text-right">
                    <span className="font-black text-lg sm:text-xl text-white block truncate">
                      {m.teamA?.name ?? "Tim A"}
                    </span>
                    <span className="text-xs text-slate-400">Tag: {m.teamA?.tag ?? "-"}</span>
                  </div>

                  <div className="px-5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-3xl sm:text-4xl font-black text-amber-400 tracking-widest shrink-0">
                    {m.scoreA} — {m.scoreB}
                  </div>

                  <div className="flex-1 text-left">
                    <span className="font-black text-lg sm:text-xl text-white block truncate">
                      {m.teamB?.name ?? "Tim B"}
                    </span>
                    <span className="text-xs text-slate-400">Tag: {m.teamB?.tag ?? "-"}</span>
                  </div>
                </div>

                {/* Match Operations */}
                <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{m.venue?.name ?? "Arena Utama"}</span>
                    <span className="text-slate-600">•</span>
                    <span>Wasit: {m.referee?.displayName ?? "Petugas"}</span>
                  </div>

                  <Link
                    href={`/matches/${m.id}`}
                    className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-bold transition-colors flex items-center gap-1"
                  >
                    Buka Detail & Roster <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 rounded-2xl esports-glass border border-slate-800 text-center space-y-3">
            <Radio className="w-10 h-10 text-slate-600 mx-auto" />
            <h2 className="text-base font-bold text-slate-200">
              Saat ini belum ada pertandingan yang sedang LIVE.
            </h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Panitia akan mengubah status pertandingan ke LIVE begitu draft hero selesai dan game
              resmi dimulai.
            </p>
          </div>
        )}

        {/* Up Next Matches Queue */}
        <div className="space-y-4">
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            Antrean Pertandingan Berikutnya (Up Next)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingMatches.slice(0, 6).map((m) => (
              <Link
                key={m.id}
                href={`/matches/${m.id}`}
                className="p-4 rounded-xl esports-glass border border-slate-800 hover:border-slate-700 transition-all space-y-2 block group"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-black text-cyan-400">{m.matchCode}</span>
                  <StatusBadge status={m.status} size="sm" />
                </div>

                <div className="text-xs font-bold text-white py-1">
                  <span className="truncate block">{m.teamA?.name ?? "TBD"}</span>
                  <span className="text-slate-500 text-[10px] block">VS</span>
                  <span className="truncate block">{m.teamB?.name ?? "TBD"}</span>
                </div>

                <div className="pt-2 border-t border-slate-850 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="truncate">{m.venue?.name ?? "Arena"}</span>
                  <span className="text-cyan-400 group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
