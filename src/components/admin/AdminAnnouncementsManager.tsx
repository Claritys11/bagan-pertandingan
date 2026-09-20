"use client";

import React, { useState } from "react";
import { Bell, Plus, Pin, AlertTriangle, CheckCircle2, Trash2 } from "lucide-react";

interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  severity: "INFO" | "WARNING" | "URGENT";
  isPinned: boolean;
  authorName: string | null;
  createdAt: string;
}

interface AdminAnnouncementsManagerProps {
  initialAnnouncements: AnnouncementItem[];
  tournamentId: string;
}

export function AdminAnnouncementsManager({
  initialAnnouncements,
  tournamentId,
}: AdminAnnouncementsManagerProps) {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(initialAnnouncements);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [severity, setSeverity] = useState<"INFO" | "WARNING" | "URGENT">("INFO");
  const [isPinned, setIsPinned] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    try {
      setIsSubmitting(true);
      setSuccessMessage(null);
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          severity,
          isPinned,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setAnnouncements([data.announcement, ...announcements]);
      setTitle("");
      setContent("");
      setIsPinned(false);
      setSuccessMessage("Pengumuman resmi berhasil diterbitkan ke publik dan dashboard!");
    } catch (err: any) {
      alert(`Gagal menerbitkan: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl esports-glass border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-cyan-400" />
            Manajemen Pengumuman & Buletin Resmi
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Publikasikan pengumuman penting, perubahan jadwal darurat, atau instruksi teknis kepada
            seluruh tim peserta.
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CREATE ANNOUNCEMENT FORM */}
        <div className="p-6 rounded-2xl esports-glass border border-slate-800 space-y-4">
          <h2 className="text-sm font-black text-white flex items-center gap-2 pb-2 border-b border-slate-800">
            <Plus className="w-4 h-4 text-cyan-400" />
            Terbitkan Pengumuman Baru
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold block">Judul Pengumuman:</label>
              <input
                type="text"
                required
                placeholder="Contoh: Pergeseran Waktu Match M17 Karena Jeda Teknis"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold block">Tingkat Kepentingan (Severity):</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as any)}
                className="w-full p-2.5 bg-slate-950 text-white border border-slate-800 rounded-xl focus:outline-none focus:border-cyan-500 font-semibold"
              >
                <option value="INFO">INFO (Informasi Biasa)</option>
                <option value="WARNING">WARNING (Peringatan / Penting)</option>
                <option value="URGENT">URGENT (Darurat / Sangat Penting)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold block">Isi Pengumuman:</label>
              <textarea
                required
                rows={4}
                placeholder="Tuliskan detail pengumuman resmi di sini..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="pinAnnouncement"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="w-4 h-4 rounded text-cyan-500 bg-slate-900 border-slate-700"
              />
              <label htmlFor="pinAnnouncement" className="text-slate-300 font-semibold cursor-pointer select-none">
                Sematkan di Beranda Utama (Pinned)
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black shadow-lg shadow-cyan-500/25 transition-all"
            >
              {isSubmitting ? "Menerbitkan..." : "Terbitkan Pengumuman"}
            </button>
          </form>
        </div>

        {/* ANNOUNCEMENTS LIST */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-black text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-cyan-400" />
            Daftar Pengumuman Terbit ({announcements.length})
          </h2>

          <div className="space-y-3">
            {announcements.map((a) => (
              <div
                key={a.id}
                className="p-5 rounded-2xl esports-glass border border-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    {a.isPinned && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                        <Pin className="w-3 h-3" /> Pinned
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-slate-400 border border-slate-800">
                      {a.severity}
                    </span>
                  </div>
                  <span className="text-slate-500 text-[11px]">
                    Oleh: {a.authorName || "Panitia"}
                  </span>
                </div>

                <h3 className="font-black text-white text-base">{a.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                  {a.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
