import React from "react";
import Link from "next/link";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { StatusBadge } from "@/components/common/StatusBadge";
import { BracketMatchCard } from "@/components/bracket/BracketMatchCard";
import { getActiveTournament, getTournamentMetrics } from "@/lib/services/tournament.service";
import { getMatches } from "@/lib/services/match.service";
import { prisma } from "@/lib/prisma";
import {
  Trophy,
  Swords,
  Calendar,
  Radio,
  ArrowRight,
  ShieldCheck,
  Bell,
  Clock,
  Sparkles,
} from "lucide-react";

export const revalidate = 10; // ISR cache revalidation

export default async function HomePage() {
  const tournament = await getActiveTournament();
  if (!tournament) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <p>Belum ada turnamen aktif yang dibuat.</p>
      </div>
    );
  }

  const [metrics, matches, announcements] = await Promise.all([
    getTournamentMetrics(tournament.id),
    getMatches(tournament.id),
    prisma.announcement.findMany({
      where: { tournamentId: tournament.id, isPublished: true },
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      take: 3,
    }),
  ]);

  const liveMatches = matches.filter((m) => m.status === "LIVE");
  const upcomingMatches = matches.filter(
    (m) => m.status === "READY" || m.status === "SCHEDULED"
  );
  const nextMatch = upcomingMatches[0] || null;
  const recentCompleted = matches
    .filter((m) => m.status === "COMPLETED")
    .slice(-4)
    .reverse();

  // Preview matches for the mini bracket teaser
  const r16Matches = matches.filter((m) => m.round === "ROUND_OF_16").slice(0, 4);

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col">
      <PublicNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Pinned Announcements Bar */}
        {announcements.length > 0 && (
          <div className="bg-cyan-950/40 border border-cyan-500/30 rounded-xl p-3 sm:p-4 flex items-start gap-3">
            <Bell className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs sm:text-sm">
              <div className="flex items-center gap-2 font-bold text-cyan-200">
                <span>{announcements[0].title}</span>
                {announcements[0].isPinned && (
                  <span className="px-1.5 py-0.2 rounded text-[10px] bg-cyan-500/20 text-cyan-300">
                    RESMI
                  </span>
                )}
              </div>
              <p className="text-slate-300 mt-1 line-clamp-2">{announcements[0].content}</p>
            </div>
            <Link
              href="/announcements"
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 shrink-0 hidden sm:flex items-center gap-1 self-center"
            >
              Lihat Semua <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* HERO SECTION & TOURNAMENT STATUS */}
        <div className="relative rounded-2xl overflow-hidden esports-glass border border-slate-800 p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2.5">
                <StatusBadge status={tournament.status} size="md" />
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  MLBB Single Elimination 32 Tim
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                {tournament.name}
              </h1>
              <p className="text-sm text-slate-300">
                Sistem Operasional Turnamen & Pembaruan Bagan Realtime resmi. Memantau jalannya
                pertandingan, jadwal wasit/PJ, dan transparansi kompetisi.
              </p>
            </div>

            {/* Metrics Cockpit Card */}
            <div className="w-full lg:w-auto shrink-0 bg-slate-950/80 border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-wrap gap-6 sm:gap-8 justify-around">
              <div className="text-center">
                <span className="block text-2xl sm:text-3xl font-black text-white">
                  {metrics.completedMatches} / 31
                </span>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Match Selesai
                </span>
              </div>

              <div className="text-center border-x border-slate-800 px-6">
                <span className="block text-2xl sm:text-3xl font-black text-cyan-400">
                  {metrics.progressPercentage}%
                </span>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Progres Turnamen
                </span>
              </div>

              <div className="text-center">
                <span className="block text-2xl sm:text-3xl font-black text-amber-400">
                  32
                </span>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Tim Peserta
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* LIVE & NEXT MATCH SPOTLIGHT */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LIVE MATCHES SECTION */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-red-500 animate-pulse" />
                Pertandingan Sedang Berlangsung (LIVE)
              </h2>
              <Link
                href="/live"
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                Spectator View <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {liveMatches.length > 0 ? (
              <div className="space-y-3">
                {liveMatches.map((m) => (
                  <div
                    key={m.id}
                    className="p-4 rounded-xl bg-slate-900/90 border border-red-500/40 shadow-lg shadow-red-950/40 space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-black text-red-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                        {m.matchCode} ({m.round.replace(/_/g, " ")})
                      </span>
                      <span className="text-slate-400">{m.venue?.name ?? "Arena Utama"}</span>
                    </div>

                    <div className="flex items-center justify-between gap-4 py-2">
                      <div className="flex-1 text-right">
                        <div className="font-black text-white text-base sm:text-lg truncate">
                          {m.teamA?.name ?? "Tim A"}
                        </div>
                        <span className="text-xs text-slate-400">EXP/Jungle/Mid</span>
                      </div>

                      <div className="px-4 py-2 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xl sm:text-2xl font-black text-amber-400 tracking-widest">
                        {m.scoreA} — {m.scoreB}
                      </div>

                      <div className="flex-1 text-left">
                        <div className="font-black text-white text-base sm:text-lg truncate">
                          {m.teamB?.name ?? "Tim B"}
                        </div>
                        <span className="text-xs text-slate-400">Gold/Roam/Sub</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                      <span className="text-slate-400">
                        Wasit: <strong className="text-slate-200">{m.referee?.displayName ?? "Petugas"}</strong>
                      </span>
                      <Link
                        href={`/matches/${m.id}`}
                        className="text-cyan-400 hover:text-cyan-300 font-bold"
                      >
                        Detail Match & Roster →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-xl esports-glass border border-slate-800/80 text-center space-y-2">
                <Clock className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-sm text-slate-400">Tidak ada pertandingan yang sedang LIVE saat ini.</p>
                <p className="text-xs text-slate-500">
                  Pertandingan berikutnya akan otomatis muncul begitu diaktifkan oleh panitia.
                </p>
              </div>
            )}
          </div>

          {/* NEXT MATCH BILLBOARD */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-400" />
                Pertandingan Berikutnya
              </h2>
              <Link
                href="/schedule"
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                Lihat Jadwal Lengkap <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {nextMatch ? (
              <div className="p-5 rounded-xl esports-glass border border-slate-800 space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-black text-cyan-400">
                    MATCH {nextMatch.matchCode} • {nextMatch.round.replace(/_/g, " ")}
                  </span>
                  <StatusBadge status={nextMatch.status} size="sm" />
                </div>

                <div className="flex items-center justify-between gap-4 py-2">
                  <div className="flex-1 text-center">
                    <span className="text-xs text-slate-400 block mb-1">TEAM 1</span>
                    <div className="font-black text-white text-base truncate">
                      {nextMatch.teamA?.name ?? "TBD (Menunggu)"}
                    </div>
                  </div>

                  <div className="font-black text-slate-500 text-sm tracking-widest px-3 py-1 rounded bg-slate-950 border border-slate-850">
                    VS
                  </div>

                  <div className="flex-1 text-center">
                    <span className="text-xs text-slate-400 block mb-1">TEAM 2</span>
                    <div className="font-black text-white text-base truncate">
                      {nextMatch.teamB?.name ?? "TBD (Menunggu)"}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-850 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>
                      {nextMatch.scheduledAt
                        ? new Intl.DateTimeFormat("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                            timeZone: "Asia/Jakarta",
                          }).format(new Date(nextMatch.scheduledAt)) + " WIB"
                        : "Sesuai Giliran"}
                    </span>
                    <span className="text-slate-600">•</span>
                    <span>{nextMatch.venue?.name ?? "Arena Turnamen"}</span>
                  </div>

                  <Link
                    href={`/matches/${nextMatch.id}`}
                    className="px-3 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-bold transition-colors"
                  >
                    Buka Match
                  </Link>
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-xl esports-glass border border-slate-800/80 text-center space-y-2">
                <Trophy className="w-8 h-8 text-amber-500 mx-auto" />
                <p className="text-sm text-slate-300 font-bold">Seluruh pertandingan telah selesai!</p>
                <Link
                  href="/bracket"
                  className="inline-block text-xs font-semibold text-cyan-400 hover:underline mt-1"
                >
                  Lihat Bagan Juara Akhir →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* BRACKET PREVIEW TEASER */}
        <div className="space-y-4 p-6 rounded-2xl esports-glass border border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                Bagan Pertandingan Turnamen
              </h2>
              <p className="text-xs text-slate-400">
                Struktur 32 tim single-elimination resmi dari babak penyisihan hingga Grand Final.
              </p>
            </div>

            <Link
              href="/bracket"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-all"
            >
              Buka Bagan Lengkap (Interactive Bracket) <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            {r16Matches.map((m) => (
              <BracketMatchCard key={m.id} match={m} />
            ))}
          </div>
        </div>

        {/* RECENT RESULTS SECTION */}
        {recentCompleted.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <Swords className="w-4 h-4 text-emerald-400" />
              Hasil Pertandingan Terakhir
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentCompleted.map((m) => (
                <BracketMatchCard key={m.id} match={m} />
              ))}
            </div>
          </div>
        )}

        {/* TRANSPARENCY ASSURANCE FOOTER BANNER */}
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold text-slate-200 block">
                Transparansi & Integritas Turnamen Dijamin
              </span>
              <span>
                Bagan resmi dikunci oleh panitia dan seluruh hasil dicatat dalam log audit yang tidak
                dapat diubah secara sepihak.
              </span>
            </div>
          </div>
          <Link
            href="/transparency"
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors"
          >
            Halaman Transparansi →
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-850 mt-12 py-6 bg-slate-950/80 text-xs text-slate-500 text-center">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p>© 2026 MEC MLBB Tournament Operations Management Platform.</p>
          <p className="text-[11px] text-slate-600">
            Powered by Next.js 15, TypeScript, PostgreSQL, and Server-Sent Events Realtime Engine.
          </p>
        </div>
      </footer>
    </div>
  );
}
