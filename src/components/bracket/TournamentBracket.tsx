"use client";

import React, { useState, useEffect } from "react";
import { BracketMatchCard, BracketMatchData } from "./BracketMatchCard";
import { useTournamentRealtime } from "@/lib/hooks/useRealtime";
import { Trophy, RefreshCw, Smartphone, Monitor } from "lucide-react";

interface TournamentBracketProps {
  initialMatches: BracketMatchData[];
  tournamentId: string;
  tournamentName?: string;
  championTeam?: { id: string; name: string } | null;
  runnerUpTeam?: { id: string; name: string } | null;
  isAdmin?: boolean;
}

export function TournamentBracket({
  initialMatches,
  tournamentId,
  tournamentName,
  championTeam,
  runnerUpTeam,
  isAdmin = false,
}: TournamentBracketProps) {
  const [matches, setMatches] = useState<BracketMatchData[]>(initialMatches);
  const [activeMobileRound, setActiveMobileRound] = useState<string>("ROUND_OF_32");
  const [mobileSideFilter, setMobileSideFilter] = useState<"ALL" | "LEFT" | "RIGHT">("ALL");
  const [viewMode, setViewMode] = useState<"auto" | "desktop" | "mobile">("auto");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchMatches = async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch(`/api/matches`);
      const data = await res.json();
      if (data.matches) {
        setMatches(data.matches);
      }
    } catch (e) {
      console.error("Failed to fetch matches:", e);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Realtime live update on result submissions or bracket updates
  useTournamentRealtime(tournamentId, (event) => {
    if (
      event.type === "RESULT_SUBMITTED" ||
      event.type === "BRACKET_LOCKED" ||
      event.type === "BRACKET_UPDATED" ||
      event.type === "MATCH_UPDATED"
    ) {
      fetchMatches();
    }
  });

  const getMatchByNumber = (num: number) => matches.find((m) => m.matchNumber === num);

  // Left Bracket matches
  const leftR32 = [1, 2, 3, 4, 5, 6, 7, 8].map(getMatchByNumber).filter(Boolean) as BracketMatchData[];
  const leftR16 = [17, 18, 19, 20].map(getMatchByNumber).filter(Boolean) as BracketMatchData[];
  const leftQF = [25, 26].map(getMatchByNumber).filter(Boolean) as BracketMatchData[];
  const leftSF = [29].map(getMatchByNumber).filter(Boolean) as BracketMatchData[];

  // Right Bracket matches
  const rightR32 = [9, 10, 11, 12, 13, 14, 15, 16].map(getMatchByNumber).filter(Boolean) as BracketMatchData[];
  const rightR16 = [21, 22, 23, 24].map(getMatchByNumber).filter(Boolean) as BracketMatchData[];
  const rightQF = [27, 28].map(getMatchByNumber).filter(Boolean) as BracketMatchData[];
  const rightSF = [30].map(getMatchByNumber).filter(Boolean) as BracketMatchData[];

  // Final match
  const finalMatch = getMatchByNumber(31);

  // Mobile filtered matches
  const getMobileMatches = () => {
    let filtered = matches.filter((m) => m.round === activeMobileRound);
    if (activeMobileRound !== "FINAL" && mobileSideFilter !== "ALL") {
      filtered = filtered.filter((m) => {
        if (mobileSideFilter === "LEFT") {
          return [1, 2, 3, 4, 5, 6, 7, 8, 17, 18, 19, 20, 25, 26, 29].includes(m.matchNumber);
        } else {
          return [9, 10, 11, 12, 13, 14, 15, 16, 21, 22, 23, 24, 27, 28, 30].includes(m.matchNumber);
        }
      });
    }
    return filtered.sort((a, b) => a.matchNumber - b.matchNumber);
  };

  return (
    <div className="w-full space-y-6">
      {/* Bracket Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl esports-glass border border-slate-800">
        <div>
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            Bagan Resmi 32 Tim Single Elimination
          </h2>
          <p className="text-xs text-slate-400">
            Pemenang setiap pertandingan otomatis maju ke slot bagan babak berikutnya.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Refresh manual button */}
          <button
            onClick={fetchMatches}
            disabled={isRefreshing}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
            title="Muat ulang data bagan"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-cyan-400" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* View toggle (desktop/mobile switch) */}
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode("auto")}
              className={`px-2.5 py-1 rounded font-medium ${
                viewMode === "auto" ? "bg-cyan-500/20 text-cyan-300 font-bold" : "text-slate-400"
              }`}
            >
              Auto
            </button>
            <button
              onClick={() => setViewMode("desktop")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded font-medium ${
                viewMode === "desktop" ? "bg-cyan-500/20 text-cyan-300 font-bold" : "text-slate-400"
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Desktop Tree</span>
            </button>
            <button
              onClick={() => setViewMode("mobile")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded font-medium ${
                viewMode === "mobile" ? "bg-cyan-500/20 text-cyan-300 font-bold" : "text-slate-400"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Mobile Cards</span>
            </button>
          </div>
        </div>
      </div>

      {/* Champion Banner (If Final Completed) */}
      {(championTeam || finalMatch?.winnerId) && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-500/20 via-amber-400/10 to-amber-500/20 border border-amber-500/40 text-center relative overflow-hidden shadow-2xl shadow-amber-500/10">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 mb-2">
            <Trophy className="w-8 h-8 text-amber-400 animate-bounce" />
          </div>
          <span className="block text-xs font-black tracking-widest text-amber-400 uppercase">
            TOURNAMENT CHAMPION
          </span>
          <h3 className="text-2xl sm:text-3xl font-black text-white mt-1 gold-glow">
            🏆 {championTeam?.name ?? finalMatch?.teamA?.id === finalMatch?.winnerId ? finalMatch?.teamA?.name : finalMatch?.teamB?.name}
          </h3>
          {runnerUpTeam && (
            <p className="text-xs text-slate-300 mt-1">
              Runner Up (Juara 2): <span className="font-bold text-slate-100">{runnerUpTeam.name}</span>
            </p>
          )}
        </div>
      )}

      {/* =========================================
          DESKTOP SYMMETRICAL TOURNAMENT BRACKET
         ========================================= */}
      <div
        className={`w-full overflow-x-auto pb-8 pt-4 ${
          viewMode === "mobile" ? "hidden" : viewMode === "auto" ? "hidden xl:block" : "block"
        }`}
      >
        <div className="min-w-[1440px] flex justify-between gap-6 px-4">
          {/* LEFT SIDE BRACKET */}
          <div className="flex gap-6">
            {/* Left Round of 32 */}
            <div className="space-y-4">
              <div className="text-center font-black text-xs text-cyan-400 tracking-wider uppercase pb-2 border-b border-cyan-900/50">
                Round of 32 (Kiri)
              </div>
              <div className="flex flex-col gap-4">
                {leftR32.map((match) => (
                  <BracketMatchCard key={match.id} match={match} compact isAdmin={isAdmin} />
                ))}
              </div>
            </div>

            {/* Left Round of 16 */}
            <div className="space-y-4">
              <div className="text-center font-black text-xs text-cyan-400 tracking-wider uppercase pb-2 border-b border-cyan-900/50">
                Round of 16
              </div>
              <div className="flex flex-col justify-around h-full py-6 gap-12">
                {leftR16.map((match) => (
                  <BracketMatchCard key={match.id} match={match} compact isAdmin={isAdmin} />
                ))}
              </div>
            </div>

            {/* Left Quarter Finals */}
            <div className="space-y-4">
              <div className="text-center font-black text-xs text-cyan-400 tracking-wider uppercase pb-2 border-b border-cyan-900/50">
                Quarter Final
              </div>
              <div className="flex flex-col justify-around h-full py-16 gap-24">
                {leftQF.map((match) => (
                  <BracketMatchCard key={match.id} match={match} compact isAdmin={isAdmin} />
                ))}
              </div>
            </div>

            {/* Left Semi Final */}
            <div className="space-y-4">
              <div className="text-center font-black text-xs text-cyan-400 tracking-wider uppercase pb-2 border-b border-cyan-900/50">
                Semi Final 1
              </div>
              <div className="flex flex-col justify-center h-full">
                {leftSF.map((match) => (
                  <BracketMatchCard key={match.id} match={match} compact isAdmin={isAdmin} />
                ))}
              </div>
            </div>
          </div>

          {/* CENTER: GRAND FINAL */}
          <div className="flex flex-col items-center justify-center px-4 space-y-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shadow-xl shadow-amber-500/20 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-slate-950" />
            </div>
            <div className="text-center font-black text-sm text-amber-400 tracking-widest uppercase">
              GRAND FINAL
            </div>
            {finalMatch && <BracketMatchCard match={finalMatch} isAdmin={isAdmin} />}
          </div>

          {/* RIGHT SIDE BRACKET */}
          <div className="flex gap-6 flex-row-reverse">
            {/* Right Round of 32 */}
            <div className="space-y-4">
              <div className="text-center font-black text-xs text-cyan-400 tracking-wider uppercase pb-2 border-b border-cyan-900/50">
                Round of 32 (Kanan)
              </div>
              <div className="flex flex-col gap-4">
                {rightR32.map((match) => (
                  <BracketMatchCard key={match.id} match={match} compact isAdmin={isAdmin} />
                ))}
              </div>
            </div>

            {/* Right Round of 16 */}
            <div className="space-y-4">
              <div className="text-center font-black text-xs text-cyan-400 tracking-wider uppercase pb-2 border-b border-cyan-900/50">
                Round of 16
              </div>
              <div className="flex flex-col justify-around h-full py-6 gap-12">
                {rightR16.map((match) => (
                  <BracketMatchCard key={match.id} match={match} compact isAdmin={isAdmin} />
                ))}
              </div>
            </div>

            {/* Right Quarter Finals */}
            <div className="space-y-4">
              <div className="text-center font-black text-xs text-cyan-400 tracking-wider uppercase pb-2 border-b border-cyan-900/50">
                Quarter Final
              </div>
              <div className="flex flex-col justify-around h-full py-16 gap-24">
                {rightQF.map((match) => (
                  <BracketMatchCard key={match.id} match={match} compact isAdmin={isAdmin} />
                ))}
              </div>
            </div>

            {/* Right Semi Final */}
            <div className="space-y-4">
              <div className="text-center font-black text-xs text-cyan-400 tracking-wider uppercase pb-2 border-b border-cyan-900/50">
                Semi Final 2
              </div>
              <div className="flex flex-col justify-center h-full">
                {rightSF.map((match) => (
                  <BracketMatchCard key={match.id} match={match} compact isAdmin={isAdmin} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================
          MOBILE-FRIENDLY ROUND TABS & CARDS VIEW
         ========================================= */}
      <div
        className={`w-full space-y-4 ${
          viewMode === "desktop" ? "hidden" : viewMode === "auto" ? "block xl:hidden" : "block"
        }`}
      >
        {/* Round Switcher Tabs */}
        <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar">
          {[
            { id: "ROUND_OF_32", label: "Round of 32 (16 Match)" },
            { id: "ROUND_OF_16", label: "Round of 16 (8 Match)" },
            { id: "QUARTER_FINAL", label: "Quarter Final (4 Match)" },
            { id: "SEMI_FINAL", label: "Semi Final (2 Match)" },
            { id: "FINAL", label: "Grand Final (1 Match)" },
          ].map((r) => (
            <button
              key={r.id}
              onClick={() => setActiveMobileRound(r.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeMobileRound === r.id
                  ? "bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/25"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Side Filter for R32, R16, QF */}
        {activeMobileRound !== "FINAL" && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Sisi Bagan:</span>
            <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => setMobileSideFilter("ALL")}
                className={`px-3 py-1 rounded font-semibold ${
                  mobileSideFilter === "ALL" ? "bg-slate-800 text-white" : "text-slate-400"
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setMobileSideFilter("LEFT")}
                className={`px-3 py-1 rounded font-semibold ${
                  mobileSideFilter === "LEFT" ? "bg-cyan-500/20 text-cyan-300" : "text-slate-400"
                }`}
              >
                Kiri (Left)
              </button>
              <button
                onClick={() => setMobileSideFilter("RIGHT")}
                className={`px-3 py-1 rounded font-semibold ${
                  mobileSideFilter === "RIGHT" ? "bg-cyan-500/20 text-cyan-300" : "text-slate-400"
                }`}
              >
                Kanan (Right)
              </button>
            </div>
          </div>
        )}

        {/* Mobile Matches Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {getMobileMatches().map((match) => (
            <div key={match.id} className="flex justify-center">
              <BracketMatchCard match={match} isAdmin={isAdmin} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
