import React from "react";
import Link from "next/link";
import { AdminNavbar } from "@/components/layout/AdminNavbar";
import { StatusBadge } from "@/components/common/StatusBadge";
import { getActiveTournament, getTournamentMetrics } from "@/lib/services/tournament.service";
import { getMatches } from "@/lib/services/match.service";
import { prisma } from "@/lib/prisma";
import {
  Trophy,
  Swords,
  Calendar,
  Users,
  AlertTriangle,
  Radio,
  Clock,
  ArrowRight,
  ShieldCheck,
  Building,
  CheckCircle2,
} from "lucide-react";

export const revalidate = 0; // Dynamic admin dashboard

export default async function AdminDashboardPage() {
  const tournament = await getActiveTournament();
  if (!tournament) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p>Belum ada turnamen yang dibuat.</p>
      </div>
    );
  }

  const [metrics, matches, venues, staffList] = await Promise.all([
    getTournamentMetrics(tournament.id),
    getMatches(tournament.id),
    prisma.venue.findMany({ where: { tournamentId: tournament.id } }),
    prisma.staff.findMany({ where: { tournamentId: tournament.id } }),
  ]);

  const liveMatches = matches.filter((m) => m.status === "LIVE");
  const readyMatches = matches.filter((m) => m.status === "READY");
  const scheduledMatches = matches.filter((m) => m.status === "SCHEDULED");

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col">
      <AdminNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Tournament Operations Header */}
        <div className="p-6 rounded-2xl esports-glass border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <StatusBadge status={tournament.status} size="md" />
              <span className="text-xs font-mono text-cyan-400 font-bold">
                OPERATIONAL COMMAND CENTER
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">{tournament.name}</h1>
            <p className="text-xs text-slate-400">
              Format 32 Tim Single Elimination • 31 Total Match • Zona Waktu: {tournament.timezone}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/admin/bracket"
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all"
            >
              <Trophy className="w-4 h-4" /> Kelola Bagan 32 Tim
            </Link>
            <Link
              href="/admin/schedule"
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs flex items-center gap-2 transition-all border border-slate-700"
            >
              <Calendar className="w-4 h-4" /> Atur Jadwal & Wasit
            </Link>
          </div>
        </div>

        {/* Operational Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 sm:p-5 rounded-xl esports-glass border border-slate-800 space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Swords className="w-4 h-4 text-cyan-400" />
              Progres Pertandingan
            </span>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-2xl sm:text-3xl font-black text-white">
                {metrics.completedMatches} / 31
              </span>
              <span className="text-xs font-bold text-cyan-400">({metrics.progressPercentage}%)</span>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-xl esports-glass border border-slate-800 space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-red-400" />
              Match Sedang LIVE
            </span>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-2xl sm:text-3xl font-black text-red-400">
                {liveMatches.length}
              </span>
              <span className="text-xs text-slate-400">Arena Aktif</span>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-xl esports-glass border border-slate-800 space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-400" />
              Siap Dimainkan (READY)
            </span>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-2xl sm:text-3xl font-black text-amber-400">
                {readyMatches.length}
              </span>
              <span className="text-xs text-slate-400">Menunggu Kickoff</span>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-xl esports-glass border border-slate-800 space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-400" />
              Petugas & Wasit
            </span>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-2xl sm:text-3xl font-black text-emerald-400">
                {staffList.length}
              </span>
              <span className="text-xs text-slate-400">Personil</span>
            </div>
          </div>
        </div>

        {/* ACTIVE LIVE MATCHES CONTROLLER */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-red-500 animate-pulse" />
              Kontrol Pertandingan Sedang Berlangsung (LIVE)
            </h2>
            <Link
              href="/admin/matches"
              className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1"
            >
              Semua Pertandingan <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {liveMatches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {liveMatches.map((m) => (
                <div
                  key={m.id}
                  className="p-5 rounded-xl bg-slate-900/90 border border-red-500/50 shadow-lg shadow-red-950/40 space-y-4"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-black text-red-400">
                      {m.matchCode} • {m.round.replace(/_/g, " ")}
                    </span>
                    <span className="text-slate-400">{m.venue?.name ?? "Arena Turnamen"}</span>
                  </div>

                  <div className="flex items-center justify-between gap-4 py-2">
                    <div className="flex-1 text-right">
                      <span className="font-black text-white text-base block truncate">
                        {m.teamA?.name ?? "Tim A"}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">Tag: {m.teamA?.tag ?? "-"}</span>
                    </div>

                    <div className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 font-mono text-2xl font-black text-amber-400">
                      {m.scoreA} — {m.scoreB}
                    </div>

                    <div className="flex-1 text-left">
                      <span className="font-black text-white text-base block truncate">
                        {m.teamB?.name ?? "Tim B"}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">Tag: {m.teamB?.tag ?? "-"}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                    <span className="text-xs text-slate-400">
                      Wasit: <strong className="text-slate-200">{m.referee?.displayName ?? "-"}</strong>
                    </span>

                    <Link
                      href={`/admin/matches/${m.id}`}
                      className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      Buka Kokpit & Submit Hasil <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-xl esports-glass border border-slate-800 text-center space-y-2">
              <Clock className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400 font-medium">
                Tidak ada pertandingan yang sedang LIVE. Buka menu pertandingan untuk memulai match berikutnya.
              </p>
            </div>
          )}
        </div>

        {/* QUICK NAVIGATION TILES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/bracket"
            className="p-5 rounded-xl esports-glass border border-slate-800 hover:border-cyan-500/50 transition-all space-y-2 group block"
          >
            <div className="flex items-center justify-between">
              <Trophy className="w-5 h-5 text-amber-400" />
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="font-black text-white text-sm">Bagan & Draw 32 Tim</h3>
            <p className="text-xs text-slate-400">
              Input nomor undian fisik, validasi 32 slot, dan kunci bagan resmi.
            </p>
          </Link>

          <Link
            href="/admin/schedule"
            className="p-5 rounded-xl esports-glass border border-slate-800 hover:border-cyan-500/50 transition-all space-y-2 group block"
          >
            <div className="flex items-center justify-between">
              <Calendar className="w-5 h-5 text-cyan-400" />
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="font-black text-white text-sm">Jadwal & Deteksi Konflik</h3>
            <p className="text-xs text-slate-400">
              Penjadwalan jam match, penugasan wasit/PJ, dan peringatan tabrakan waktu.
            </p>
          </Link>

          <Link
            href="/admin/audit-log"
            className="p-5 rounded-xl esports-glass border border-slate-800 hover:border-cyan-500/50 transition-all space-y-2 group block"
          >
            <div className="flex items-center justify-between">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="font-black text-white text-sm">Audit Log Panitia</h3>
            <p className="text-xs text-slate-400">
              Catatan riwayat append-only perubahan hasil, bagan, dan tindakan administratif.
            </p>
          </Link>

          <Link
            href="/admin/settings"
            className="p-5 rounded-xl esports-glass border border-slate-800 hover:border-cyan-500/50 transition-all space-y-2 group block"
          >
            <div className="flex items-center justify-between">
              <Building className="w-5 h-5 text-purple-400" />
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="font-black text-white text-sm">Alat Simulasi & Pengaturan</h3>
            <p className="text-xs text-slate-400">
              Fast-fill hasil drawing uji coba, simulasi progres pemenang, dan reset data.
            </p>
          </Link>
        </div>
      </main>
    </div>
  );
}
