"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StatusBadge } from "@/components/common/StatusBadge";
import {
  Trophy,
  Swords,
  Clock,
  MapPin,
  User,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Radio,
  ArrowRight,
  ArrowLeft,
  FileText,
  Sparkles,
} from "lucide-react";
import { MatchStatus } from "@prisma/client";

interface MatchDetailProps {
  match: any;
  venues: Array<{ id: string; name: string }>;
  staffList: Array<{ id: string; displayName: string; role: string }>;
}

export function AdminMatchDetailCockpit({ match, venues, staffList }: MatchDetailProps) {
  const router = useRouter();
  const [currentMatch, setCurrentMatch] = useState(match);
  const [status, setStatus] = useState<MatchStatus>(match.status);
  const [scoreA, setScoreA] = useState<number>(match.scoreA);
  const [scoreB, setScoreB] = useState<number>(match.scoreB);
  const [winnerId, setWinnerId] = useState<string>(match.winnerId || "");
  const [confirmedOfficial, setConfirmedOfficial] = useState(false);
  const [internalNotes, setInternalNotes] = useState(match.internalNotes || "");
  const [publicNotes, setPublicNotes] = useState(match.publicNotes || "");
  const [venueId, setVenueId] = useState(match.venueId || "");
  const [refereeId, setRefereeId] = useState(match.refereeId || "");
  const [pjId, setPjId] = useState(match.pjId || "");
  const [observerId, setObserverId] = useState(match.observerId || "");
  const [scheduledAt, setScheduledAt] = useState(
    match.scheduledAt ? new Date(match.scheduledAt).toISOString().slice(0, 16) : ""
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
    progression?: any;
  } | null>(null);

  const referees = staffList.filter((s) => s.role === "REFEREE");
  const pjs = staffList.filter((s) => s.role === "PJ");
  const observers = staffList.filter((s) => s.role === "OBSERVER");

  const isCompleted = status === "COMPLETED";

  // Auto pick winner when scores change
  const handleScoreAChange = (val: number) => {
    setScoreA(val);
    if (val > scoreB && currentMatch.teamAId) {
      setWinnerId(currentMatch.teamAId);
    } else if (scoreB > val && currentMatch.teamBId) {
      setWinnerId(currentMatch.teamBId);
    }
  };

  const handleScoreBChange = (val: number) => {
    setScoreB(val);
    if (val > scoreA && currentMatch.teamBId) {
      setWinnerId(currentMatch.teamBId);
    } else if (scoreA > val && currentMatch.teamAId) {
      setWinnerId(currentMatch.teamAId);
    }
  };

  // Quick Status Transition
  const handleStatusChange = async (newStatus: MatchStatus) => {
    try {
      setIsSubmitting(true);
      setNotification(null);
      const res = await fetch(`/api/matches/${currentMatch.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          notes: internalNotes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setStatus(newStatus);
      setNotification({
        type: "success",
        message: `Status pertandingan berhasil diubah menjadi ${newStatus}.`,
      });
      router.refresh();
    } catch (err: any) {
      setNotification({ type: "error", message: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Save Schedule & Staff Assignments
  const handleSaveScheduleAndStaff = async () => {
    try {
      setIsSubmitting(true);
      setNotification(null);
      const res = await fetch(`/api/schedule`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId: currentMatch.id,
          scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null,
          venueId: venueId || null,
          refereeId: refereeId || null,
          pjId: pjId || null,
          observerId: observerId || null,
          allowOverrideConflicts: false,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.conflicts && data.conflicts.length > 0) {
          const conflictMsgs = data.conflicts.map((c: any) => c.message).join("\n");
          throw new Error(`Konflik Penjadwalan:\n${conflictMsgs}`);
        }
        throw new Error(data.error);
      }

      setNotification({
        type: "success",
        message: "Jadwal dan penugasan petugas berhasil disimpan tanpa konflik!",
      });
      router.refresh();
    } catch (err: any) {
      setNotification({ type: "error", message: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Official Match Result
  const handleSubmitResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmedOfficial) {
      setNotification({
        type: "error",
        message: "Anda wajib mencentang konfirmasi hasil resmi sebelum submit.",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      setNotification(null);
      const res = await fetch(`/api/matches/${currentMatch.id}/result`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scoreA,
          scoreB,
          winnerId,
          notes: publicNotes,
          confirmedOfficial: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setStatus(MatchStatus.COMPLETED);
      setNotification({
        type: "success",
        message: `✓ HASIL RESMI TERVERIFIKASI! Pemenang berhasil dimajukan ke babak berikutnya.`,
        progression: data.data.progression,
      });
      router.refresh();
    } catch (err: any) {
      setNotification({ type: "error", message: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/matches"
          className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Daftar Match
        </Link>
        <Link
          href={`/matches/${currentMatch.id}`}
          target="_blank"
          className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
        >
          Buka Tampilan Publik ↗
        </Link>
      </div>

      {/* Match Cockpit Header */}
      <div className="p-6 rounded-2xl esports-glass border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-black text-cyan-400 text-sm tracking-wide">
              {currentMatch.matchCode}
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-xs font-bold text-slate-300">
              {currentMatch.round.replace(/_/g, " ")}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Kokpit Operasional Pertandingan
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status={status} size="lg" />
        </div>
      </div>

      {/* Action Notification Alert */}
      {notification && (
        <div
          className={`p-4 rounded-xl text-xs space-y-2 border ${
            notification.type === "success"
              ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-200"
              : "bg-rose-950/60 border-rose-500/40 text-rose-200"
          }`}
        >
          <div className="flex items-center gap-2 font-bold text-sm">
            {notification.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>

          {notification.progression && (
            <div className="p-3 rounded-lg bg-emerald-900/40 border border-emerald-500/30 text-emerald-300 font-mono text-xs">
              {notification.progression.tournamentCompleted ? (
                <div>🏆 TOURNAMENT COMPLETED! Champion: {notification.progression.championName}</div>
              ) : (
                <div>
                  ➔ Pemenang ({notification.progression.winnerTeam}) otomatis dimajukan ke Match slot{" "}
                  {notification.progression.slot} babak selanjutnya!
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 2-COLUMN OPERATIONAL GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* COLUMN 1 & 2: MATCH SCOREBOARD & OFFICIAL RESULT FORM */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Lifecycle Controller */}
          <div className="p-5 rounded-2xl esports-glass border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              KONTROL STATUS SIKLUS HIDUP MATCH
            </span>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleStatusChange(MatchStatus.SCHEDULED)}
                disabled={isSubmitting}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  status === MatchStatus.SCHEDULED
                    ? "bg-blue-500 text-slate-950"
                    : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                SCHEDULED
              </button>

              <button
                type="button"
                onClick={() => handleStatusChange(MatchStatus.READY)}
                disabled={isSubmitting}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  status === MatchStatus.READY
                    ? "bg-amber-500 text-slate-950"
                    : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                READY (Siap Mulai)
              </button>

              <button
                type="button"
                onClick={() => handleStatusChange(MatchStatus.LIVE)}
                disabled={isSubmitting}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
                  status === MatchStatus.LIVE
                    ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
                    : "bg-slate-900 text-red-400 hover:text-red-300 border border-slate-800"
                }`}
              >
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                SET LIVE
              </button>

              <button
                type="button"
                onClick={() => handleStatusChange(MatchStatus.POSTPONED)}
                disabled={isSubmitting}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  status === MatchStatus.POSTPONED
                    ? "bg-yellow-500 text-slate-950"
                    : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                TUNDA (Postponed)
              </button>

              <button
                type="button"
                onClick={() => handleStatusChange(MatchStatus.DISPUTED)}
                disabled={isSubmitting}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  status === MatchStatus.DISPUTED
                    ? "bg-rose-600 text-white"
                    : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                SENGKETA (Disputed)
              </button>
            </div>
          </div>

          {/* OFFICIAL RESULT SUBMISSION FORM */}
          <form
            onSubmit={handleSubmitResult}
            className="p-6 rounded-2xl esports-glass border border-slate-800 space-y-6"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                Input & Konfirmasi Hasil Pertandingan Resmi
              </h2>
              {isCompleted && (
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Hasil Resmi Telah Dikonfirmasi
                </span>
              )}
            </div>

            {/* Teams and Score Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Team A Box */}
              <div
                className={`p-4 rounded-xl border space-y-3 ${
                  winnerId === currentMatch.teamAId
                    ? "bg-emerald-950/30 border-emerald-500/50 shadow-md shadow-emerald-950/20"
                    : "bg-slate-950/70 border-slate-800"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase">TIM A (SISI 1)</span>
                  {winnerId === currentMatch.teamAId && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      PEMENANG TERPILIH
                    </span>
                  )}
                </div>

                <div className="font-black text-white text-lg truncate">
                  {currentMatch.teamA?.name ?? "TBD (Belum Ada Tim)"}
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400 block font-semibold">Skor Game Tim A:</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={scoreA}
                    onChange={(e) => handleScoreAChange(Number(e.target.value))}
                    disabled={!currentMatch.teamAId}
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl font-mono text-xl font-black text-cyan-400 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Team B Box */}
              <div
                className={`p-4 rounded-xl border space-y-3 ${
                  winnerId === currentMatch.teamBId
                    ? "bg-emerald-950/30 border-emerald-500/50 shadow-md shadow-emerald-950/20"
                    : "bg-slate-950/70 border-slate-800"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase">TIM B (SISI 2)</span>
                  {winnerId === currentMatch.teamBId && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      PEMENANG TERPILIH
                    </span>
                  )}
                </div>

                <div className="font-black text-white text-lg truncate">
                  {currentMatch.teamB?.name ?? "TBD (Belum Ada Tim)"}
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400 block font-semibold">Skor Game Tim B:</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={scoreB}
                    onChange={(e) => handleScoreBChange(Number(e.target.value))}
                    disabled={!currentMatch.teamBId}
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl font-mono text-xl font-black text-cyan-400 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>

            {/* Winner Selection dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Pemenang Pertandingan (Otomatis Maju ke Bagan Berikutnya):
              </label>
              <select
                value={winnerId}
                onChange={(e) => setWinnerId(e.target.value)}
                disabled={!currentMatch.teamAId || !currentMatch.teamBId}
                className="w-full p-2.5 bg-slate-950 text-slate-100 border border-slate-800 rounded-xl text-xs font-bold focus:outline-none focus:border-cyan-500"
              >
                <option value="">-- Pilih Pemenang Resmi --</option>
                {currentMatch.teamA && (
                  <option value={currentMatch.teamA.id}>
                    {currentMatch.teamA.name} ({currentMatch.teamA.shortName})
                  </option>
                )}
                {currentMatch.teamB && (
                  <option value={currentMatch.teamB.id}>
                    {currentMatch.teamB.name} ({currentMatch.teamB.shortName})
                  </option>
                )}
              </select>
            </div>

            {/* Public Match Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Catatan Hasil Publik (Opsional):
              </label>
              <input
                type="text"
                placeholder="Contoh: Game 1 durasi 14:20, MVP: Player X"
                value={publicNotes}
                onChange={(e) => setPublicNotes(e.target.value)}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Official Confirmation Checkbox */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/30 flex items-start gap-3">
              <input
                type="checkbox"
                id="officialConfirm"
                checked={confirmedOfficial}
                onChange={(e) => setConfirmedOfficial(e.target.checked)}
                className="mt-1 w-4 h-4 rounded text-cyan-500 bg-slate-900 border-slate-700 focus:ring-cyan-400"
              />
              <label htmlFor="officialConfirm" className="text-xs text-slate-300 select-none">
                <strong className="text-amber-400 block font-black">
                  Saya menyatakan dan mengonfirmasi ini adalah hasil resmi pertandingan.
                </strong>
                Hasil yang disubmit akan mencatat audit log permanen dan secara otomatis memajukan
                tim pemenang ke bagan babak berikutnya.
              </label>
            </div>

            <button
              type="submit"
              disabled={
                isSubmitting ||
                !confirmedOfficial ||
                !winnerId ||
                !currentMatch.teamAId ||
                !currentMatch.teamBId
              }
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-40 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              SUBMIT HASIL RESMI & MAJUKAN PEMENANG
            </button>
          </form>
        </div>

        {/* COLUMN 3: SCHEDULE, VENUE & STAFF ASSIGNMENT PANEL */}
        <div className="space-y-6">
          <div className="p-5 rounded-2xl esports-glass border border-slate-800 space-y-4">
            <h3 className="text-sm font-black text-white flex items-center gap-2 pb-2 border-b border-slate-800">
              <Clock className="w-4 h-4 text-cyan-400" />
              Penjadwalan & Penugasan Petugas
            </h3>

            <div className="space-y-3 text-xs">
              {/* Schedule time */}
              <div className="space-y-1">
                <label className="text-slate-400 font-semibold block">Waktu Jadwal (WIB):</label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Venue */}
              <div className="space-y-1">
                <label className="text-slate-400 font-semibold block">Arena / Venue:</label>
                <select
                  value={venueId}
                  onChange={(e) => setVenueId(e.target.value)}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="">-- Pilih Arena Venue --</option>
                  {venues.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Referee */}
              <div className="space-y-1">
                <label className="text-slate-400 font-semibold block">Wasit Resmi (Referee):</label>
                <select
                  value={refereeId}
                  onChange={(e) => setRefereeId(e.target.value)}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="">-- Tugaskan Wasit --</option>
                  {referees.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.displayName}
                    </option>
                  ))}
                </select>
              </div>

              {/* PJ */}
              <div className="space-y-1">
                <label className="text-slate-400 font-semibold block">PJ (Penanggung Jawab):</label>
                <select
                  value={pjId}
                  onChange={(e) => setPjId(e.target.value)}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="">-- Tugaskan PJ --</option>
                  {pjs.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.displayName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Observer */}
              <div className="space-y-1">
                <label className="text-slate-400 font-semibold block">Observer Pertandingan:</label>
                <select
                  value={observerId}
                  onChange={(e) => setObserverId(e.target.value)}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="">-- Tugaskan Observer --</option>
                  {observers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.displayName}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleSaveScheduleAndStaff}
                disabled={isSubmitting}
                className="w-full mt-2 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow"
              >
                Simpan Jadwal & Penugasan
              </button>
            </div>
          </div>

          {/* Internal Notes Panel */}
          <div className="p-5 rounded-2xl esports-glass border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              Catatan Internal Panitia (Private)
            </span>
            <p className="text-[11px] text-slate-500">
              Catatan internal hanya dapat dilihat oleh panitia terautentikasi dan tidak pernah
              diekspos ke publik.
            </p>
            <textarea
              rows={3}
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              placeholder="Contoh: Tim A terlambat 5 menit, sudah diberi peringatan pertama..."
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
