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
  Radio,
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

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex">
      {/* ========================================================================= */}
      {/* 1. FIXED LEFT SIDEBAR (Desktop)                                           */}
      {/* ========================================================================= */}
      <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 left-0 z-40 border-r border-neutral-800/80 bg-neutral-950/95 backdrop-blur-xl">
        {/* Branding Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-neutral-800/80">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-black font-bold shadow-sm transition-transform group-hover:scale-105">
              <Sparkles className="h-4 w-4 fill-current" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-bold text-base tracking-tight text-white">
                Weather<span className="text-neutral-400">GPT</span>
              </span>
              <span className="rounded border border-neutral-700 bg-neutral-900 px-1.5 py-0.5 text-[9px] font-mono font-semibold text-neutral-300">
                {SIH_PROBLEM_CODE}
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-5 space-y-6">
          {/* Section: INTELLIGENCE */}
          <div className="space-y-1">
            <span className="px-3 text-[10px] font-mono uppercase tracking-widest text-neutral-500 font-semibold block mb-2">
              Intelligence
            </span>
            {INTELLIGENCE_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-medium transition-all ${
                    isActive
                      ? "bg-neutral-900 text-white font-semibold border border-neutral-700/80 shadow-sm"
                      : "text-neutral-400 hover:bg-neutral-900/50 hover:text-neutral-200 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-neutral-400"}`} />
                    <span>{item.label}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Section: DISTRICT */}
          <div className="space-y-1">
            <span className="px-3 text-[10px] font-mono uppercase tracking-widest text-neutral-500 font-semibold block mb-2">
              District
            </span>
            {DISTRICT_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-medium transition-all ${
                    isActive
                      ? "bg-neutral-900 text-white font-semibold border border-neutral-700/80 shadow-sm"
                      : "text-neutral-400 hover:bg-neutral-900/50 hover:text-neutral-200 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-neutral-400"}`} />
                    <span>{item.label}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Section: SYSTEM */}
          <div className="space-y-1">
            <span className="px-3 text-[10px] font-mono uppercase tracking-widest text-neutral-500 font-semibold block mb-2">
              System
            </span>
            {SYSTEM_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-medium transition-all ${
                    isActive
                      ? "bg-neutral-900 text-white font-semibold border border-neutral-700/80 shadow-sm"
                      : "text-neutral-400 hover:bg-neutral-900/50 hover:text-neutral-200 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-neutral-400"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] font-mono bg-neutral-800 text-neutral-300 border border-neutral-700 px-1.5 py-0.5 rounded">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sidebar Footer: Authenticated User & Sign Out */}
        <div className="p-3 border-t border-neutral-800/80 space-y-2">
          {mounted && user ? (
            <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-2.5 space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <div className="h-7 w-7 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-white shrink-0">
                  <User className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-white truncate">{user.email}</p>
                  <p className="text-[10px] text-neutral-400 font-mono capitalize truncate">
                    {userProfile?.occupation || selectedOccupation} · {userProfile?.district || selectedDistrict}
                  </p>
                </div>
              </div>
              <button
                onClick={() => signOut()}
                className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-950 py-1.5 text-[11px] font-medium text-neutral-400 hover:text-white hover:border-neutral-700 transition-colors"
              >
                <LogOut className="h-3 w-3" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex gap-1.5">
              <Link
                href="/login"
                className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-900 py-2 text-xs font-semibold text-neutral-200 hover:bg-neutral-800 hover:text-white transition-colors"
              >
                <LogIn className="h-3 w-3" />
                <span>Sign In</span>
              </Link>
              <Link
                href="/signup"
                className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-white py-2 text-xs font-semibold text-black hover:bg-neutral-200 transition-colors shadow-sm"
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
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Drawer Content */}
          <div className="relative w-64 bg-neutral-950 border-r border-neutral-800 flex flex-col h-full z-10 p-4 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-black font-bold">
                  <Sparkles className="h-3.5 w-3.5 fill-current" />
                </div>
                <span className="font-bold text-sm text-white">WeatherGPT</span>
              </div>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:bg-neutral-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4">
              <div>
                <span className="px-3 text-[10px] font-mono uppercase tracking-widest text-neutral-500 font-semibold block mb-1.5">
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
                        className={`w-full flex items-center gap-3 rounded-xl px-3.5 py-2 text-xs font-medium ${
                          isActive
                            ? "bg-neutral-900 text-white font-semibold border border-neutral-700"
                            : "text-neutral-400 hover:bg-neutral-900 hover:text-white"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <span className="px-3 text-[10px] font-mono uppercase tracking-widest text-neutral-500 font-semibold block mb-1.5">
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
                        className={`w-full flex items-center gap-3 rounded-xl px-3.5 py-2 text-xs font-medium ${
                          isActive
                            ? "bg-neutral-900 text-white font-semibold border border-neutral-700"
                            : "text-neutral-400 hover:bg-neutral-900 hover:text-white"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <span className="px-3 text-[10px] font-mono uppercase tracking-widest text-neutral-500 font-semibold block mb-1.5">
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
                        className={`w-full flex items-center gap-3 rounded-xl px-3.5 py-2 text-xs font-medium ${
                          isActive
                            ? "bg-neutral-900 text-white font-semibold border border-neutral-700"
                            : "text-neutral-400 hover:bg-neutral-900 hover:text-white"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-800 space-y-2">
              {mounted && user ? (
                <button
                  onClick={() => {
                    signOut();
                    setMobileSidebarOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900 py-2 text-xs font-semibold text-neutral-300"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </button>
              ) : (
                <div className="flex gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileSidebarOpen(false)}
                    className="flex-1 text-center rounded-xl border border-neutral-800 bg-neutral-900 py-2 text-xs font-semibold text-neutral-200"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMobileSidebarOpen(false)}
                    className="flex-1 text-center rounded-xl bg-white py-2 text-xs font-semibold text-black"
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
        {/* Minimal Top Bar (Part 4) */}
        <header className="sticky top-0 z-30 h-16 border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-xl px-4 sm:px-8 flex items-center justify-between">
          {/* Left: Active View Breadcrumb & Mobile Menu */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-xl text-neutral-400 hover:bg-neutral-900 hover:text-white"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-neutral-500 hidden sm:inline">WeatherGPT /</span>
              <h1 className="text-sm sm:text-base font-bold text-white tracking-tight">
                {activeNavItem.label}
              </h1>
            </div>
          </div>

          {/* Right: Live Telemetry Indicator & Authenticated User / Sign Out */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-neutral-800 bg-neutral-900/80 px-3 py-1 text-[11px] font-mono text-neutral-300">
              <Radio className="h-2.5 w-2.5 text-white animate-pulse" />
              <span>{isLive ? "Open-Meteo High-Res" : "Preset Mode"}</span>
            </div>

            {mounted && user ? (
              <div className="flex items-center gap-2">
                <div className="hidden md:flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs font-medium text-neutral-200">
                  <User className="h-3 w-3 text-neutral-400" />
                  <span className="max-w-[140px] truncate">{user.email}</span>
                </div>
                <button
                  onClick={() => signOut()}
                  className="rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-neutral-300 hover:text-white hover:border-neutral-700 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-neutral-300 hover:text-white hover:border-neutral-700 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="rounded-xl bg-white px-3 py-1.5 text-xs font-semibold text-black hover:bg-neutral-200 transition-colors shadow-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </header>

        {/* Main Content Render Area */}
        <main className="flex-1 px-4 sm:px-8 py-8 sm:py-10 max-w-7xl w-full mx-auto space-y-12">
          {children}
        </main>
      </div>
    </div>
  );
}
