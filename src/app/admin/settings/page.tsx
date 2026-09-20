import React from "react";
import { AdminNavbar } from "@/components/layout/AdminNavbar";
import { AdminDevSettings } from "@/components/admin/AdminDevSettings";
import { getActiveTournament } from "@/lib/services/tournament.service";

export const revalidate = 0;

export default async function AdminSettingsPage() {
  const tournament = await getActiveTournament();
  if (!tournament) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p>Belum ada turnamen.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col">
      <AdminNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AdminDevSettings tournament={tournament} />
      </main>
    </div>
  );
}
