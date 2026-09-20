import React from "react";
import Link from "next/link";
import { AdminNavbar } from "@/components/layout/AdminNavbar";
import { getActiveTournament } from "@/lib/services/tournament.service";
import { getTeams } from "@/lib/services/team.service";
import { Users, Shield, Plus, ArrowRight } from "lucide-react";

export const revalidate = 0;

export default async function AdminTeamsPage() {
  const tournament = await getActiveTournament();
  if (!tournament) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p>Belum ada turnamen.</p>
      </div>
    );
  }

  const teams = await getTeams(tournament.id);

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col">
      <AdminNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="p-6 rounded-2xl esports-glass border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
              <Users className="w-6 h-6 text-cyan-400" />
              Kelola Tim Peserta Turnamen
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Daftar seluruh tim yang teregistrasi dalam sistem turnamen beserta status verifikasi.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
              {teams.length} / 32 Tim
            </span>
          </div>
        </div>

        {/* Teams Table */}
        <div className="rounded-2xl border border-slate-800 overflow-hidden esports-glass">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-black text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">No</th>
                  <th className="py-3.5 px-4">Nama Tim</th>
                  <th className="py-3.5 px-4">Tag / Singkatan</th>
                  <th className="py-3.5 px-4">Kapten Tim</th>
                  <th className="py-3.5 px-4">Slot Bagan</th>
                  <th className="py-3.5 px-4">Jumlah Pemain</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {teams.map((team, idx) => (
                  <tr key={team.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3.5 px-4 text-slate-500 font-mono">{idx + 1}</td>
                    <td className="py-3.5 px-4 font-bold text-white">{team.name}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">
                      <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                        {team.tag}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">{team.captainName || "-"}</td>
                    <td className="py-3.5 px-4">
                      {team.bracketSlot ? (
                        <span className="font-mono font-bold text-amber-400">
                          Slot #{team.bracketSlot.slotNumber} ({team.bracketSlot.side})
                        </span>
                      ) : (
                        <span className="text-slate-500 italic">Belum diundi</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">{team.players.length} Pemain</td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/admin/teams/${team.id}`}
                        className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-bold"
                      >
                        Detail & Roster <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
