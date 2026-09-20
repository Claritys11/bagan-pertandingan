import React from "react";
import Link from "next/link";
import { AdminNavbar } from "@/components/layout/AdminNavbar";
import { StatusBadge } from "@/components/common/StatusBadge";
import { getActiveTournament } from "@/lib/services/tournament.service";
import { getMatches } from "@/lib/services/match.service";
import { Swords, Clock, MapPin, User, ArrowRight, Trophy } from "lucide-react";

export const revalidate = 0;

export default async function AdminMatchesListPage() {
  const tournament = await getActiveTournament();
  if (!tournament) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p>Belum ada turnamen.</p>
      </div>
    );
  }

  const matches = await getMatches(tournament.id);

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col">
      <AdminNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="p-6 rounded-2xl esports-glass border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
              <Swords className="w-6 h-6 text-cyan-400" />
              Kelola 31 Pertandingan Turnamen
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Buka kokpit pertandingan untuk mengubah status (Ready / Live), submit hasil resmi, atau
              mengatur penugasan wasit.
            </p>
          </div>

          <div className="text-xs font-mono text-slate-400 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800">
            Total 31 Match
          </div>
        </div>

        {/* Matches Table */}
        <div className="rounded-2xl border border-slate-800 overflow-hidden esports-glass">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-black text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Match</th>
                  <th className="py-3.5 px-4">Babak</th>
                  <th className="py-3.5 px-4">Tim A vs Tim B</th>
                  <th className="py-3.5 px-4">Skor</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Venue & Petugas</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {matches.map((m) => {
                  const isCompleted = m.status === "COMPLETED";
                  return (
                    <tr key={m.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-black text-cyan-400">
                        {m.matchCode}
                      </td>

                      <td className="py-3.5 px-4 text-slate-300 font-semibold">
                        {m.round.replace(/_/g, " ")}
                      </td>

                      <td className="py-3.5 px-4 text-slate-200">
                        <div className="font-bold">
                          <span className={m.winnerId === m.teamAId ? "text-amber-400" : ""}>
                            {m.teamA?.name ?? "TBD"}
                          </span>
                          <span className="text-slate-500 font-normal mx-1.5">vs</span>
                          <span className={m.winnerId === m.teamBId ? "text-amber-400" : ""}>
                            {m.teamB?.name ?? "TBD"}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-black text-sm">
                        {isCompleted || m.status === "LIVE" ? (
                          <span className="text-white">
                            {m.scoreA} — {m.scoreB}
                          </span>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <StatusBadge status={m.status} size="sm" />
                      </td>

                      <td className="py-3.5 px-4 text-slate-400">
                        <div>{m.venue?.name ?? "Belum ada venue"}</div>
                        <div className="text-[11px] text-slate-500">
                          Wasit: {m.referee?.displayName ?? "-"}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/admin/matches/${m.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 font-bold transition-colors"
                        >
                          Kokpit Match <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
