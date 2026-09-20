import React from "react";
import { AdminNavbar } from "@/components/layout/AdminNavbar";
import { getActiveTournament } from "@/lib/services/tournament.service";
import { prisma } from "@/lib/prisma";
import { Building, MapPin, Users, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";

export const revalidate = 0;

export default async function AdminVenuesPage() {
  const tournament = await getActiveTournament();
  if (!tournament) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p>Belum ada turnamen.</p>
      </div>
    );
  }

  const venues = await prisma.venue.findMany({
    where: { tournamentId: tournament.id },
    include: {
      matches: {
        where: { status: { in: ["READY", "LIVE", "SCHEDULED"] } },
        orderBy: { scheduledAt: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col">
      <AdminNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="p-6 rounded-2xl esports-glass border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
              <Building className="w-6 h-6 text-cyan-400" />
              Kelola Arena Venue Pertandingan
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Daftar bilik arena turnamen fisik, lab esports, panggung utama, dan kapasitas peserta.
            </p>
          </div>

          <div className="text-xs font-mono text-cyan-400 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800">
            {venues.length} Arena Tersedia
          </div>
        </div>

        {/* Venues Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {venues.map((v) => (
            <div
              key={v.id}
              className="p-5 rounded-2xl esports-glass border border-slate-800 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h2 className="text-lg font-black text-white">{v.name}</h2>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    {v.location || "Lokasi Gedung Utama"}
                  </p>
                </div>

                <span className="px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                  {v.status}
                </span>
              </div>

              <div className="flex items-center gap-6 text-xs text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  Kapasitas: <strong>{v.capacity} Orang</strong>
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                  Match Aktif / Menunggu: <strong>{v.matches.length}</strong>
                </span>
              </div>

              {v.matches.length > 0 && (
                <div className="pt-3 border-t border-slate-850 space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Jadwal Pertandingan Terdekat di Arena Ini:
                  </span>
                  <div className="space-y-1 text-xs">
                    {v.matches.map((m) => (
                      <Link
                        key={m.id}
                        href={`/admin/matches/${m.id}`}
                        className="p-2 rounded-lg bg-slate-950/70 border border-slate-850 hover:border-cyan-500/30 flex items-center justify-between text-slate-300 hover:text-white transition-colors block"
                      >
                        <span className="font-mono font-bold text-cyan-400">{m.matchCode}</span>
                        <span className="font-semibold text-slate-200">
                          {m.round.replace(/_/g, " ")}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Status: <strong>{m.status}</strong>
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
