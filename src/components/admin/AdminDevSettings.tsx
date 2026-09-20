"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { StatusBadge } from "@/components/common/StatusBadge";
import {
  Settings,
  Sparkles,
  Trophy,
  RefreshCw,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Play,
} from "lucide-react";
import { TournamentStatus } from "@prisma/client";

interface AdminDevSettingsProps {
  tournament: any;
}

export function AdminDevSettings({ tournament }: AdminDevSettingsProps) {
  const router = useRouter();
  const [currentTournament, setCurrentTournament] = useState(tournament);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleDevAction = async (action: string) => {
    try {
      setLoadingAction(action);
      setActionFeedback(null);

      const res = await fetch("/api/admin/dev-tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setActionFeedback({ type: "success", text: data.message || "Aksi berhasil dijalankan!" });
      router.refresh();
    } catch (err: any) {
      setActionFeedback({ type: "error", text: err.message });
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl esports-glass border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-cyan-400" />
            Pengaturan Platform & Alat Operasional Turnamen
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Alat cepat untuk Technical Meeting, uji coba simulasi alur kemenangan otomatis, dan
            manajemen status turnamen.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge status={currentTournament.status} size="md" />
        </div>
      </div>

      {actionFeedback && (
        <div
          className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 border ${
            actionFeedback.type === "success"
              ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300"
              : "bg-rose-950/60 border-rose-500/40 text-rose-300"
          }`}
        >
          {actionFeedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{actionFeedback.text}</span>
        </div>
      )}

      {/* OPERATIONS & SIMULATION TOOLS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* FAST-FILL & DRAW SIMULATION */}
        <div className="p-6 rounded-2xl esports-glass border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-black text-white">Alat Cepat Technical Meeting</h2>
          </div>

          <p className="text-xs text-slate-400">
            Gunakan tombol ini untuk mempercepat simulasi atau pengujian jalannya turnamen tanpa perlu
            mengetik 32 slot undian satu per satu secara manual.
          </p>

          <div className="space-y-3 pt-2">
            <button
              onClick={() => handleDevAction("QUICK_FILL_DRAW")}
              disabled={loadingAction !== null}
              className="w-full p-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/40 text-left text-xs space-y-0.5 transition-all flex items-center justify-between"
            >
              <div>
                <span className="font-bold text-white block">1. Isi Otomatis 32 Slot Undian</span>
                <span className="text-slate-400 text-[11px]">
                  Memetakan 32 tim terdaftar ke slot #01 - #32
                </span>
              </div>
              {loadingAction === "QUICK_FILL_DRAW" ? (
                <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
              ) : (
                <Play className="w-4 h-4 text-cyan-400" />
              )}
            </button>

            <button
              onClick={() => handleDevAction("LOCK_BRACKET")}
              disabled={loadingAction !== null}
              className="w-full p-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/40 text-left text-xs space-y-0.5 transition-all flex items-center justify-between"
            >
              <div>
                <span className="font-bold text-white block">2. Kunci Bagan Resmi</span>
                <span className="text-slate-400 text-[11px]">
                  Validasi kelengkapan dan generate 16 match babak pertama
                </span>
              </div>
              {loadingAction === "LOCK_BRACKET" ? (
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
              ) : (
                <Play className="w-4 h-4 text-emerald-400" />
              )}
            </button>
          </div>
        </div>

        {/* PROGRESSION SIMULATOR */}
        <div className="p-6 rounded-2xl esports-glass border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Trophy className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-black text-white">Simulasi Otomatisasi Bagan</h2>
          </div>

          <p className="text-xs text-slate-400">
            Uji alur otomatis majunya pemenang (Automated Progression) ke babak berikutnya hingga
            muncul Juara Turnamen.
          </p>

          <div className="space-y-3 pt-2">
            <button
              onClick={() => handleDevAction("SIMULATE_R32")}
              disabled={loadingAction !== null}
              className="w-full p-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/40 text-left text-xs space-y-0.5 transition-all flex items-center justify-between"
            >
              <div>
                <span className="font-bold text-white block">Simulasikan Hasil Round of 32</span>
                <span className="text-slate-400 text-[11px]">
                  Otomatis memenangkan Tim A di M01 - M16 dan memajukannya ke Round of 16
                </span>
              </div>
              {loadingAction === "SIMULATE_R32" ? (
                <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
              ) : (
                <Play className="w-4 h-4 text-cyan-400" />
              )}
            </button>

            <button
              onClick={() => handleDevAction("SIMULATE_CHAMPION")}
              disabled={loadingAction !== null}
              className="w-full p-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/40 text-left text-xs space-y-0.5 transition-all flex items-center justify-between"
            >
              <div>
                <span className="font-bold text-white block">
                  Simulasikan Turnamen Hingga Grand Final (Champion)
                </span>
                <span className="text-slate-400 text-[11px]">
                  Menyelesaikan seluruh match hingga Juara 1 & 2 dinobatkan
                </span>
              </div>
              {loadingAction === "SIMULATE_CHAMPION" ? (
                <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
              ) : (
                <Trophy className="w-4 h-4 text-amber-400" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* DANGER ZONE / RESET */}
      <div className="p-6 rounded-2xl bg-rose-950/20 border border-rose-500/40 space-y-4">
        <div className="flex items-center gap-2">
          <RotateCcw className="w-5 h-5 text-rose-400" />
          <h2 className="text-base font-black text-rose-300">Reset Data Uji Coba (Danger Zone)</h2>
        </div>

        <p className="text-xs text-slate-300">
          Mengembalikan status bagan ke awal (DRAFT bersih), mengosongkan skor seluruh pertandingan,
          dan membatalkan penguncian turnamen. Data 32 tim, wasit, dan venue tetap utuh.
        </p>

        <button
          onClick={() => {
            if (confirm("Apakah Anda yakin ingin mereset seluruh bagan dan hasil pertandingan ke DRAFT?")) {
              handleDevAction("RESET_DRAFT");
            }
          }}
          disabled={loadingAction !== null}
          className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs transition-all shadow-lg shadow-rose-950/50 flex items-center gap-1.5"
        >
          {loadingAction === "RESET_DRAFT" ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <RotateCcw className="w-4 h-4" />
          )}
          Reset Bagan & Pertandingan ke DRAFT Bersih
        </button>
      </div>
    </div>
  );
}
