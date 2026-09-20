import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { StatusBadge } from "@/components/common/StatusBadge";
import { getMatchById } from "@/lib/services/match.service";
import {
  Trophy,
  Calendar,
  Clock,
  MapPin,
  User,
  Shield,
  ArrowLeft,
  ArrowRight,
  Radio,
  FileText,
} from "lucide-react";

export const revalidate = 5;

export default async function PublicMatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const match = await getMatchById(id);

  if (!match) {
    notFound();
  }

  const isCompleted = match.status === "COMPLETED";
  const isLive = match.status === "LIVE";
  const teamAWon = isCompleted && match.winnerId === match.teamAId;
  const teamBWon = isCompleted && match.winnerId === match.teamBId;

  const formattedTime = match.scheduledAt
    ? new Intl.DateTimeFormat("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Jakarta",
      }).format(new Date(match.scheduledAt)) + " WIB"
    : "Belum dijadwalkan secara spesifik";

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col">
      <PublicNavbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link href="/matches" className="hover:text-cyan-400 flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Semua Pertandingan
          </Link>
          <span>/</span>
          <span className="text-slate-200 font-bold">{match.matchCode}</span>
        </div>

        {/* Match Header Hero Card */}
        <div
          className={`rounded-2xl p-6 sm:p-8 border transition-all ${
            isLive
              ? "bg-slate-900/90 border-red-500/60 shadow-2xl shadow-red-950/40"
              : "esports-glass border-slate-800"
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-slate-800">
            <div>
              <span className="font-mono font-black text-cyan-400 text-sm tracking-wider">
                PERTANDINGAN {match.matchCode}
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-white">
                {match.round.replace(/_/g, " ")}
              </h1>
            </div>
            <StatusBadge status={match.status} size="lg" />
          </div>

          {/* Duel Scoreboard */}
          <div className="py-8 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-12">
            {/* Team A */}
            <div className="flex-1 text-center md:text-right space-y-2">
              <div className="inline-flex items-center gap-2 justify-end">
                {teamAWon && (
                  <span className="px-2.5 py-0.5 rounded text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    PEMENANG
                  </span>
                )}
                <h2 className="text-xl sm:text-3xl font-black text-white truncate">
                  {match.teamA?.name ?? "TBD (Menunggu)"}
                </h2>
              </div>
              {match.teamA && (
                <div className="text-xs text-slate-400">
                  Tag: <span className="font-mono text-cyan-400 font-bold">{match.teamA.tag}</span> • Kapten: {match.teamA.captainName || "Unknown"}
                </div>
              )}
            </div>

            {/* Score Center */}
            <div className="flex flex-col items-center justify-center shrink-0">
              <div className="px-6 py-3 rounded-2xl bg-slate-950/90 border border-slate-800 font-mono text-3xl sm:text-5xl font-black text-white tracking-widest shadow-inner">
                <span className={teamAWon ? "text-amber-400" : ""}>{match.scoreA}</span>
                <span className="text-slate-600 mx-2">—</span>
                <span className={teamBWon ? "text-amber-400" : ""}>{match.scoreB}</span>
              </div>
              {isLive && (
                <div className="flex items-center gap-1.5 text-xs text-red-400 font-bold mt-2 animate-pulse">
                  <Radio className="w-3.5 h-3.5" />
                  <span>GAME IN PROGRESS</span>
                </div>
              )}
            </div>

            {/* Team B */}
            <div className="flex-1 text-center md:text-left space-y-2">
              <div className="inline-flex items-center gap-2 justify-start">
                <h2 className="text-xl sm:text-3xl font-black text-white truncate">
                  {match.teamB?.name ?? "TBD (Menunggu)"}
                </h2>
                {teamBWon && (
                  <span className="px-2.5 py-0.5 rounded text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    PEMENANG
                  </span>
                )}
              </div>
              {match.teamB && (
                <div className="text-xs text-slate-400">
                  Tag: <span className="font-mono text-cyan-400 font-bold">{match.teamB.tag}</span> • Kapten: {match.teamB.captainName || "Unknown"}
                </div>
              )}
            </div>
          </div>

          {/* Operational Match Information */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-800 text-xs">
            <div className="flex items-center gap-2.5 text-slate-300">
              <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
              <div>
                <span className="text-slate-500 block text-[11px]">WAKTU JADWAL</span>
                <span className="font-semibold">{formattedTime}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-slate-300">
              <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
              <div>
                <span className="text-slate-500 block text-[11px]">VENUE ARENA</span>
                <span className="font-semibold">{match.venue?.name ?? "Arena Turnamen"}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-slate-300">
              <User className="w-4 h-4 text-cyan-400 shrink-0" />
              <div>
                <span className="text-slate-500 block text-[11px]">PETUGAS RESMI</span>
                <span className="font-semibold">
                  Wasit: {match.referee?.displayName ?? "-"} • PJ: {match.pj?.displayName ?? "-"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Team Rosters Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Team A Roster */}
          <div className="p-5 rounded-xl esports-glass border border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-black text-sm text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyan-400" />
                Lineup Roster: {match.teamA?.name ?? "Tim A"}
              </h3>
              {match.teamA && (
                <Link
                  href={`/teams/${match.teamA.id}`}
                  className="text-xs text-cyan-400 hover:underline font-bold"
                >
                  Profil Tim →
                </Link>
              )}
            </div>

            {match.teamA?.players && match.teamA.players.length > 0 ? (
              <div className="space-y-1.5 text-xs">
                {match.teamA.players.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-slate-850"
                  >
                    <div>
                      <span className="font-bold text-slate-200">{p.nickname}</span>
                      {p.realName && (
                        <span className="text-slate-500 text-[11px] block">{p.realName}</span>
                      )}
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                      {p.role.replace(/_/g, " ")}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic py-4 text-center">
                Roster pemain belum ditetapkan untuk slot ini.
              </p>
            )}
          </div>

          {/* Team B Roster */}
          <div className="p-5 rounded-xl esports-glass border border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-black text-sm text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyan-400" />
                Lineup Roster: {match.teamB?.name ?? "Tim B"}
              </h3>
              {match.teamB && (
                <Link
                  href={`/teams/${match.teamB.id}`}
                  className="text-xs text-cyan-400 hover:underline font-bold"
                >
                  Profil Tim →
                </Link>
              )}
            </div>

            {match.teamB?.players && match.teamB.players.length > 0 ? (
              <div className="space-y-1.5 text-xs">
                {match.teamB.players.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-slate-850"
                  >
                    <div>
                      <span className="font-bold text-slate-200">{p.nickname}</span>
                      {p.realName && (
                        <span className="text-slate-500 text-[11px] block">{p.realName}</span>
                      )}
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                      {p.role.replace(/_/g, " ")}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic py-4 text-center">
                Roster pemain belum ditetapkan untuk slot ini.
              </p>
            )}
          </div>
        </div>

        {/* Progression and Official Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Progression Target */}
          <div className="p-4 rounded-xl esports-glass border border-slate-800 text-xs space-y-2">
            <span className="font-bold text-slate-400 uppercase tracking-wider block">
              ALUR PROGRESI BAGAN
            </span>
            {match.nextMatch ? (
              <p className="text-slate-200">
                Pemenang pertandingan ini akan otomatis melaju ke babak berikutnya pada{" "}
                <Link
                  href={`/matches/${match.nextMatch.id}`}
                  className="font-bold text-cyan-400 hover:underline"
                >
                  Match {match.nextMatch.matchCode} ({match.nextMatch.round.replace(/_/g, " ")})
                </Link>
                .
              </p>
            ) : (
              <p className="text-amber-400 font-bold">
                🏆 Pertandingan ini adalah Grand Final! Pemenang akan dinobatkan sebagai Juara Turnamen.
              </p>
            )}
          </div>

          {/* Official Public Notes */}
          <div className="p-4 rounded-xl esports-glass border border-slate-800 text-xs space-y-2">
            <span className="font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              CATATAN RESMI PERTANDINGAN
            </span>
            <p className="text-slate-300">
              {match.publicNotes || "Belum ada catatan resmi yang dipublikasikan untuk pertandingan ini."}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
