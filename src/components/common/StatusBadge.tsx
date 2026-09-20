import React from "react";
import { MatchStatus, TournamentStatus } from "@prisma/client";
import { Play, CheckCircle2, Clock, AlertTriangle, XCircle, ShieldAlert, Lock } from "lucide-react";

interface StatusBadgeProps {
  status: MatchStatus | TournamentStatus | string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function StatusBadge({ status, size = "md", className = "" }: StatusBadgeProps) {
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs font-semibold gap-1",
    md: "px-2.5 py-1 text-xs font-bold gap-1.5",
    lg: "px-3.5 py-1.5 text-sm font-black gap-2 tracking-wide",
  };

  switch (status) {
    case "LIVE":
      return (
        <span
          className={`inline-flex items-center rounded-full bg-red-950/80 text-red-400 border border-red-500/40 shadow-sm shadow-red-900/40 ${sizeClasses[size]} ${className}`}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          LIVE
        </span>
      );

    case "READY":
      return (
        <span
          className={`inline-flex items-center rounded-full bg-amber-950/70 text-amber-300 border border-amber-500/40 ${sizeClasses[size]} ${className}`}
        >
          <Play className="w-3 h-3 fill-amber-400 text-amber-400" />
          READY
        </span>
      );

    case "SCHEDULED":
      return (
        <span
          className={`inline-flex items-center rounded-full bg-blue-950/70 text-blue-300 border border-blue-500/40 ${sizeClasses[size]} ${className}`}
        >
          <Clock className="w-3 h-3 text-blue-400" />
          SCHEDULED
        </span>
      );

    case "COMPLETED":
      return (
        <span
          className={`inline-flex items-center rounded-full bg-emerald-950/70 text-emerald-300 border border-emerald-500/40 ${sizeClasses[size]} ${className}`}
        >
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          SELESAI
        </span>
      );

    case "BRACKET_LOCKED":
    case "LOCKED":
      return (
        <span
          className={`inline-flex items-center rounded-full bg-indigo-950/80 text-indigo-300 border border-indigo-500/40 ${sizeClasses[size]} ${className}`}
        >
          <Lock className="w-3 h-3 text-indigo-400" />
          TERKUNCI
        </span>
      );

    case "POSTPONED":
      return (
        <span
          className={`inline-flex items-center rounded-full bg-yellow-950/70 text-yellow-300 border border-yellow-500/40 ${sizeClasses[size]} ${className}`}
        >
          <AlertTriangle className="w-3 h-3 text-yellow-400" />
          DITUNDA
        </span>
      );

    case "CANCELLED":
    case "VOID":
      return (
        <span
          className={`inline-flex items-center rounded-full bg-slate-900 text-slate-400 border border-slate-700 ${sizeClasses[size]} ${className}`}
        >
          <XCircle className="w-3 h-3 text-slate-500" />
          DIBATALKAN
        </span>
      );

    case "DISPUTED":
      return (
        <span
          className={`inline-flex items-center rounded-full bg-rose-950/80 text-rose-300 border border-rose-500/50 ${sizeClasses[size]} ${className}`}
        >
          <ShieldAlert className="w-3 h-3 text-rose-400" />
          SENGKETA
        </span>
      );

    case "DRAFT":
    case "SETUP":
    default:
      return (
        <span
          className={`inline-flex items-center rounded-full bg-slate-800/80 text-slate-300 border border-slate-600/50 ${sizeClasses[size]} ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
          DRAFT
        </span>
      );
  }
}
