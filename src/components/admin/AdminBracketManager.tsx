"use client";

import React, { useState } from "react";
import { StatusBadge } from "@/components/common/StatusBadge";
import {
  Trophy,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Sparkles,
  RefreshCw,
  HelpCircle,
} from "lucide-react";

interface SlotData {
  id: string;
  slotNumber: number;
  side: "LEFT" | "RIGHT";
  teamId: string | null;
  team?: {
    id: string;
    name: string;
    shortName: string;
    tag?: string;
  } | null;
}

interface TeamData {
  id: string;
  name: string;
  shortName: string;
  tag?: string;
}

interface ValidationData {
  isValid: boolean;
  errors: string[];
  stats: {
    totalSlots: number;
    filledSlots: number;
    uniqueTeams: number;
    totalRegisteredTeams: number;
  };
}

interface AdminBracketManagerProps {
  initialTournament: any;
  initialSlots: SlotData[];
  initialValidation: ValidationData;
  availableTeams: TeamData[];
}

export function AdminBracketManager({
  initialTournament,
  initialSlots,
  initialValidation,
  availableTeams,
}: AdminBracketManagerProps) {
  const [tournament, setTournament] = useState(initialTournament);
  const [slots, setSlots] = useState<SlotData[]>(initialSlots);
  const [validation, setValidation] = useState<ValidationData>(initialValidation);
  const [isLocking, setIsLocking] = useState(false);
  const [showLockConfirm, setShowLockConfirm] = useState(false);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideReason, setOverrideReason] = useState("");
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const isLocked =
    tournament.status === "BRACKET_LOCKED" ||
    tournament.status === "LIVE" ||
    tournament.status === "COMPLETED";

  const refreshData = async () => {
    try {
      const res = await fetch("/api/bracket");
      const data = await res.json();
      if (data.tournament) setTournament(data.tournament);
      if (data.slots) setSlots(data.slots);
      if (data.validation) setValidation(data.validation);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSlotChange = async (slotNumber: number, teamId: string) => {
    try {
      setActionMessage(null);
      const res = await fetch("/api/bracket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ASSIGN",
          tournamentId: tournament.id,
          slotNumber,
          teamId: teamId || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      await refreshData();
      setActionMessage({ type: "success", text: `Slot #${slotNumber} berhasil diperbarui.` });
    } catch (err: any) {
      setActionMessage({ type: "error", text: err.message });
    }
  };

  const handleLockBracket = async () => {
    try {
      setIsLocking(true);
      setActionMessage(null);
      const res = await fetch("/api/bracket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "LOCK",
          tournamentId: tournament.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setShowLockConfirm(false);
      await refreshData();
      setActionMessage({
        type: "success",
        text: "🔒 Bagan resmi berhasil dikunci! Seluruh 16 match babak pertama telah terisi.",
      });
    } catch (err: any) {
      setActionMessage({ type: "error", text: err.message });
    } finally {
      setIsLocking(false);
    }
  };

  const handleOverrideBracket = async () => {
    try {
      setIsLocking(true);
      setActionMessage(null);
      const res = await fetch("/api/bracket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "OVERRIDE",
          tournamentId: tournament.id,
          reason: overrideReason,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setShowOverrideModal(false);
      setOverrideReason("");
      await refreshData();
      setActionMessage({
        type: "success",
        text: "Override berhasil dilakukan. Status bagan kembali ke SETUP.",
      });
    } catch (err: any) {
      setActionMessage({ type: "error", text: err.message });
    } finally {
      setIsLocking(false);
    }
  };

  const handleQuickFill = async () => {
    try {
      setActionMessage(null);
      const res = await fetch("/api/admin/dev-tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "QUICK_FILL_DRAW" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      await refreshData();
      setActionMessage({ type: "success", text: data.message });
    } catch (err: any) {
      setActionMessage({ type: "error", text: err.message });
    }
  };

  const leftSlots = slots.filter((s) => s.side === "LEFT");
  const rightSlots = slots.filter((s) => s.side === "RIGHT");

  return (
    <div className="space-y-6">
      {/* Top Banner and Status */}
      <div className="p-6 rounded-2xl esports-glass border border-slate-800 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <StatusBadge status={tournament.status} size="md" />
              <span className="text-xs font-mono text-cyan-400 font-bold">
                PENGATURAN BAGAN FISIK (TECHNICAL MEETING DRAW)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Entri Bagan 32 Tim Single Elimination
            </h1>
            <p className="text-xs text-slate-400">
              Pengundian fisik dilakukan pada saat Technical Meeting. Panitia memasukkan nomor undian
              ke masing-masing slot bagan di bawah ini.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!isLocked ? (
              <>
                <button
                  onClick={handleQuickFill}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700 flex items-center gap-1.5"
                  title="Otomatis isi 32 slot sesuai urutan daftar tim untuk simulasi cepat"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Auto-Fill Undian Cepat
                </button>

                <button
                  onClick={() => setShowLockConfirm(true)}
                  disabled={!validation.isValid}
                  className={`px-5 py-2 rounded-xl text-xs font-black flex items-center gap-2 shadow-lg transition-all ${
                    validation.isValid
                      ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 shadow-emerald-500/25 hover:from-emerald-400 hover:to-teal-500 cursor-pointer"
                      : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  KUNCI BAGAN RESMI
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-lg bg-indigo-950 text-indigo-300 text-xs font-bold border border-indigo-500/40 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" /> BAGAN TERKUNCI (OFFICIAL)
                </span>
                <button
                  onClick={() => setShowOverrideModal(true)}
                  className="px-3.5 py-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 text-xs font-bold border border-rose-500/40 transition-colors flex items-center gap-1"
                >
                  <Unlock className="w-3.5 h-3.5" /> Override Administratif
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Action feedback message */}
        {actionMessage && (
          <div
            className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
              actionMessage.type === "success"
                ? "bg-emerald-950/60 text-emerald-300 border border-emerald-500/40"
                : "bg-rose-950/60 text-rose-300 border border-rose-500/40"
            }`}
          >
            {actionMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{actionMessage.text}</span>
          </div>
        )}

        {/* Validation Status Box */}
        <div
          className={`p-4 rounded-xl border text-xs space-y-2 ${
            validation.isValid
              ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-200"
              : "bg-amber-950/30 border-amber-500/40 text-amber-200"
          }`}
        >
          <div className="flex items-center justify-between font-bold">
            <span className="flex items-center gap-2">
              {validation.isValid ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              )}
              Status Validasi Bagan ({validation.stats.filledSlots} / 32 Slot Terisi)
            </span>
            <span className="font-mono">
              {validation.stats.uniqueTeams} Tim Unik / {validation.stats.totalRegisteredTeams} Terdaftar
            </span>
          </div>

          {!validation.isValid && (
            <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-300/90 pl-1">
              {validation.errors.slice(0, 5).map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
              {validation.errors.length > 5 && (
                <li>...dan {validation.errors.length - 5} masalah lainnya.</li>
              )}
            </ul>
          )}

          {validation.isValid && (
            <p className="text-[11px] text-emerald-400">
              ✓ Seluruh 32 slot terisi lengkap dengan 32 tim unik. Bagan valid dan siap dikunci!
            </p>
          )}
        </div>
      </div>

      {/* 32 SLOTS SPLIT (LEFT 16 vs RIGHT 16) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT SIDE (Slots 1 to 16) */}
        <div className="space-y-3 p-5 rounded-2xl esports-glass border border-slate-800">
          <div className="flex items-center justify-between pb-2 border-b border-cyan-900/50">
            <h2 className="text-sm font-black text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
              SISI KIRI BAGAN (Slot #01 - #16)
            </h2>
            <span className="text-[11px] text-slate-400">Menghasilkan M01 - M08</span>
          </div>

          <div className="space-y-2">
            {leftSlots.map((slot) => {
              const pairMatchNumber = Math.ceil(slot.slotNumber / 2);
              const isMatchA = slot.slotNumber % 2 !== 0;

              return (
                <div
                  key={slot.id}
                  className={`p-2.5 rounded-xl border flex items-center gap-3 transition-colors ${
                    slot.teamId
                      ? "bg-slate-900/80 border-slate-800"
                      : "bg-slate-950/60 border-amber-500/30"
                  }`}
                >
                  <div className="w-10 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center font-mono font-black text-xs text-cyan-400 shrink-0">
                    #{String(slot.slotNumber).padStart(2, "0")}
                  </div>

                  <div className="flex-1">
                    {isLocked ? (
                      <div className="font-bold text-xs text-white">
                        {slot.team?.name ?? "KOSONG"}
                      </div>
                    ) : (
                      <select
                        value={slot.teamId || ""}
                        onChange={(e) => handleSlotChange(slot.slotNumber, e.target.value)}
                        className="w-full bg-slate-950 text-slate-200 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:border-cyan-500"
                      >
                        <option value="">-- Pilih Tim Undian --</option>
                        {availableTeams.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name} ({t.shortName})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div className="text-[10px] font-mono font-bold text-slate-500 shrink-0">
                    M{String(pairMatchNumber).padStart(2, "0")} ({isMatchA ? "Team A" : "Team B"})
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT SIDE (Slots 17 to 32) */}
        <div className="space-y-3 p-5 rounded-2xl esports-glass border border-slate-800">
          <div className="flex items-center justify-between pb-2 border-b border-cyan-900/50">
            <h2 className="text-sm font-black text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
              SISI KANAN BAGAN (Slot #17 - #32)
            </h2>
            <span className="text-[11px] text-slate-400">Menghasilkan M09 - M16</span>
          </div>

          <div className="space-y-2">
            {rightSlots.map((slot) => {
              const pairMatchNumber = Math.ceil(slot.slotNumber / 2);
              const isMatchA = slot.slotNumber % 2 !== 0;

              return (
                <div
                  key={slot.id}
                  className={`p-2.5 rounded-xl border flex items-center gap-3 transition-colors ${
                    slot.teamId
                      ? "bg-slate-900/80 border-slate-800"
                      : "bg-slate-950/60 border-amber-500/30"
                  }`}
                >
                  <div className="w-10 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center font-mono font-black text-xs text-cyan-400 shrink-0">
                    #{String(slot.slotNumber).padStart(2, "0")}
                  </div>

                  <div className="flex-1">
                    {isLocked ? (
                      <div className="font-bold text-xs text-white">
                        {slot.team?.name ?? "KOSONG"}
                      </div>
                    ) : (
                      <select
                        value={slot.teamId || ""}
                        onChange={(e) => handleSlotChange(slot.slotNumber, e.target.value)}
                        className="w-full bg-slate-950 text-slate-200 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:border-cyan-500"
                      >
                        <option value="">-- Pilih Tim Undian --</option>
                        {availableTeams.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name} ({t.shortName})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div className="text-[10px] font-mono font-bold text-slate-500 shrink-0">
                    M{String(pairMatchNumber).padStart(2, "0")} ({isMatchA ? "Team A" : "Team B"})
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* LOCK CONFIRMATION MODAL */}
      {showLockConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="max-w-md w-full p-6 rounded-2xl bg-slate-950 border border-emerald-500/40 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-white">Kunci Bagan Resmi Turnamen?</h3>
              <p className="text-xs text-slate-400">
                Setelah bagan dikunci:
              </p>
            </div>

            <div className="bg-slate-900 p-4 rounded-xl text-xs text-slate-300 space-y-2 border border-slate-800">
              <p>• Posisi tim pada slot undian tidak dapat diubah secara kasual.</p>
              <p>• Bagan menjadi resmi dan dapat dipantau oleh publik.</p>
              <p>• 16 pertandingan babak penyisihan (M01-M16) otomatis tergenerate.</p>
              <p>• Aksi penguncian akan dicatat permanen dalam Audit Log.</p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowLockConfirm(false)}
                className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs"
              >
                Batal
              </button>
              <button
                onClick={handleLockBracket}
                disabled={isLocking}
                className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-1.5"
              >
                {isLocking ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                Konfirmasi Kunci
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EMERGENCY OVERRIDE MODAL */}
      {showOverrideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="max-w-md w-full p-6 rounded-2xl bg-slate-950 border border-rose-500/40 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-white">Override Administratif Darurat</h3>
              <p className="text-xs text-slate-400">
                Aksi ini akan membuka kembali bagan resmi yang terkunci untuk perbaikan darurat.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">
                Alasan Resmi Override (Wajib diisi & dicatat di Audit Log):
              </label>
              <textarea
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder="Contoh: Koreksi diskualifikasi tim X berdasarkan keputusan wasit..."
                rows={3}
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowOverrideModal(false)}
                className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs"
              >
                Batal
              </button>
              <button
                onClick={handleOverrideBracket}
                disabled={isLocking || overrideReason.trim().length < 5}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-black text-xs shadow-lg shadow-rose-950/50 flex items-center justify-center gap-1.5"
              >
                {isLocking ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Unlock className="w-4 h-4" />}
                Lakukan Override
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
