import React from "react";
import Link from "next/link";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { getActiveTournament } from "@/lib/services/tournament.service";
import { getTeams } from "@/lib/services/team.service";
import { Users, Shield, ArrowRight, Trophy } from "lucide-react";

export const revalidate = 10;

export default async function PublicTeamsPage() {
  const tournament = await getActiveTournament();
  if (!tournament) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <p>Turnamen belum aktif.</p>
      </div>
    );
  }

  const teams = await getTeams(tournament.id);

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col">
      <PublicNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="p-6 rounded-2xl esports-glass border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
              <Users className="w-7 h-7 text-cyan-400" />
              Daftar 32 Tim Peserta Resmi
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Seluruh tim yang telah lolos verifikasi berkas dan mengikuti Technical Meeting resmi.
            </p>
          </div>

          <div className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-center shrink-0">
            <span className="text-xl font-black text-amber-400 block">{teams.length} / 32</span>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Tim Terdaftar
            </span>
          </div>
        </div>

        {/* Teams Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {teams.map((t) => (
            <Link
              key={t.id}
              href={`/teams/${t.id}`}
              className="group p-4 rounded-xl esports-glass border border-slate-800 hover:border-cyan-500/50 transition-all flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-black bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                    {t.tag}
                  </span>
                  {t.bracketSlot && (
                    <span className="text-[11px] font-bold text-slate-400">
                      Slot #{t.bracketSlot.slotNumber}
                    </span>
                  )}
                </div>

                <div>
                  <h2 className="font-black text-white text-base group-hover:text-cyan-300 transition-colors">
                    {t.name}
                  </h2>
                  <p className="text-xs text-slate-400 truncate mt-0.5">
                    Kapten: {t.captainName || "Belum terdaftar"}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-850 flex items-center justify-between text-xs text-slate-400">
                <span>{t.players.length} Pemain</span>
                <span className="text-cyan-400 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                  Profil <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
