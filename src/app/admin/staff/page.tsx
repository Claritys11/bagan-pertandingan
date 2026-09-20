import React from "react";
import Link from "next/link";
import { AdminNavbar } from "@/components/layout/AdminNavbar";
import { getActiveTournament } from "@/lib/services/tournament.service";
import { prisma } from "@/lib/prisma";
import { UserCheck, Calendar, ArrowRight, Phone, Mail } from "lucide-react";

export const revalidate = 0;

export default async function AdminStaffPage() {
  const tournament = await getActiveTournament();
  if (!tournament) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p>Belum ada turnamen.</p>
      </div>
    );
  }

  const staffList = await prisma.staff.findMany({
    where: { tournamentId: tournament.id },
    include: {
      refereeMatches: true,
      pjMatches: true,
      observerMatches: true,
    },
    orderBy: { role: "asc" },
  });

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col">
      <AdminNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="p-6 rounded-2xl esports-glass border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
              <UserCheck className="w-6 h-6 text-cyan-400" />
              Daftar Petugas & Wasit Turnamen
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Personil panitia, wasit pertandingan, person in charge (PJ), observer, dan stream operator.
            </p>
          </div>

          <div className="text-xs font-mono text-cyan-400 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800">
            {staffList.length} Personil Aktif
          </div>
        </div>

        {/* Staff Table */}
        <div className="rounded-2xl border border-slate-800 overflow-hidden esports-glass">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-black text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Nama Petugas</th>
                  <th className="py-3.5 px-4">Nama Tampilan</th>
                  <th className="py-3.5 px-4">Peran (Role)</th>
                  <th className="py-3.5 px-4">Kontak</th>
                  <th className="py-3.5 px-4">Tugas Match</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {staffList.map((s) => {
                  const totalAssigned =
                    s.refereeMatches.length + s.pjMatches.length + s.observerMatches.length;

                  return (
                    <tr key={s.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white">{s.name}</td>
                      <td className="py-3.5 px-4 text-slate-300 font-semibold">{s.displayName}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                          {s.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 space-y-0.5">
                        {s.phone && (
                          <div className="flex items-center gap-1 text-[11px]">
                            <Phone className="w-3 h-3 text-slate-500" />
                            <span>{s.phone}</span>
                          </div>
                        )}
                        {s.email && (
                          <div className="flex items-center gap-1 text-[11px]">
                            <Mail className="w-3 h-3 text-slate-500" />
                            <span>{s.email}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-200">
                        {totalAssigned} Match Ditugaskan
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/admin/staff/${s.id}`}
                          className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-bold"
                        >
                          Lihat Shift Jadwal <ArrowRight className="w-3.5 h-3.5" />
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
