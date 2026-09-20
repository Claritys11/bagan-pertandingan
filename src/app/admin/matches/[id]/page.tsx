import React from "react";
import { notFound } from "next/navigation";
import { AdminNavbar } from "@/components/layout/AdminNavbar";
import { AdminMatchDetailCockpit } from "@/components/admin/AdminMatchDetailCockpit";
import { getMatchById } from "@/lib/services/match.service";
import { prisma } from "@/lib/prisma";

export const revalidate = 0;

export default async function AdminMatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const match = await getMatchById(id);

  if (!match) {
    notFound();
  }

  const [venues, staffList] = await Promise.all([
    prisma.venue.findMany({
      where: { tournamentId: match.tournamentId },
      select: { id: true, name: true },
    }),
    prisma.staff.findMany({
      where: { tournamentId: match.tournamentId },
      select: { id: true, displayName: true, role: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col">
      <AdminNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AdminMatchDetailCockpit
          match={match as any}
          venues={venues}
          staffList={staffList}
        />
      </main>
    </div>
  );
}
