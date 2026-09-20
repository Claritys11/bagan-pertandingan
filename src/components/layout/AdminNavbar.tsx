"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ShieldAlert,
  Trophy,
  Swords,
  Calendar,
  Users,
  Building,
  Bell,
  FileText,
  Settings,
  ExternalLink,
  UserCheck,
  Menu,
  X,
} from "lucide-react";
import { StaffRole } from "@prisma/client";

export function AdminNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentRole, setCurrentRole] = useState<StaffRole>(StaffRole.TOURNAMENT_ADMIN);
  const [currentUsername, setCurrentUsername] = useState("Admin Budi");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data.session) {
          setCurrentRole(data.session.role);
          setCurrentUsername(data.session.name || data.session.username);
        }
      })
      .catch(() => {});
  }, []);

  const handleRoleChange = async (newRole: StaffRole) => {
    try {
      await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole, username: `Operator (${newRole})` }),
      });
      setCurrentRole(newRole);
      router.refresh();
    } catch (err) {
      console.error("Failed to switch role:", err);
    }
  };

  const adminLinks = [
    { href: "/admin/dashboard", label: "Dashboard", icon: ShieldAlert },
    { href: "/admin/bracket", label: "Bagan 32 Tim", icon: Trophy },
    { href: "/admin/matches", label: "Pertandingan", icon: Swords },
    { href: "/admin/schedule", label: "Jadwal & Konflik", icon: Calendar },
    { href: "/admin/teams", label: "Tim", icon: Users },
    { href: "/admin/staff", label: "Petugas", icon: UserCheck },
    { href: "/admin/venues", label: "Venue", icon: Building },
    { href: "/admin/announcements", label: "Pengumuman", icon: Bell },
    { href: "/admin/audit-log", label: "Audit Log", icon: FileText },
    { href: "/admin/settings", label: "Dev & Pengaturan", icon: Settings },
  ];

  const isActive = (href: string) => {
    if (href === "/admin/dashboard" && pathname !== "/admin/dashboard") return false;
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-slate-950/95 border-b border-cyan-900/40 backdrop-blur-md">
      {/* Top Banner: Quick Role Switcher for Operations */}
      <div className="bg-slate-900/90 border-b border-slate-800/80 px-4 py-1.5 text-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-cyan-400"></span>
          <span className="font-semibold text-slate-300">ADMIN OPERATIONS PORTAL</span>
          <span className="text-slate-500">|</span>
          <span className="text-cyan-400 font-mono">User: {currentUsername}</span>
        </div>

        {/* Quick RBAC Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium">Peran Aktif:</span>
          <select
            value={currentRole}
            onChange={(e) => handleRoleChange(e.target.value as StaffRole)}
            className="bg-slate-950 text-cyan-300 border border-cyan-500/40 rounded px-2 py-0.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-cyan-400"
          >
            <option value={StaffRole.TOURNAMENT_ADMIN}>TOURNAMENT_ADMIN (Penuh)</option>
            <option value={StaffRole.TOURNAMENT_DIRECTOR}>TOURNAMENT_DIRECTOR</option>
            <option value={StaffRole.REFEREE}>REFEREE (Wasit)</option>
            <option value={StaffRole.PJ}>PJ (Penanggung Jawab)</option>
            <option value={StaffRole.OBSERVER}>OBSERVER</option>
            <option value={StaffRole.STREAM_OPERATOR}>STREAM_OPERATOR</option>
          </select>

          <Link
            href="/"
            className="flex items-center gap-1 text-slate-400 hover:text-white px-2 py-0.5 rounded hover:bg-slate-800 transition-colors ml-2"
          >
            <ExternalLink className="w-3 h-3" />
            <span>Lihat Publik</span>
          </Link>
        </div>
      </div>

      {/* Main Admin Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
            </div>
            <span className="font-black text-sm text-white tracking-wide">
              PANITIA MEC MLBB
            </span>
          </div>

          <nav className="hidden lg:flex items-center gap-1">
            {adminLinks.map((link) => {
              const active = isActive(link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    active
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                      : "text-slate-400 hover:text-slate-100 hover:bg-slate-900"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-950 p-4 space-y-1">
          {adminLinks.map((link) => {
            const active = isActive(link.href);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium ${
                  active
                    ? "bg-cyan-500/20 text-cyan-300 font-bold"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
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
