import React from "react";
import { AdminNavbar } from "@/components/layout/AdminNavbar";
import { AdminBracketManager } from "@/components/admin/AdminBracketManager";
import { getActiveTournament } from "@/lib/services/tournament.service";
import { getBracketSlots, validateBracket } from "@/lib/services/bracket.service";
import { getTeams } from "@/lib/services/team.service";

export const revalidate = 0;

export default async function AdminBracketPage() {
  const tournament = await getActiveTournament();
  if (!tournament) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p>Belum ada turnamen yang dibuat.</p>
      </div>
    );
  }

  const [slots, validation, teams] = await Promise.all([
    getBracketSlots(tournament.id),
    validateBracket(tournament.id),
    getTeams(tournament.id),
  ]);

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col">
      <AdminNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AdminBracketManager
          initialTournament={tournament}
          initialSlots={slots as any}
          initialValidation={validation}
          availableTeams={teams as any}
        />
      </main>
    </div>
  );
}
