"use client";

import React, { useState } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/common/StatusBadge";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Save,
  RefreshCw,
  ArrowRight,
} from "lucide-react";

interface ScheduleMatch {
  id: string;
  matchNumber: number;
  matchCode: string;
  round: string;
  status: string;
  scheduledAt: string | null;
  venueId: string | null;
  refereeId: string | null;
  pjId: string | null;
  observerId: string | null;
  teamA?: { name: string } | null;
  teamB?: { name: string } | null;
  venue?: { id: string; name: string } | null;
  referee?: { id: string; displayName: string } | null;
  pj?: { id: string; displayName: string } | null;
  observer?: { id: string; displayName: string } | null;
}

interface VenueItem {
  id: string;
  name: string;
}

interface StaffItem {
  id: string;
  displayName: string;
  role: string;
}

interface AdminScheduleManagerProps {
  initialMatches: ScheduleMatch[];
  tournamentId: string;
  venues: VenueItem[];
  staffList: StaffItem[];
}

export function AdminScheduleManager({
  initialMatches,
  tournamentId,
  venues,
  staffList,
}: AdminScheduleManagerProps) {
  const [matches, setMatches] = useState<ScheduleMatch[]>(initialMatches);
  const [selectedMatch, setSelectedMatch] = useState<ScheduleMatch | null>(null);

  // Form states for selected match editing
  const [scheduledTime, setScheduledTime] = useState("");
  const [venueId, setVenueId] = useState("");
  const [refereeId, setRefereeId] = useState("");
  const [pjId, setPjId] = useState("");
  const [observerId, setObserverId] = useState("");
  const [allowOverride, setAllowOverride] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [conflictErrors, setConflictErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const referees = staffList.filter((s) => s.role === "REFEREE");
  const pjs = staffList.filter((s) => s.role === "PJ");
  const observers = staffList.filter((s) => s.role === "OBSERVER");

  const openEditor = (m: ScheduleMatch) => {
    setSelectedMatch(m);
    setScheduledTime(m.scheduledAt ? new Date(m.scheduledAt).toISOString().slice(0, 16) : "");
    setVenueId(m.venueId || "");
    setRefereeId(m.refereeId || "");
    setPjId(m.pjId || "");
    setObserverId(m.observerId || "");
    setConflictErrors([]);
    setSuccessMessage(null);
    setAllowOverride(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatch) return;

    try {
      setIsSaving(true);
      setConflictErrors([]);
      setSuccessMessage(null);

      const res = await fetch("/api/schedule", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId: selectedMatch.id,
          scheduledAt: scheduledTime ? new Date(scheduledTime).toISOString() : null,
          venueId: venueId || null,
          refereeId: refereeId || null,
          pjId: pjId || null,
          observerId: observerId || null,
          allowOverrideConflicts: allowOverride,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.conflicts && data.conflicts.length > 0) {
          setConflictErrors(data.conflicts.map((c: any) => c.message));
          return;
        }
        throw new Error(data.error);
      }

      // Refresh matches
      const updatedList = matches.map((m) =>
        m.id === selectedMatch.id ? { ...m, ...data.match } : m
      );
      setMatches(updatedList);
      setSuccessMessage(`Jadwal ${selectedMatch.matchCode} berhasil diperbarui!`);
      setSelectedMatch(null);
    } catch (err: any) {
      setConflictErrors([err.message]);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl esports-glass border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Calendar className="w-6 h-6 text-cyan-400" />
            Manajemen Jadwal & Deteksi Konflik Petugas
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Sistem secara otomatis mendeteksi tabrakan waktu pada Venue, Wasit, PJ, dan Observer
            dalam rentang waktu yang sama.
          </p>
        </div>

        <div className="text-xs font-mono text-cyan-400 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800">
          Conflict Detection Engine: ACTIVE
        </div>
      </div>

      {/* Global Success Feedback */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Matches Schedule Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {matches.map((m) => {
          const formattedDate = m.scheduledAt
            ? new Intl.DateTimeFormat("id-ID", {
                weekday: "short",
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
                timeZone: "Asia/Jakarta",
              }).format(new Date(m.scheduledAt)) + " WIB"
            : "Belum dijadwalkan";

          return (
            <div
              key={m.id}
              className="p-4 rounded-xl esports-glass border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
                  <span className="font-mono font-black text-cyan-400">
                    {m.matchCode} • {m.round.replace(/_/g, " ")}
                  </span>
                  <StatusBadge status={m.status} size="sm" />
                </div>

                <div className="text-xs font-bold text-white">
                  <span className="block truncate">{m.teamA?.name ?? "TBD"}</span>
                  <span className="text-slate-500 text-[10px] block font-normal">vs</span>
                  <span className="block truncate">{m.teamB?.name ?? "TBD"}</span>
                </div>

                <div className="pt-2 border-t border-slate-850/80 space-y-1 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>{formattedDate}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{m.venue?.name ?? "Belum ada venue"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">
                      Wasit: {m.referee?.displayName ?? "-"} • PJ: {m.pj?.displayName ?? "-"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-850 flex items-center justify-between">
                <Link
                  href={`/admin/matches/${m.id}`}
                  className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1 font-semibold"
                >
                  Kokpit <ArrowRight className="w-3 h-3" />
                </Link>

                <button
                  onClick={() => openEditor(m)}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 font-bold text-xs transition-colors"
                >
                  Atur Jadwal / Wasit
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* SCHEDULE & CONFLICT EDITOR MODAL */}
      {selectedMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="max-w-lg w-full p-6 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-400" />
                Atur Jadwal & Penugasan: {selectedMatch.matchCode}
              </h2>
              <button
                onClick={() => setSelectedMatch(null)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕ Tutup
              </button>
            </div>

            {/* Conflict Error Alerts */}
            {conflictErrors.length > 0 && (
              <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs space-y-2">
                <div className="flex items-center gap-2 font-black text-rose-300">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  PERINGATAN TABRAKAN WAKTU / KONFLIK TERDETEKSI:
                </div>
                <ul className="list-disc list-inside space-y-1 text-[11px]">
                  {conflictErrors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>

                <div className="pt-2 border-t border-rose-900/60 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="overrideConflict"
                    checked={allowOverride}
                    onChange={(e) => setAllowOverride(e.target.checked)}
                    className="w-4 h-4 rounded text-rose-600 bg-slate-900 border-slate-700"
                  />
                  <label htmlFor="overrideConflict" className="font-bold text-[11px] text-rose-300">
                    Abaikan konflik dan tetap simpan (Administrative Override)
                  </label>
                </div>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              {/* Scheduled At */}
              <div className="space-y-1">
                <label className="text-slate-400 font-semibold block">Waktu Pertandingan (WIB):</label>
                <input
                  type="datetime-local"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Venue */}
              <div className="space-y-1">
                <label className="text-slate-400 font-semibold block">Arena / Venue:</label>
                <select
                  value={venueId}
                  onChange={(e) => setVenueId(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="">-- Tanpa Venue --</option>
                  {venues.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Referee */}
              <div className="space-y-1">
                <label className="text-slate-400 font-semibold block">Wasit (Referee):</label>
                <select
                  value={refereeId}
                  onChange={(e) => setRefereeId(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="">-- Tanpa Wasit --</option>
                  {referees.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.displayName}
                    </option>
                  ))}
                </select>
              </div>

              {/* PJ */}
              <div className="space-y-1">
                <label className="text-slate-400 font-semibold block">PJ (Person In Charge):</label>
                <select
                  value={pjId}
                  onChange={(e) => setPjId(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="">-- Tanpa PJ --</option>
                  {pjs.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.displayName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Observer */}
              <div className="space-y-1">
                <label className="text-slate-400 font-semibold block">Observer:</label>
                <select
                  value={observerId}
                  onChange={(e) => setObserverId(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="">-- Tanpa Observer --</option>
                  {observers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.displayName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedMatch(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/25"
                >
                  {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Simpan Jadwal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
