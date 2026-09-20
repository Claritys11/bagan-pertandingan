import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminNavbar } from "@/components/layout/AdminNavbar";
import { StatusBadge } from "@/components/common/StatusBadge";
import { prisma } from "@/lib/prisma";
import { UserCheck, Calendar, Clock, MapPin, ArrowLeft, ArrowRight } from "lucide-react";

export const revalidate = 0;

export default async function AdminStaffShiftPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const staff = await prisma.staff.findUnique({
    where: { id },
    include: {
      refereeMatches: {
        include: { teamA: true, teamB: true, venue: true },
        orderBy: { scheduledAt: "asc" },
      },
      pjMatches: {
        include: { teamA: true, teamB: true, venue: true },
        orderBy: { scheduledAt: "asc" },
      },
      observerMatches: {
        include: { teamA: true, teamB: true, venue: true },
        orderBy: { scheduledAt: "asc" },
      },
    },
  });

  if (!staff) {
    notFound();
  }

  // Aggregate all assigned matches
  const assigned = [
    ...staff.refereeMatches.map((m) => ({ ...m, dutyRole: "WASIT (REFEREE)" })),
    ...staff.pjMatches.map((m) => ({ ...m, dutyRole: "PJ (PERSON IN CHARGE)" })),
    ...staff.observerMatches.map((m) => ({ ...m, dutyRole: "OBSERVER" })),
  ].sort((a, b) => {
    const timeA = a.scheduledAt ? new Date(a.scheduledAt).getTime() : 0;
    const timeB = b.scheduledAt ? new Date(b.scheduledAt).getTime() : 0;
    return timeA - timeB;
  });

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col">
      <AdminNavbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link href="/admin/staff" className="hover:text-cyan-400 flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Daftar Petugas
          </Link>
          <span>/</span>
          <span className="text-slate-200 font-bold">{staff.displayName}</span>
        </div>

        {/* Staff Profile Header */}
        <div className="p-6 sm:p-8 rounded-2xl esports-glass border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-black bg-cyan-500/20 text-cyan-300">
                {staff.role}
              </span>
              <span className="text-xs text-slate-400">Status: {staff.status}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">{staff.name}</h1>
            <p className="text-xs text-slate-400">
              Nama Panggilan/Display: <strong className="text-slate-200">{staff.displayName}</strong> • Kontak: {staff.phone || staff.email || "-"}
            </p>
          </div>

          <div className="px-5 py-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <span className="text-2xl font-black text-cyan-400 block">{assigned.length}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Shift Match Ditugaskan
            </span>
          </div>
        </div>

        {/* Assigned Shift Timeline */}
        <div className="space-y-4">
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-cyan-400" />
            Jadwal Shift Tugas Pertandingan (Staff Shift Dashboard)
          </h2>

          {assigned.length > 0 ? (
            <div className="space-y-3">
              {assigned.map((m) => {
                const formattedTime = m.scheduledAt
                  ? new Intl.DateTimeFormat("id-ID", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                      timeZone: "Asia/Jakarta",
                    }).format(new Date(m.scheduledAt)) + " WIB"
                  : "Waktu belum dijadwalkan";

                return (
                  <div
                    key={`${m.id}-${m.dutyRole}`}
                    className="p-4 sm:p-5 rounded-xl esports-glass border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-mono font-bold">
                          {m.matchCode}
                        </span>
                        <span className="font-bold text-slate-300">
                          {m.round.replace(/_/g, " ")}
                        </span>
                        <span className="text-slate-500">•</span>
                        <span className="font-semibold text-amber-400">{m.dutyRole}</span>
                      </div>

                      <div className="font-bold text-white text-sm">
                        <span>{m.teamA?.name ?? "TBD"}</span>
                        <span className="text-slate-500 font-normal mx-2">vs</span>
                        <span>{m.teamB?.name ?? "TBD"}</span>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-cyan-400" />
                          {formattedTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                          {m.venue?.name ?? "Arena"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <StatusBadge status={m.status} size="sm" />
                      <Link
                        href={`/admin/matches/${m.id}`}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold transition-colors"
                      >
                        Buka Match →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 rounded-xl esports-glass border border-slate-800 text-center text-xs text-slate-400">
              Belum ada jadwal pertandingan yang ditugaskan ke personil ini.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
