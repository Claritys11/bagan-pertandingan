import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminNavbar } from "@/components/layout/AdminNavbar";
import { getTeamById } from "@/lib/services/team.service";
import { Users, Shield, ArrowLeft, ArrowRight, Trophy } from "lucide-react";

export const revalidate = 0;

export default async function AdminTeamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const team = await getTeamById(id);

  if (!team) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col">
      <AdminNavbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link href="/admin/teams" className="hover:text-cyan-400 flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Daftar Tim
          </Link>
          <span>/</span>
          <span className="text-slate-200 font-bold">{team.name}</span>
        </div>

        <div className="p-6 rounded-2xl esports-glass border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-xs font-mono font-black bg-cyan-500/20 text-cyan-300">
                {team.tag}
              </span>
              <span className="text-xs text-slate-400 font-mono">REG: {team.registrationNumber || "-"}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">{team.name}</h1>
            <p className="text-xs text-slate-400">
              Kapten: <strong className="text-slate-200">{team.captainName || "-"}</strong>
            </p>
          </div>

          {team.bracketSlot && (
            <div className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-xs text-slate-400 block font-semibold">Slot Bagan Resmi</span>
              <span className="text-xl font-black text-amber-400">
                Slot #{team.bracketSlot.slotNumber} ({team.bracketSlot.side})
              </span>
            </div>
          )}
        </div>

        {/* Players List */}
        <div className="space-y-3">
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            Roster Resmi Pemain ({team.players.length} Pemain)
          </h2>

          <div className="rounded-xl border border-slate-800 overflow-hidden esports-glass">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-black text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Nickname</th>
                  <th className="py-3 px-4">Nama Asli</th>
                  <th className="py-3 px-4">Role / Posisi</th>
                  <th className="py-3 px-4">In-Game ID</th>
                  <th className="py-3 px-4">Nomor Punggung</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {team.players.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-900/40">
                    <td className="py-3 px-4 font-bold text-white">{p.nickname}</td>
                    <td className="py-3 px-4 text-slate-300">{p.realName || "-"}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                        {p.role.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">{p.inGameId || "-"}</td>
                    <td className="py-3 px-4 font-mono text-slate-400">{p.jerseyNumber || "-"}</td>
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
