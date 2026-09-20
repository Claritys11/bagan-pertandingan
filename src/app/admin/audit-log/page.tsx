import React from "react";
import { AdminNavbar } from "@/components/layout/AdminNavbar";
import { getActiveTournament } from "@/lib/services/tournament.service";
import { getAuditLogs } from "@/lib/services/audit.service";
import { ShieldCheck, History, Search } from "lucide-react";

export const revalidate = 0;

export default async function AdminAuditLogPage() {
  const tournament = await getActiveTournament();
  if (!tournament) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p>Belum ada turnamen.</p>
      </div>
    );
  }

  const logs = await getAuditLogs(tournament.id, { limit: 100 });

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col">
      <AdminNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="p-6 rounded-2xl esports-glass border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
              Audit Log Resmi Panitia (Append-Only)
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Seluruh rekaman peristiwa administratif, penguncian bagan, submit hasil, dan perubahan
              status dicatat secara permanen tanpa dapat dihapus.
            </p>
          </div>

          <div className="text-xs font-mono text-emerald-400 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800">
            {logs.length} Entri Tercatat
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="rounded-2xl border border-slate-800 overflow-hidden esports-glass">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-black text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Waktu & Tanggal</th>
                  <th className="py-3.5 px-4">Aksi / Event</th>
                  <th className="py-3.5 px-4">Entitas</th>
                  <th className="py-3.5 px-4">Pelaksana (Actor)</th>
                  <th className="py-3.5 px-4">Detail Data (Diff / Payload)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {logs.map((log) => {
                  const formattedDate = new Intl.DateTimeFormat("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    timeZone: "Asia/Jakarta",
                  }).format(new Date(log.createdAt));

                  return (
                    <tr key={log.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-slate-400 whitespace-nowrap">
                        {formattedDate} WIB
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono font-bold text-cyan-300">
                          {log.action}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-300 font-bold whitespace-nowrap">
                        {log.entityType}
                      </td>

                      <td className="py-3.5 px-4 text-slate-200 whitespace-nowrap">
                        <strong>{log.actorName}</strong>{" "}
                        <span className="text-slate-400 text-[11px]">({log.actorRole})</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <pre className="font-mono text-[10px] text-slate-400 bg-slate-950/70 p-2 rounded border border-slate-850 max-w-lg overflow-x-auto whitespace-pre-wrap">
                          {log.details ? JSON.stringify(log.details, null, 2) : "-"}
                        </pre>
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
