"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Swords, Trophy, Calendar, Users, Radio, Bell, ShieldCheck, Menu, X, LayoutDashboard } from "lucide-react";
import { RealtimeIndicator } from "@/components/common/RealtimeIndicator";
import { useTournamentRealtime } from "@/lib/hooks/useRealtime";

export function PublicNavbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { status, lastUpdated } = useTournamentRealtime();

  const navLinks = [
    { href: "/", label: "Beranda", icon: Swords },
    { href: "/bracket", label: "Bagan Resmi", icon: Trophy },
    { href: "/schedule", label: "Jadwal", icon: Calendar },
    { href: "/matches", label: "Pertandingan", icon: Swords },
    { href: "/teams", label: "Tim", icon: Users },
    { href: "/live", label: "Live", icon: Radio, highlight: true },
    { href: "/announcements", label: "Pengumuman", icon: Bell },
    { href: "/transparency", label: "Transparansi", icon: ShieldCheck },
  ];

  const isActive = (href: string) => {
    if (href === "/" && pathname !== "/") return false;
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full esports-glass border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-700 p-0.5 shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all">
              <div className="w-full h-full bg-slate-950 rounded-[7px] flex items-center justify-center">
                <Trophy className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black tracking-wider text-white text-base sm:text-lg">
                  MEC MLBB
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  2026
                </span>
              </div>
              <p className="text-[11px] text-slate-400 -mt-0.5 hidden sm:block">
                Tournament Operations & Live Bracket
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    active
                      ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm"
                      : link.highlight
                      ? "text-red-400 hover:text-red-300 hover:bg-red-950/30"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${link.highlight ? "text-red-400 animate-pulse" : ""}`} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions: Realtime indicator & Admin link */}
          <div className="flex items-center gap-3">
            <RealtimeIndicator status={status} lastUpdated={lastUpdated} />

            <Link
              href="/admin/dashboard"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700/80 transition-all shadow-sm"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Admin Ops</span>
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              aria-label="Buka Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-950/95 backdrop-blur-xl px-4 pt-2 pb-6 space-y-1">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  active
                    ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <Icon className="w-4 h-4 text-cyan-400" />
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
