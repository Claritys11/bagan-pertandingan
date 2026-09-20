"use client";

import React, { useEffect, useState } from "react";
import { ConnectionStatus } from "@/lib/hooks/useRealtime";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";

interface RealtimeIndicatorProps {
  status: ConnectionStatus;
  lastUpdated: Date | null;
  className?: string;
}

export function RealtimeIndicator({
  status,
  lastUpdated,
  className = "",
}: RealtimeIndicatorProps) {
  const [timeAgo, setTimeAgo] = useState<string>("baru saja");

  useEffect(() => {
    if (!lastUpdated) return;

    const interval = setInterval(() => {
      const seconds = Math.floor((new Date().getTime() - lastUpdated.getTime()) / 1000);
      if (seconds < 5) {
        setTimeAgo("baru saja");
      } else if (seconds < 60) {
        setTimeAgo(`${seconds} detik lalu`);
      } else {
        const mins = Math.floor(seconds / 60);
        setTimeAgo(`${mins} menit lalu`);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [lastUpdated]);

  if (status === "connected") {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-medium ${className}`}
        title={`Terhubung ke Realtime SSE Server. Terakhir diperbarui: ${lastUpdated?.toLocaleTimeString() ?? "baru saja"}`}
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="font-semibold tracking-wide">REALTIME</span>
        <span className="text-emerald-500/70 text-[10px] hidden sm:inline">({timeAgo})</span>
      </div>
    );
  }

  if (status === "connecting") {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950/40 border border-amber-500/30 text-amber-400 text-xs font-medium ${className}`}
      >
        <RefreshCw className="w-3 h-3 animate-spin text-amber-400" />
        <span>Menghubungkan...</span>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-950/40 border border-rose-500/30 text-rose-400 text-xs font-medium ${className}`}
    >
      <WifiOff className="w-3 h-3 text-rose-400" />
      <span>Offline (Reconnecting)</span>
    </div>
  );
}
