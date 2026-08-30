"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SIH_PROBLEM_CODE } from "@/lib/constants";
import { useAuth } from "@/contexts/auth-context";
import { useIsMounted } from "@/lib/useIsMounted";
import {
  LayoutDashboard,
  CloudSun,
  Activity,
  ShieldCheck,
  Sparkles,
  Building2,
  Layers,
  Shield,
  Menu,
  X,
  LogIn,
  LogOut,
  User,
} from "lucide-react";

export type DashboardTab =
  | "overview"
  | "weather"
  | "risk"
  | "alerts"
  | "recommendations"
  | "district"
  | "pipeline"
  | "trust";

export const INTELLIGENCE_NAV_ITEMS: Array<{
  id: DashboardTab;
  label: string;
  icon: React.ElementType;
}> = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "weather", label: "Live Weather", icon: CloudSun },
  { id: "risk", label: "Risk & Impact", icon: Activity },
  { id: "alerts", label: "Official Alerts", icon: ShieldCheck },
  { id: "recommendations", label: "For You", icon: Sparkles },
];

export const DISTRICT_NAV_ITEMS: Array<{
  id: DashboardTab;
  label: string;
  icon: React.ElementType;
}> = [
  { id: "district", label: "District Intelligence", icon: Building2 },
];

export const SYSTEM_NAV_ITEMS: Array<{
  id: DashboardTab;
  label: string;
  icon: React.ElementType;
  badge?: string;
}> = [
  { id: "pipeline", label: "7-Step Flow", icon: Layers, badge: "Pipeline" },
  { id: "trust", label: "Trust Model", icon: Shield },
];

export const ALL_NAV_ITEMS = [
  ...INTELLIGENCE_NAV_ITEMS,
  ...DISTRICT_NAV_ITEMS,
  ...SYSTEM_NAV_ITEMS,
];

type DashboardShellProps = {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  isLive?: boolean;
  selectedDistrict?: string;
  selectedOccupation?: string;
  children: React.ReactNode;
};

export function DashboardShell({
  activeTab,
  onTabChange,
  isLive = true,
  selectedDistrict = "Chennai",
  selectedOccupation = "student",
  children,
}: DashboardShellProps) {
  const { user, userProfile, signOut } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const mounted = useIsMounted();

  const activeNavItem = ALL_NAV_ITEMS.find((n) => n.id === activeTab) || ALL_NAV_ITEMS[0];

  const desktopActiveClass =
    "bg-sky-500/10 text-white font-semibold border border-sky-500/20 shadow-[0_0_12px_-4px_rgba(56,189,248,0.15)]";
  const desktopInactiveClass =
    "text-slate-400 hover:bg-white/[0.04] hover:text-slate-100 border border-transparent";
  const mobileActiveClass =
    "bg-sky-500/10 text-white font-semibold border border-sky-500/20";
  const mobileInactiveClass =
    "text-slate-400 hover:bg-white/[0.04] hover:text-white";

  return (
    <div className="min-h-screen bg-atmosphere text-slate-100 flex">
      {/* ========================================================================= */}
      {/* 1. FIXED LEFT SIDEBAR (Desktop)                                           */}
      {/* ========================================================================= */}
      <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 left-0 z-40 border-r border-white/[0.04] bg-[#07111e]/60 backdrop-blur-2xl">
        {/* Branding Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-white/[0.04]">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500 text-slate-950 font-bold shadow-[0_0_14px_-2px_rgba(56,189,248,0.4)] transition-transform duration-300 group-hover:scale-105">
              <Sparkles className="h-4 w-4 fill-current" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base text-white" style={{ letterSpacing: "-0.02em" }}>
                Weather<span className="text-sky-400">GPT</span>
              </span>
              <span className="rounded border border-sky-500/20 bg-sky-500/5 px-1.5 py-0.5 text-[9px] font-mono font-semibold text-sky-300">
                {SIH_PROBLEM_CODE}
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-5 space-y-6">
          {/* Section: INTELLIGENCE */}
          <div className="space-y-1">
            <span className="px-3 text-[10px] font-mono uppercase tracking-widest text-sky-400/70 font-semibold block mb-2">
              Intelligence
            </span>
            {INTELLIGENCE_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-medium transition-all duration-200 ${isActive ? desktopActiveClass : desktopInactiveClass}`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 transition-colors ${isActive ? "text-sky-400" : "text-slate-500"}`} />
                    <span>{item.label}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Section: DISTRICT */}
          <div className="space-y-1">
            <span className="px-3 text-[10px] font-mono uppercase tracking-widest text-sky-400/70 font-semibold block mb-2">
              District
            </span>
            {DISTRICT_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-medium transition-all duration-200 ${isActive ? desktopActiveClass : desktopInactiveClass}`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 transition-colors ${isActive ? "text-sky-400" : "text-slate-500"}`} />
                    <span>{item.label}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Section: SYSTEM */}
          <div className="space-y-1">
            <span className="px-3 text-[10px] font-mono uppercase tracking-widest text-sky-400/70 font-semibold block mb-2">
              System
            </span>
            {SYSTEM_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-medium transition-all duration-200 ${isActive ? desktopActiveClass : desktopInactiveClass}`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 transition-colors ${isActive ? "text-sky-400" : "text-slate-500"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] font-mono bg-sky-500/10 text-sky-300 border border-sky-500/20 px-1.5 py-0.5 rounded">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sidebar Footer: Authenticated User & Sign Out */}
        <div className="p-3 border-t border-white/[0.04] space-y-2">
          {mounted && user ? (
            <div className="glass rounded-xl p-2.5 space-y-2">
              <div className="flex items-center gap-2.5 text-xs">
                <div className="h-7 w-7 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
                  <User className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-white truncate">{user.email}</p>
                  <p className="text-[10px] text-sky-300/60 font-mono capitalize truncate">
                    {userProfile?.occupation || selectedOccupation} · {userProfile?.district || selectedDistrict}
                  </p>
                </div>
              </div>
              <button
                onClick={() => signOut()}
                className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] py-1.5 text-[11px] font-medium text-slate-400 hover:text-white hover:border-sky-500/20 transition-colors press-tactile"
              >
                <LogOut className="h-3 w-3" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex gap-1.5">
              <Link
                href="/login"
                className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] py-2 text-xs font-semibold text-slate-200 hover:bg-white/[0.06] hover:text-white transition-colors"
              >
                <LogIn className="h-3 w-3 text-sky-400" />
                <span>Sign In</span>
              </Link>
              <Link
                href="/signup"
                className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 py-2 text-xs font-bold text-slate-950 shadow-[0_0_12px_-2px_rgba(56,189,248,0.3)] transition-all press-tactile"
              >
                <User className="h-3 w-3" />
                <span>Sign Up</span>
              </Link>
            </div>
          )}
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. MOBILE DRAWER SIDEBAR (Small Screens)                                  */}
      {/* ========================================================================= */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            onClick={() => setMobileSidebarOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
          />

          {/* Drawer Content */}
          <div className="relative w-64 bg-[#07111e]/80 border-r border-white/[0.04] flex flex-col h-full z-10 p-4 space-y-4 shadow-2xl backdrop-blur-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.04]">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500 text-slate-950 font-bold">
                  <Sparkles className="h-3.5 w-3.5 fill-current" />
                </div>
                <span className="font-bold text-sm text-white" style={{ letterSpacing: "-0.02em" }}>Weather<span className="text-sky-400">GPT</span></span>
              </div>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-white/[0.06] hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4">
              <div>
                <span className="px-3 text-[10px] font-mono uppercase tracking-widest text-sky-400/70 font-semibold block mb-1.5">
                  Intelligence
                </span>
                <div className="space-y-1">
                  {INTELLIGENCE_NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          onTabChange(item.id);
                          setMobileSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 rounded-xl px-3.5 py-2 text-xs font-medium transition-colors ${isActive ? mobileActiveClass : mobileInactiveClass}`}
                      >
                        <Icon className={`h-4 w-4 ${isActive ? "text-sky-400" : "text-slate-500"}`} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <span className="px-3 text-[10px] font-mono uppercase tracking-widest text-sky-400/70 font-semibold block mb-1.5">
                  District
                </span>
                <div className="space-y-1">
                  {DISTRICT_NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          onTabChange(item.id);
                          setMobileSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 rounded-xl px-3.5 py-2 text-xs font-medium transition-colors ${isActive ? mobileActiveClass : mobileInactiveClass}`}
                      >
                        <Icon className={`h-4 w-4 ${isActive ? "text-sky-400" : "text-slate-500"}`} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <span className="px-3 text-[10px] font-mono uppercase tracking-widest text-sky-400/70 font-semibold block mb-1.5">
                  System
                </span>
                <div className="space-y-1">
                  {SYSTEM_NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          onTabChange(item.id);
                          setMobileSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 rounded-xl px-3.5 py-2 text-xs font-medium transition-colors ${isActive ? mobileActiveClass : mobileInactiveClass}`}
                      >
                        <Icon className={`h-4 w-4 ${isActive ? "text-sky-400" : "text-slate-500"}`} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/[0.04] space-y-2">
              {mounted && user ? (
                <button
                  onClick={() => {
                    signOut();
                    setMobileSidebarOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] py-2 text-xs font-semibold text-slate-300 hover:text-white hover:border-sky-500/20 transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </button>
              ) : (
                <div className="flex gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileSidebarOpen(false)}
                    className="flex-1 text-center rounded-xl border border-white/[0.06] bg-white/[0.03] py-2 text-xs font-semibold text-slate-200 hover:bg-white/[0.06]"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMobileSidebarOpen(false)}
                    className="flex-1 text-center rounded-xl bg-sky-500 hover:bg-sky-400 py-2 text-xs font-bold text-slate-950 shadow-sm"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. MAIN VIEWPORT AREA (Desktop: pl-64, Minimal Top Bar + Content Area)     */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Minimal Top Bar */}
        <header className="sticky top-0 z-30 h-16 border-b border-white/[0.04] bg-[#040810]/60 backdrop-blur-xl px-4 sm:px-8 flex items-center justify-between">
          {/* Left: Active View Breadcrumb & Mobile Menu */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-xl text-slate-400 hover:bg-white/[0.06] hover:text-white transition-colors"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-500 hidden sm:inline">WeatherGPT /</span>
              <h1 className="text-sm sm:text-base font-bold text-white tracking-tight">
                {activeNavItem.label}
              </h1>
            </div>
          </div>

          {/* Right: Live Telemetry Indicator & Authenticated User / Sign Out */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:inline-flex items-center gap-2 rounded-full border border-sky-500/15 bg-sky-500/5 px-3 py-1 text-[11px] font-mono text-sky-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-400" />
              </span>
              <span>{isLive ? "Open-Meteo High-Res" : "Preset Mode"}</span>
            </div>

            {mounted && user ? (
              <div className="flex items-center gap-2">
                <div className="hidden md:flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-slate-200">
                  <User className="h-3 w-3 text-sky-400" />
                  <span className="max-w-[140px] truncate">{user.email}</span>
                </div>
                <button
                  onClick={() => signOut()}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:border-sky-500/20 transition-colors press-tactile"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:border-white/10 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="rounded-xl bg-sky-500 hover:bg-sky-400 px-3.5 py-1.5 text-xs font-bold text-slate-950 shadow-[0_4px_16px_-4px_rgba(56,189,248,0.3)] transition-all press-tactile"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </header>

        {/* Main Content Render Area */}
        <main className="flex-1 px-4 sm:px-8 py-8 sm:py-12 max-w-7xl w-full mx-auto space-y-12">
          {children}
        </main>
      </div>
    </div>
  );
}
