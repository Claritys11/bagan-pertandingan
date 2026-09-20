import React from "react";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { StatusBadge } from "@/components/common/StatusBadge";
import { getActiveTournament, getTournamentMetrics } from "@/lib/services/tournament.service";
import { getAuditLogs } from "@/lib/services/audit.service";
import {
  ShieldCheck,
  Lock,
  Calendar,
  CheckCircle2,
  FileCheck2,
  Clock,
  History,
} from "lucide-react";

export const revalidate = 10;

export default async function PublicTransparencyPage() {
  const tournament = await getActiveTournament();
  if (!tournament) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <p>Turnamen belum aktif.</p>
      </div>
    );
  }

  const [metrics, logs] = await Promise.all([
    getTournamentMetrics(tournament.id),
    getAuditLogs(tournament.id, { isPublicOnly: true, limit: 25 }),
  ]);

  const lockedFormatted = tournament.bracketLockedAt
    ? new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Jakarta",
      }).format(new Date(tournament.bracketLockedAt)) + " WIB"
    : "Bagan belum dikunci resmi";

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col">
      <PublicNavbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        <div className="p-6 sm:p-8 rounded-2xl esports-glass border border-emerald-500/30 shadow-xl shadow-emerald-950/20">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-black tracking-widest text-emerald-400 uppercase">
              OFFICIAL INTEGRITY & TRANSPARENCY
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Transparansi & Integritas Turnamen
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Sistem ini mencatat setiap perubahan data operasional secara transparan untuk menjamin
            kejujuran, kepatuhan bagan resmi, dan akuntabilitas hasil pertandingan.
          </p>
        </div>

        {/* Verification Status Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl esports-glass border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
              STATUS BAGAN
            </span>
            <div className="pt-1">
              <StatusBadge status={tournament.status} size="md" />
            </div>
          </div>

          <div className="p-5 rounded-xl esports-glass border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
              <FileCheck2 className="w-3.5 h-3.5 text-amber-400" />
              TIM TERVALIDASI
            </span>
            <div className="pt-1">
              <span className="text-xl font-black text-white">32 Tim Resmi</span>
            </div>
          </div>

          <div className="p-5 rounded-xl esports-glass border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              MATCH SELESAI
            </span>
            <div className="pt-1">
              <span className="text-xl font-black text-emerald-400">
                {metrics.completedMatches} / 31 Pertandingan
              </span>
            </div>
          </div>

          <div className="p-5 rounded-xl esports-glass border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-purple-400" />
              PENGUNCIAN BAGAN
            </span>
            <div className="pt-1">
              <span className="text-xs font-bold text-slate-200 block truncate">
                {lockedFormatted}
              </span>
              {tournament.bracketLockedBy && (
                <span className="text-[10px] text-slate-500 block">
                  Oleh: {tournament.bracketLockedBy}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Audit Log Transparency Trail */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <History className="w-5 h-5 text-cyan-400" />
              Log Audit Resmi Aktivitas Panitia (Append-Only)
            </h2>
            <span className="text-xs text-slate-500">25 Aktivitas Terakhir</span>
          </div>

          <div className="rounded-xl border border-slate-800 overflow-hidden esports-glass">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-black text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Waktu</th>
                    <th className="py-3 px-4">Aksi / Kegiatan</th>
                    <th className="py-3 px-4">Entitas</th>
                    <th className="py-3 px-4">Pelaksana (Actor)</th>
                    <th className="py-3 px-4">Rincian Perubahan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {logs.map((log) => {
                    const timeStr = new Intl.DateTimeFormat("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      day: "numeric",
                      month: "short",
                      timeZone: "Asia/Jakarta",
                    }).format(new Date(log.createdAt));

                    return (
                      <tr key={log.id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="py-3 px-4 text-slate-400 font-mono whitespace-nowrap">
                          {timeStr} WIB
                        </td>
                        <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] text-cyan-300">
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-300 font-semibold">{log.entityType}</td>
                        <td className="py-3 px-4 text-slate-300">
                          <strong>{log.actorName}</strong> ({log.actorRole})
                        </td>
                        <td className="py-3 px-4 text-slate-400 max-w-xs truncate">
                          {log.details ? JSON.stringify(log.details) : "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
