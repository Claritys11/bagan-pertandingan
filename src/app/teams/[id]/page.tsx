import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { StatusBadge } from "@/components/common/StatusBadge";
import { getTeamById } from "@/lib/services/team.service";
import { Shield, Trophy, ArrowLeft, ArrowRight, CheckCircle2, XCircle } from "lucide-react";

export const revalidate = 5;

export default async function PublicTeamDetailPage({
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
      <PublicNavbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link href="/teams" className="hover:text-cyan-400 flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Semua Tim
          </Link>
          <span>/</span>
          <span className="text-slate-200 font-bold">{team.name}</span>
        </div>

        {/* Team Profile Header */}
        <div className="p-6 sm:p-8 rounded-2xl esports-glass border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {team.tag}
              </span>
              {team.bracketSlot && (
                <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
                  Slot Bagan #{team.bracketSlot.slotNumber} ({team.bracketSlot.side} Side)
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-white">{team.name}</h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Kapten Tim: <strong className="text-slate-200">{team.captainName || "-"}</strong> • Registrasi: {team.registrationNumber || "-"}
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-950/80 p-4 rounded-xl border border-slate-850">
            <div className="text-center">
              <span className="block text-2xl font-black text-amber-400">
                {team.matches.filter((m) => m.winner?.id === team.id).length}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Kemenangan
              </span>
            </div>
            <div className="border-r border-slate-800 h-8" />
            <div className="text-center">
              <span className="block text-2xl font-black text-white">{team.matches.length}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Total Match
              </span>
            </div>
          </div>
        </div>

        {/* Player Roster */}
        <div className="space-y-3">
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            Lineup Roster Resmi (5 Pemain)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {team.players.map((p) => (
              <div
                key={p.id}
                className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1 text-center"
              >
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-black bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 mb-1">
                  {p.role.replace(/_/g, " ")}
                </span>
                <h3 className="font-black text-white text-sm truncate">{p.nickname}</h3>
                <p className="text-xs text-slate-400 truncate">{p.realName || "-"}</p>
                <p className="text-[10px] text-slate-500 font-mono">{p.inGameId || "ID: -"}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tournament Progression & Match History */}
        <div className="space-y-3">
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            Riwayat Pertandingan di Turnamen Ini
          </h2>

          {team.matches.length > 0 ? (
            <div className="space-y-3">
              {team.matches.map((m) => {
                const opponent = m.teamAId === team.id ? m.teamB : m.teamA;
                const isCompleted = m.status === "COMPLETED";
                const isWon = isCompleted && m.winnerId === team.id;
                const isLost = isCompleted && m.winnerId && m.winnerId !== team.id;
                const ourScore = m.teamAId === team.id ? m.scoreA : m.scoreB;
                const oppScore = m.teamAId === team.id ? m.scoreB : m.scoreA;

                return (
                  <div
                    key={m.id}
                    className="p-4 rounded-xl esports-glass border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="px-2.5 py-1 rounded bg-slate-900 text-cyan-400 font-mono font-bold text-xs">
                        {m.matchCode}
                      </div>

                      <div>
                        <span className="text-[11px] text-slate-400 block font-bold">
                          {m.round.replace(/_/g, " ")}
                        </span>
                        <div className="flex items-center gap-2 font-bold text-white text-sm">
                          <span>{team.name}</span>
                          <span className="text-slate-500 font-normal">vs</span>
                          <span>{opponent?.name ?? "TBD"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {isCompleted ? (
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-base font-black text-white">
                            {ourScore} — {oppScore}
                          </span>
                          {isWon ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                              <CheckCircle2 className="w-3.5 h-3.5" /> MENANG
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-rose-950 text-rose-400 border border-rose-500/30">
                              <XCircle className="w-3.5 h-3.5" /> KALAH
                            </span>
                          )}
                        </div>
                      ) : (
                        <StatusBadge status={m.status} size="sm" />
                      )}

                      <Link
                        href={`/matches/${m.id}`}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold transition-colors"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 rounded-xl esports-glass border border-slate-800 text-center text-xs text-slate-400">
              Tim belum memulai pertandingan pertamanya di turnamen ini.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
