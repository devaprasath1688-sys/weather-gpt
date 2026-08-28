"use client";

import React, { useState } from "react";
import Link from "next/link";
import { APP_NAME, SIH_PROBLEM_CODE, CURRENT_PHASE } from "@/lib/constants";
import { useAuth } from "@/contexts/auth-context";
import { useIsMounted } from "@/lib/useIsMounted";
import {
  Sparkles,
  Layers,
  Menu,
  X,
  ShieldCheck,
  Activity,
  LogIn,
  LogOut,
  User,
  ShieldAlert,
  MapPin,
  Compass,
} from "lucide-react";

type ContainerProps = {
  children: React.ReactNode;
  className?: string;
};

export function Container({ children, className = "" }: ContainerProps) {
  return (
    <div className={`mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}

export function SiteHeader() {
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mounted = useIsMounted();

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-3 sm:px-6">
      <nav className="mx-auto flex max-w-6xl items-center justify-between rounded-2xl border border-[#142a47] bg-[#07111e]/90 px-4 py-2.5 backdrop-blur-xl shadow-2xl transition-all duration-300 sm:px-6">
        {/* LEFT: Branding + SIH Badge */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500 text-slate-950 font-bold shadow-[0_0_15px_rgba(56,189,248,0.4)] transition-transform duration-200 group-hover:scale-105">
            <Sparkles className="h-4 w-4 fill-current" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-display text-lg font-bold tracking-tight text-white">
              Weather<span className="text-sky-400">GPT</span>
            </span>
            <span className="inline-flex items-center rounded-full border border-sky-500/30 bg-[#0a1628] px-2 py-0.5 text-[10px] font-semibold tracking-wide text-sky-300">
              {SIH_PROBLEM_CODE}
            </span>
          </div>
        </Link>

        {/* CENTER / RIGHT (Desktop): Clean Structured Navigation */}
        <div className="hidden items-center gap-1 lg:flex">
          <Link
            href="/#overview"
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-[#0f223d] hover:text-white"
          >
            <Compass className="h-3.5 w-3.5 text-sky-400" />
            <span>Overview</span>
          </Link>
          <Link
            href="/#risk"
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-[#0f223d] hover:text-white"
          >
            <Activity className="h-3.5 w-3.5 text-sky-400" />
            <span>Risk &amp; Impact</span>
          </Link>
          <Link
            href="/#alerts"
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-[#0f223d] hover:text-white"
          >
            <ShieldAlert className="h-3.5 w-3.5 text-sky-400" />
            <span>Official Alerts</span>
          </Link>
          <Link
            href="/#recommendations"
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-[#0f223d] hover:text-white"
          >
            <Sparkles className="h-3.5 w-3.5 text-sky-400" />
            <span>For You</span>
          </Link>
          <Link
            href="/#map"
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-[#0f223d] hover:text-white"
          >
            <MapPin className="h-3.5 w-3.5 text-sky-400" />
            <span>Risk Map</span>
          </Link>
          <Link
            href="/#pipeline"
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-400 transition-colors hover:bg-[#0f223d] hover:text-white"
          >
            <Layers className="h-3.5 w-3.5 text-slate-500" />
            <span>7-Step Flow</span>
          </Link>
          <Link
            href="/#trust"
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-400 transition-colors hover:bg-[#0f223d] hover:text-white"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-slate-500" />
            <span>Trust</span>
          </Link>
        </div>

        {/* RIGHT (Desktop): Auth & System Status */}
        <div className="hidden items-center gap-2 md:flex">
          {mounted && user ? (
            <>
              <div className="flex items-center gap-2 rounded-xl border border-[#142a47] bg-[#0a1628] px-3 py-1.5 text-xs font-medium text-slate-200">
                <User className="h-3.5 w-3.5 text-sky-400" />
                <span className="max-w-[120px] truncate">{user.email}</span>
              </div>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 rounded-xl border border-[#142a47] bg-[#0a1628] px-3.5 py-1.5 text-xs font-semibold text-slate-300 transition-all hover:border-sky-500/40 hover:bg-[#0f223d] hover:text-white"
              >
                <LogOut className="h-3.5 w-3.5 text-slate-400" />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="flex items-center gap-2 rounded-xl border border-[#142a47] bg-[#0a1628] px-3.5 py-1.5 text-xs font-semibold text-slate-300 transition-all hover:border-sky-500/30 hover:bg-[#0f223d] hover:text-white"
              >
                <LogIn className="h-3.5 w-3.5 text-sky-400" />
                <span>Sign In</span>
              </Link>
              <Link
                href="/signup"
                className="flex items-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-400 px-3.5 py-1.5 text-xs font-bold text-slate-950 shadow-[0_0_15px_rgba(56,189,248,0.35)] transition-all"
              >
                <User className="h-3.5 w-3.5" />
                <span>Sign Up</span>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-lg p-2 text-slate-400 hover:bg-[#0a1628] lg:hidden transition-colors"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mt-2 rounded-2xl border border-[#142a47] bg-[#07111e] p-4 shadow-2xl backdrop-blur-2xl lg:hidden space-y-3">
          <Link
            href="/#overview"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-200 hover:bg-[#0f223d]"
          >
            <Compass className="h-4 w-4 text-sky-400" />
            <span>Overview</span>
          </Link>
          <Link
            href="/#risk"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-200 hover:bg-[#0f223d]"
          >
            <Activity className="h-4 w-4 text-sky-400" />
            <span>Risk &amp; Impact</span>
          </Link>
          <Link
            href="/#alerts"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-200 hover:bg-[#0f223d]"
          >
            <ShieldAlert className="h-4 w-4 text-sky-400" />
            <span>Official Alerts</span>
          </Link>
          <Link
            href="/#recommendations"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-200 hover:bg-[#0f223d]"
          >
            <Sparkles className="h-4 w-4 text-sky-400" />
            <span>Personalized For You</span>
          </Link>
          <Link
            href="/#map"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-200 hover:bg-[#0f223d]"
          >
            <MapPin className="h-4 w-4 text-sky-400" />
            <span>District Risk Map</span>
          </Link>
          <Link
            href="/#pipeline"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-200 hover:bg-[#0f223d]"
          >
            <Layers className="h-4 w-4 text-slate-400" />
            <span>7-Step Flow</span>
          </Link>
          <Link
            href="/#trust"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-200 hover:bg-[#0f223d]"
          >
            <ShieldCheck className="h-4 w-4 text-slate-400" />
            <span>Trust Model</span>
          </Link>
          <div className="border-t border-[#142a47] pt-3 space-y-2">
            {mounted && user ? (
              <>
                <div className="flex items-center gap-2 rounded-xl border border-[#142a47] bg-[#0a1628] px-3 py-2 text-xs font-medium text-slate-200">
                  <User className="h-3.5 w-3.5 text-sky-400" />
                  <span className="truncate">{user.email}</span>
                </div>
                <button
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#142a47] bg-[#0a1628] px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-[#0f223d]"
                >
                  <LogOut className="h-3.5 w-3.5 text-slate-400" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#142a47] bg-[#0a1628] px-4 py-2.5 text-xs font-semibold text-slate-200"
                >
                  <LogIn className="h-3.5 w-3.5 text-sky-400" />
                  <span>Sign In</span>
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-500 py-2.5 text-xs font-bold text-slate-950 shadow-sm"
                >
                  <User className="h-3.5 w-3.5" />
                  <span>Sign Up</span>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[#132742] bg-[#040810] py-10 text-xs text-slate-400">
      <Container className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-semibold text-slate-200">
            <span>{APP_NAME}</span>
            <span>·</span>
            <span className="text-sky-400 font-mono">{SIH_PROBLEM_CODE}</span>
            <span>·</span>
            <span>Smart India Hackathon 2026</span>
          </div>
          <p className="text-slate-400">
            Personalized Weather Intelligence &amp; Grounded Alert Verification System
          </p>
        </div>

        <div className="flex items-center gap-3 text-slate-400">
          <span className="flex items-center gap-1.5 text-slate-300 font-medium">
            <ShieldCheck className="h-3.5 w-3.5 text-sky-400" />
            Official Source Verification
          </span>
          <span>•</span>
          <span className="text-sky-300 font-medium font-mono">Phase {CURRENT_PHASE} Active</span>
        </div>
      </Container>
    </footer>
  );
}

type SiteShellProps = {
  children: React.ReactNode;
};

export function SiteShell({ children }: SiteShellProps) {
  return (
    <div className="relative min-h-screen flex flex-col bg-background text-foreground antialiased selection:bg-sky-500 selection:text-slate-950">
      <SiteHeader />
      <main className="flex-1 pt-24">{children}</main>
      <SiteFooter />
    </div>
  );
}
