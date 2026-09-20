import React from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Trophy, Shield } from "lucide-react";

export interface BracketMatchData {
  id: string;
  matchNumber: number;
  matchCode: string;
  round: string;
  status: string;
  scoreA: number;
  scoreB: number;
  winnerId: string | null;
  scheduledAt?: string | Date | null;
  teamA?: {
    id: string;
    name: string;
    shortName: string;
    tag?: string;
  } | null;
  teamB?: {
    id: string;
    name: string;
    shortName: string;
    tag?: string;
  } | null;
  venue?: {
    name: string;
  } | null;
}

interface BracketMatchCardProps {
  match: BracketMatchData;
  compact?: boolean;
  isAdmin?: boolean;
}

export function BracketMatchCard({ match, compact = false, isAdmin = false }: BracketMatchCardProps) {
  const isCompleted = match.status === "COMPLETED";
  const isLive = match.status === "LIVE";
  const teamAWon = isCompleted && match.winnerId && match.winnerId === match.teamA?.id;
  const teamBWon = isCompleted && match.winnerId && match.winnerId === match.teamB?.id;

  const targetUrl = isAdmin ? `/admin/matches/${match.id}` : `/matches/${match.id}`;

  return (
    <Link
      href={targetUrl}
      className={`block group transition-all duration-200 rounded-lg overflow-hidden border ${
        isLive
          ? "bg-slate-900/95 border-red-500/50 shadow-md shadow-red-950/50 hover:border-red-400"
          : isCompleted
          ? "bg-slate-900/80 border-slate-800 hover:border-cyan-500/50"
          : "bg-slate-950/70 border-slate-800/80 hover:border-slate-700"
      } ${compact ? "w-64" : "w-72"}`}
    >
      {/* Match Header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950/70 border-b border-slate-850 text-[11px]">
        <div className="flex items-center gap-1.5">
          <span className="font-mono font-black text-cyan-400">{match.matchCode}</span>
          {match.venue && (
            <span className="text-slate-500 truncate max-w-[90px]">{match.venue.name}</span>
          )}
        </div>
        <StatusBadge status={match.status} size="sm" />
      </div>

      {/* Teams and Scores */}
      <div className="p-2.5 space-y-1.5">
        {/* Team A */}
        <div
          className={`flex items-center justify-between px-2.5 py-1.5 rounded transition-colors ${
            teamAWon
              ? "bg-emerald-950/40 text-emerald-300 font-bold border border-emerald-500/30"
              : match.teamA
              ? "text-slate-200"
              : "text-slate-600 italic text-xs"
          }`}
        >
          <div className="flex items-center gap-2 truncate">
            {teamAWon ? (
              <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            ) : (
              <Shield className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            )}
            <span className="truncate text-xs tracking-wide">
              {match.teamA?.name ?? "TBD (Menunggu)"}
            </span>
          </div>
          <span
            className={`font-mono text-xs font-black px-1.5 py-0.5 rounded ${
              teamAWon
                ? "bg-emerald-500/20 text-emerald-400"
                : isCompleted
                ? "text-slate-500"
                : "text-slate-400"
            }`}
          >
            {match.scoreA}
          </span>
        </div>

        {/* Team B */}
        <div
          className={`flex items-center justify-between px-2.5 py-1.5 rounded transition-colors ${
            teamBWon
              ? "bg-emerald-950/40 text-emerald-300 font-bold border border-emerald-500/30"
              : match.teamB
              ? "text-slate-200"
              : "text-slate-600 italic text-xs"
          }`}
        >
          <div className="flex items-center gap-2 truncate">
            {teamBWon ? (
              <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            ) : (
              <Shield className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            )}
            <span className="truncate text-xs tracking-wide">
              {match.teamB?.name ?? "TBD (Menunggu)"}
            </span>
          </div>
          <span
            className={`font-mono text-xs font-black px-1.5 py-0.5 rounded ${
              teamBWon
                ? "bg-emerald-500/20 text-emerald-400"
                : isCompleted
                ? "text-slate-500"
                : "text-slate-400"
            }`}
          >
            {match.scoreB}
          </span>
        </div>
      </div>
    </Link>
  );
}
