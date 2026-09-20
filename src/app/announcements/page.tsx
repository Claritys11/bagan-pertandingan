import React from "react";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { getActiveTournament } from "@/lib/services/tournament.service";
import { prisma } from "@/lib/prisma";
import { Bell, AlertTriangle, Info, ShieldAlert, Pin } from "lucide-react";

export const revalidate = 10;

export default async function PublicAnnouncementsPage() {
  const tournament = await getActiveTournament();
  if (!tournament) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <p>Turnamen belum aktif.</p>
      </div>
    );
  }

  const announcements = await prisma.announcement.findMany({
    where: { tournamentId: tournament.id, isPublished: true },
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col">
      <PublicNavbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="p-6 rounded-2xl esports-glass border border-slate-800">
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
            <Bell className="w-7 h-7 text-cyan-400" />
            Papan Pengumuman Resmi Turnamen
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Informasi resmi, perubahan jadwal darurat, dan pemberitahuan panitia turnamen.
          </p>
        </div>

        <div className="space-y-4">
          {announcements.map((a) => {
            const formattedDate = new Intl.DateTimeFormat("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              timeZone: "Asia/Jakarta",
            }).format(new Date(a.createdAt));

            return (
              <div
                key={a.id}
                className={`p-5 rounded-xl border space-y-2 ${
                  a.severity === "URGENT"
                    ? "bg-red-950/40 border-red-500/40"
                    : a.severity === "WARNING"
                    ? "bg-amber-950/40 border-amber-500/40"
                    : "esports-glass border-slate-800"
                }`}
              >
                <div className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    {a.isPinned && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        <Pin className="w-3 h-3" /> DISEMATKAN
                      </span>
                    )}
                    <span className="text-slate-400">{formattedDate} WIB</span>
                  </div>

                  <span className="text-slate-400">
                    Oleh: <strong className="text-slate-200">{a.authorName || "Panitia"}</strong>
                  </span>
                </div>

                <h2 className="text-base sm:text-lg font-black text-white">{a.title}</h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                  {a.content}
                </p>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
