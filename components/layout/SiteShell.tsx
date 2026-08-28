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
      <nav className="mx-auto flex max-w-6xl items-center justify-between rounded-2xl border border-neutral-800 bg-neutral-950/90 px-4 py-2.5 backdrop-blur-xl shadow-lg transition-all duration-300 sm:px-6">
        {/* LEFT: Branding + SIH Badge */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-black font-bold shadow-sm transition-transform group-hover:scale-105">
            <Sparkles className="h-4 w-4 fill-current" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-display text-lg font-bold tracking-tight text-white">
              Weather<span className="text-neutral-400">GPT</span>
            </span>
            <span className="inline-flex items-center rounded-full border border-neutral-700 bg-neutral-900 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-neutral-300">
              {SIH_PROBLEM_CODE}
            </span>
          </div>
        </Link>

        {/* CENTER / RIGHT (Desktop): Clean Structured Navigation */}
        <div className="hidden items-center gap-1 lg:flex">
          <Link
            href="/#overview"
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-neutral-300 transition-colors hover:bg-neutral-900 hover:text-white"
          >
            <Compass className="h-3.5 w-3.5 text-neutral-400" />
            <span>Overview</span>
          </Link>
          <Link
            href="/#risk"
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-neutral-300 transition-colors hover:bg-neutral-900 hover:text-white"
          >
            <Activity className="h-3.5 w-3.5 text-neutral-400" />
            <span>Risk &amp; Impact</span>
          </Link>
          <Link
            href="/#alerts"
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-neutral-300 transition-colors hover:bg-neutral-900 hover:text-white"
          >
            <ShieldAlert className="h-3.5 w-3.5 text-neutral-400" />
            <span>Official Alerts</span>
          </Link>
          <Link
            href="/#recommendations"
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-neutral-300 transition-colors hover:bg-neutral-900 hover:text-white"
          >
            <Sparkles className="h-3.5 w-3.5 text-neutral-400" />
            <span>For You</span>
          </Link>
          <Link
            href="/#map"
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-neutral-300 transition-colors hover:bg-neutral-900 hover:text-white"
          >
            <MapPin className="h-3.5 w-3.5 text-neutral-400" />
            <span>Risk Map</span>
          </Link>
          <Link
            href="/#pipeline"
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-neutral-400 transition-colors hover:bg-neutral-900 hover:text-white"
          >
            <Layers className="h-3.5 w-3.5 text-neutral-500" />
            <span>7-Step Flow</span>
          </Link>
          <Link
            href="/#trust"
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-neutral-400 transition-colors hover:bg-neutral-900 hover:text-white"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-neutral-500" />
            <span>Trust</span>
          </Link>
        </div>

        {/* RIGHT (Desktop): Auth & System Status */}
        <div className="hidden items-center gap-2 md:flex">
          {mounted && user ? (
            <>
              <div className="flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs font-medium text-neutral-200">
                <User className="h-3.5 w-3.5 text-neutral-400" />
                <span className="max-w-[120px] truncate">{user.email}</span>
              </div>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-1.5 text-xs font-semibold text-neutral-300 transition-all hover:border-neutral-700 hover:bg-neutral-800 hover:text-white"
              >
                <LogOut className="h-3.5 w-3.5 text-neutral-400" />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-1.5 text-xs font-semibold text-neutral-300 transition-all hover:border-neutral-700 hover:bg-neutral-800 hover:text-white"
              >
                <LogIn className="h-3.5 w-3.5 text-neutral-400" />
                <span>Sign In</span>
              </Link>
              <Link
                href="/signup"
                className="flex items-center gap-2 rounded-xl bg-white px-3.5 py-1.5 text-xs font-semibold text-black shadow-sm transition-all hover:bg-neutral-200"
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
          className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-800 lg:hidden"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mt-2 rounded-2xl border border-neutral-800 bg-neutral-950 p-4 shadow-xl backdrop-blur-2xl lg:hidden space-y-3">
          <Link
            href="/#overview"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium text-neutral-200 hover:bg-neutral-900"
          >
            <Compass className="h-4 w-4 text-neutral-400" />
            <span>Overview</span>
          </Link>
          <Link
            href="/#risk"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium text-neutral-200 hover:bg-neutral-900"
          >
            <Activity className="h-4 w-4 text-neutral-400" />
            <span>Risk &amp; Impact</span>
          </Link>
          <Link
            href="/#alerts"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium text-neutral-200 hover:bg-neutral-900"
          >
            <ShieldAlert className="h-4 w-4 text-neutral-400" />
            <span>Official Alerts</span>
          </Link>
          <Link
            href="/#recommendations"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium text-neutral-200 hover:bg-neutral-900"
          >
            <Sparkles className="h-4 w-4 text-neutral-400" />
            <span>Personalized For You</span>
          </Link>
          <Link
            href="/#map"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium text-neutral-200 hover:bg-neutral-900"
          >
            <MapPin className="h-4 w-4 text-neutral-400" />
            <span>District Risk Map</span>
          </Link>
          <Link
            href="/#pipeline"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium text-neutral-200 hover:bg-neutral-900"
          >
            <Layers className="h-4 w-4 text-neutral-400" />
            <span>7-Step Flow</span>
          </Link>
          <Link
            href="/#trust"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium text-neutral-200 hover:bg-neutral-900"
          >
            <ShieldCheck className="h-4 w-4 text-neutral-400" />
            <span>Trust Model</span>
          </Link>
          <div className="border-t border-neutral-800 pt-3 space-y-2">
            {mounted && user ? (
              <>
                <div className="flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs font-medium text-neutral-200">
                  <User className="h-3.5 w-3.5 text-neutral-400" />
                  <span className="truncate">{user.email}</span>
                </div>
                <button
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2.5 text-xs font-semibold text-neutral-200"
                >
                  <LogOut className="h-3.5 w-3.5 text-neutral-400" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2.5 text-xs font-semibold text-neutral-200"
                >
                  <LogIn className="h-3.5 w-3.5 text-neutral-400" />
                  <span>Sign In</span>
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-black"
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
    <footer className="mt-auto border-t border-neutral-800 bg-neutral-950 py-10 text-xs text-neutral-400">
      <Container className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-semibold text-neutral-200">
            <span>{APP_NAME}</span>
            <span>·</span>
            <span className="text-white">{SIH_PROBLEM_CODE}</span>
            <span>·</span>
            <span>Smart India Hackathon 2026</span>
          </div>
          <p className="text-neutral-400">
            Personalized Weather Intelligence &amp; Grounded Alert Verification System
          </p>
        </div>

        <div className="flex items-center gap-3 text-neutral-400">
          <span className="flex items-center gap-1.5 text-neutral-300 font-medium">
            <ShieldCheck className="h-3.5 w-3.5 text-white" />
            Official Source Verification
          </span>
          <span>•</span>
          <span className="text-neutral-300 font-medium">Phase {CURRENT_PHASE} Active</span>
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
    <div className="relative min-h-screen flex flex-col bg-background text-foreground antialiased selection:bg-white selection:text-black">
      <SiteHeader />
      <main className="flex-1 pt-24">{children}</main>
      <SiteFooter />
    </div>
  );
}
