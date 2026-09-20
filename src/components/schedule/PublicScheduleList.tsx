"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useTournamentRealtime } from "@/lib/hooks/useRealtime";
import { Calendar, Clock, MapPin, User, Search, Filter, ArrowRight } from "lucide-react";

interface ScheduleMatchItem {
  id: string;
  matchNumber: number;
  matchCode: string;
  round: string;
  status: string;
  scoreA: number;
  scoreB: number;
  scheduledAt: string | null;
  venue?: { name: string } | null;
  referee?: { displayName: string } | null;
  pj?: { displayName: string } | null;
  observer?: { displayName: string } | null;
  teamA?: { id: string; name: string; shortName: string } | null;
  teamB?: { id: string; name: string; shortName: string } | null;
  winner?: { id: string; name: string } | null;
}

interface PublicScheduleListProps {
  initialMatches: ScheduleMatchItem[];
  tournamentId: string;
  venues: Array<{ id: string; name: string }>;
}

export function PublicScheduleList({
  initialMatches,
  tournamentId,
  venues,
}: PublicScheduleListProps) {
  const [matches, setMatches] = useState<ScheduleMatchItem[]>(initialMatches);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [roundFilter, setRoundFilter] = useState<string>("ALL");
  const [venueFilter, setVenueFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchMatches = async () => {
    try {
      const res = await fetch("/api/matches");
      const data = await res.json();
      if (data.matches) setMatches(data.matches);
    } catch (e) {
      console.error(e);
    }
  };

  useTournamentRealtime(tournamentId, (event) => {
    if (
      event.type === "SCHEDULE_CHANGED" ||
      event.type === "MATCH_UPDATED" ||
      event.type === "RESULT_SUBMITTED"
    ) {
      fetchMatches();
    }
  });

  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
      // Status filter
      if (statusFilter === "LIVE" && m.status !== "LIVE") return false;
      if (statusFilter === "UPCOMING" && m.status !== "SCHEDULED" && m.status !== "READY")
        return false;
      if (statusFilter === "COMPLETED" && m.status !== "COMPLETED") return false;

      // Round filter
      if (roundFilter !== "ALL" && m.round !== roundFilter) return false;

      // Venue filter
      if (venueFilter !== "ALL" && m.venue?.name !== venueFilter) return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchCode = m.matchCode.toLowerCase();
        const teamA = m.teamA?.name?.toLowerCase() || "";
        const teamB = m.teamB?.name?.toLowerCase() || "";
        return matchCode.includes(q) || teamA.includes(q) || teamB.includes(q);
      }

      return true;
    });
  }, [matches, statusFilter, roundFilter, venueFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header and Filter Bar */}
      <div className="p-4 sm:p-6 rounded-2xl esports-glass border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <Calendar className="w-6 h-6 text-cyan-400" />
              Jadwal Pertandingan Turnamen
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Pantau jadwal harian, status operasional, dan penugasan wasit di setiap arena.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari tim atau kode match (cth: M01)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80 text-xs">
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            {["ALL", "LIVE", "UPCOMING", "COMPLETED"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded font-bold transition-colors ${
                  statusFilter === st
                    ? "bg-cyan-500 text-slate-950"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {st === "ALL"
                  ? "Semua"
                  : st === "LIVE"
                  ? "● LIVE"
                  : st === "UPCOMING"
                  ? "Akan Datang"
                  : "Selesai"}
              </button>
            ))}
          </div>

          {/* Round Selector */}
          <select
            value={roundFilter}
            onChange={(e) => setRoundFilter(e.target.value)}
            className="bg-slate-950 text-slate-300 border border-slate-800 rounded-lg px-3 py-1.5 font-medium focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">Semua Babak</option>
            <option value="ROUND_OF_32">Round of 32</option>
            <option value="ROUND_OF_16">Round of 16</option>
            <option value="QUARTER_FINAL">Quarter Final</option>
            <option value="SEMI_FINAL">Semi Final</option>
            <option value="FINAL">Grand Final</option>
          </select>

          {/* Venue Selector */}
          <select
            value={venueFilter}
            onChange={(e) => setVenueFilter(e.target.value)}
            className="bg-slate-950 text-slate-300 border border-slate-800 rounded-lg px-3 py-1.5 font-medium focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">Semua Venue Arena</option>
            {venues.map((v) => (
              <option key={v.id} value={v.name}>
                {v.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Schedule Items List */}
      <div className="space-y-3">
        {filteredMatches.length > 0 ? (
          filteredMatches.map((m) => {
            const isLive = m.status === "LIVE";
            const isCompleted = m.status === "COMPLETED";
            const formattedTime = m.scheduledAt
              ? new Intl.DateTimeFormat("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: "Asia/Jakarta",
                }).format(new Date(m.scheduledAt)) + " WIB"
              : "Menunggu Giliran";

            return (
              <div
                key={m.id}
                className={`p-4 sm:p-5 rounded-xl border transition-all ${
                  isLive
                    ? "bg-slate-900/90 border-red-500/50 shadow-lg shadow-red-950/30"
                    : isCompleted
                    ? "bg-slate-900/60 border-slate-800/80"
                    : "bg-slate-950/70 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Match Info & Time */}
                  <div className="flex items-center gap-4 min-w-[200px]">
                    <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-center font-mono shrink-0">
                      <span className="block font-black text-cyan-400 text-sm">{m.matchCode}</span>
                      <span className="text-[10px] text-slate-400">
                        {m.round.replace(/_/g, " ")}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold">
                        <Clock className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{formattedTime}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span>{m.venue?.name ?? "Arena Turnamen"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Teams Duel */}
                  <div className="flex-1 flex items-center justify-center gap-3 sm:gap-6 py-2 px-2 sm:px-6 bg-slate-950/50 rounded-xl border border-slate-850">
                    <div className="flex-1 text-right">
                      <span className="text-xs sm:text-sm font-black text-white block truncate">
                        {m.teamA?.name ?? "TBD"}
                      </span>
                      {isCompleted && m.winner?.id === m.teamA?.id && (
                        <span className="text-[10px] font-bold text-amber-400">WINNER</span>
                      )}
                    </div>

                    {/* Score / VS */}
                    <div className="px-3 py-1 rounded bg-slate-900 font-mono text-sm sm:text-base font-black text-cyan-400 shrink-0 border border-slate-800">
                      {isCompleted || isLive ? `${m.scoreA} — ${m.scoreB}` : "VS"}
                    </div>

                    <div className="flex-1 text-left">
                      <span className="text-xs sm:text-sm font-black text-white block truncate">
                        {m.teamB?.name ?? "TBD"}
                      </span>
                      {isCompleted && m.winner?.id === m.teamB?.id && (
                        <span className="text-[10px] font-bold text-amber-400">WINNER</span>
                      )}
                    </div>
                  </div>

                  {/* Status and Action */}
                  <div className="flex items-center justify-between lg:justify-end gap-3 min-w-[180px]">
                    <StatusBadge status={m.status} size="sm" />
                    <Link
                      href={`/matches/${m.id}`}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-cyan-300 transition-colors"
                    >
                      Detail <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>

                {/* Staff Assignment safe public display */}
                {(m.referee || m.pj) && (
                  <div className="mt-3 pt-3 border-t border-slate-850/80 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                    {m.referee && (
                      <span className="flex items-center gap-1.5">
                        <User className="w-3 h-3 text-cyan-400" />
                        Wasit: <strong className="text-slate-200">{m.referee.displayName}</strong>
                      </span>
                    )}
                    {m.pj && (
                      <span className="flex items-center gap-1.5">
                        <User className="w-3 h-3 text-emerald-400" />
                        PJ: <strong className="text-slate-200">{m.pj.displayName}</strong>
                      </span>
                    )}
                    {m.observer && (
                      <span className="flex items-center gap-1.5">
                        <User className="w-3 h-3 text-purple-400" />
                        Observer: <strong className="text-slate-200">{m.observer.displayName}</strong>
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="p-12 rounded-2xl esports-glass border border-slate-800 text-center space-y-2">
            <p className="text-slate-400 font-medium">Tidak ada pertandingan dengan filter yang dipilih.</p>
            <button
              onClick={() => {
                setStatusFilter("ALL");
                setRoundFilter("ALL");
                setVenueFilter("ALL");
                setSearchQuery("");
              }}
              className="text-xs text-cyan-400 hover:underline font-bold"
            >
              Reset Filter
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
