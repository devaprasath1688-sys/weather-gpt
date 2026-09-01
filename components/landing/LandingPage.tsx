"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, ShieldCheck, Activity, CircleCheck as CheckCircle2, Compass, Radio, Layers, Menu, X, Zap, Thermometer } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useIsMounted } from "@/lib/useIsMounted";

type LandingPageProps = {
  onExploreDashboard?: () => void;
};

export function LandingPage({
  onExploreDashboard,
}: LandingPageProps) {
  const { user, signOut } = useAuth();
  const mounted = useIsMounted();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#040810] text-slate-100 selection:bg-sky-500 selection:text-slate-950 flex flex-col font-sans">
      {/* ===================================================================== */}
      {/* 1. PREMIUM NAVBAR                                                     */}
      {/* ===================================================================== */}
      <header className="fixed inset-x-0 top-0 z-50 px-4 pt-3 sm:px-6">
        <nav className="mx-auto flex max-w-6xl items-center justify-between rounded-2xl border border-[#142a47] bg-[#07111e]/90 px-4 py-2.5 backdrop-blur-2xl shadow-2xl transition-all duration-300 sm:px-6">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500 text-slate-950 font-bold shadow-[0_0_18px_rgba(56,189,248,0.5)] transition-transform duration-200 group-hover:scale-105">
              <Sparkles className="h-4 w-4 fill-current" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-display text-lg font-bold tracking-tight text-white">
                Weather<span className="text-sky-400">GPT</span>
              </span>
            </div>
          </Link>

          {/* Center Navigation Links */}
          <div className="hidden items-center gap-1.5 md:flex">
            <a
              href="#telemetry-strip"
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-[#0f223d] hover:text-white"
            >
              Live Telemetry
            </a>
            <a
              href="#capabilities"
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-[#0f223d] hover:text-white"
            >
              Capabilities
            </a>
            <a
              href="#how-it-works"
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-[#0f223d] hover:text-white"
            >
              How it Works
            </a>
            <a
              href="#trust"
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-[#0f223d] hover:text-white"
            >
              Trust Model
            </a>
          </div>

          {/* Right Action CTAs */}
          <div className="hidden items-center gap-2.5 sm:flex">
            {mounted && user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onExploreDashboard}
                  className="flex items-center gap-1.5 rounded-xl border border-sky-500/30 bg-[#0a1628] px-3.5 py-1.5 text-xs font-semibold text-sky-300 hover:bg-[#0f223d] hover:border-sky-400 hover:text-white transition-all shadow-sm"
                >
                  <Activity className="h-3.5 w-3.5" />
                  <span>Launch Dashboard</span>
                </button>
                <button
                  onClick={() => signOut()}
                  className="rounded-xl border border-[#142a47] bg-[#07111e] px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white hover:border-sky-500/40 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="rounded-xl border border-[#142a47] bg-[#0a1628] px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:border-sky-500/40 hover:bg-[#0f223d] hover:text-white transition-all"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-slate-400 hover:bg-[#0a1628] md:hidden transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="mt-2 rounded-2xl border border-[#142a47] bg-[#07111e] p-4 shadow-2xl backdrop-blur-2xl md:hidden space-y-2.5">
            <a
              href="#telemetry-strip"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-200 hover:bg-[#0f223d]"
            >
              <Radio className="h-3.5 w-3.5 text-sky-400" />
              <span>Live Telemetry</span>
            </a>
            <a
              href="#capabilities"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-200 hover:bg-[#0f223d]"
            >
              <Compass className="h-3.5 w-3.5 text-sky-400" />
              <span>Core Capabilities</span>
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-200 hover:bg-[#0f223d]"
            >
              <Layers className="h-3.5 w-3.5 text-sky-400" />
              <span>How it Works</span>
            </a>
            <a
              href="#trust"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-200 hover:bg-[#0f223d]"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-sky-400" />
              <span>Trust Model</span>
            </a>
            <div className="pt-2 border-t border-[#142a47] flex gap-2">
              {mounted && user ? (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onExploreDashboard?.();
                  }}
                  className="flex-1 text-center rounded-xl bg-sky-500 py-2 text-xs font-bold text-slate-950 shadow-sm"
                >
                  Launch Dashboard
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center rounded-xl border border-[#142a47] bg-[#0a1628] py-2 text-xs font-semibold text-slate-200"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ===================================================================== */}
      {/* 2. HERO SECTION                                                       */}
      {/* ===================================================================== */}
      <section className="relative pt-36 pb-20 sm:pt-44 sm:pb-28 px-4 sm:px-6 lg:px-8 bg-radar-mesh bg-command-ambient overflow-hidden">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          {/* Eyebrow Status Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-[#07111e]/90 px-4 py-1.5 text-xs font-mono font-medium text-sky-300 shadow-[0_0_20px_-3px_rgba(56,189,248,0.3)] backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-400" />
            </span>
            <span>Next-Gen Climate Intelligence</span>
          </div>

          {/* Main Headline */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08]">
              Precision Climate Intelligence.<br />
              <span className="text-gradient-cyan">Grounded in Live Telemetry &amp; Truth.</span>
            </h1>
            <p className="wgpt-body-text max-w-3xl mx-auto text-base sm:text-lg text-slate-300/90 pt-1 font-sans">
              WeatherGPT synthesizes high-resolution sensor feeds, district hazard matrices, verified administrative bulletins, and personal context into auditable, life-saving action plans.
            </p>
          </div>

          {/* Core Communication Architecture Pipeline Banner */}
          <div className="inline-flex flex-wrap items-center justify-center gap-2 sm:gap-3 rounded-2xl border border-sky-500/30 bg-[#0a1628]/90 px-5 sm:px-7 py-3 text-[11px] sm:text-xs font-mono font-semibold text-slate-200 shadow-[0_0_25px_rgba(56,189,248,0.15)] backdrop-blur-md">
            <span className="flex items-center gap-1.5 text-sky-400 font-bold">
              <Radio className="h-3.5 w-3.5" />
              LIVE WEATHER
            </span>
            <span className="text-slate-600">→</span>
            <span className="flex items-center gap-1.5 text-sky-300 font-bold">
              <Zap className="h-3.5 w-3.5" />
              INTELLIGENCE
            </span>
            <span className="text-slate-600">→</span>
            <span className="flex items-center gap-1.5 text-amber-300 font-bold">
              <Activity className="h-3.5 w-3.5" />
              RISK MATRIX
            </span>
            <span className="text-slate-600">→</span>
            <span className="flex items-center gap-1.5 text-emerald-300 font-bold">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              PERSONALIZED ACTION
            </span>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {mounted && user ? (
              <button
                type="button"
                onClick={onExploreDashboard}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-400 px-8 py-3.5 text-sm font-bold text-slate-950 shadow-[0_0_25px_rgba(56,189,248,0.5)] transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Launch Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <Link
                href="/signup"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-400 px-8 py-3.5 text-sm font-bold text-slate-950 shadow-[0_0_25px_rgba(56,189,248,0.5)] transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Get Started</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
            <a
              href="#capabilities"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-sky-500/30 bg-[#0a1628]/90 px-7 py-3.5 text-sm font-semibold text-slate-200 hover:bg-[#0f223d] hover:border-sky-400 hover:text-white shadow-sm transition-all"
            >
              <Compass className="h-4 w-4 text-sky-400" />
              <span>Explore Intelligence</span>
            </a>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 3. LIVE DATA & TELEMETRY STRIP                                        */}
      {/* ===================================================================== */}
      <section id="telemetry-strip" className="border-y border-[#142a47] bg-[#07111e]/90 py-5 overflow-hidden scroll-mt-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs font-mono font-semibold text-slate-300">
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse" />
              LIVE WEATHER
            </span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
              GPS LOCATION
            </span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
              DISTRICT INTELLIGENCE
            </span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
              RISK ANALYSIS
            </span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
              OFFICIAL ALERTS
            </span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
              PERSONALIZED GUIDANCE
            </span>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 4. VALUE PILLARS / CAPABILITIES                                       */}
      {/* ===================================================================== */}
      <section id="capabilities" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-12 scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-[#0a1628] px-3.5 py-1 text-xs font-mono font-medium text-sky-300">
            <Activity className="h-3.5 w-3.5" />
            <span>Built for Precision &amp; Trust</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Engineered to Eliminate Misinformation
          </h2>
          <p className="wgpt-body-text text-xs sm:text-sm text-slate-400">
            Three foundational pillars ensure WeatherGPT gives you actionable safety decisions without generic weather noise.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1 */}
          <div className="group rounded-2xl border border-[#142a47] bg-[#0a1628]/90 p-7 space-y-4 shadow-lg backdrop-blur-sm hover:border-sky-500/50 hover:bg-[#0d1e34] transition-all duration-200">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#07111e] border border-sky-500/30 text-sky-400 shadow-inner group-hover:scale-105 transition-transform">
              <Thermometer className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Live Weather Intelligence
            </h3>
            <p className="wgpt-body-text text-xs sm:text-sm text-slate-400">
              High-resolution meteorological sensor integration tracking dry-bulb temperatures, inundation load, wind gusts, and UV radiation with zero delay.
            </p>
            <div className="pt-2 border-t border-[#142a47] text-[11px] font-mono text-sky-300 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-sky-400" />
              <span>Multi-vector sensor arrays</span>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="group rounded-2xl border border-[#142a47] bg-[#0a1628]/90 p-7 space-y-4 shadow-lg backdrop-blur-sm hover:border-sky-500/50 hover:bg-[#0d1e34] transition-all duration-200">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#07111e] border border-sky-500/30 text-sky-400 shadow-inner group-hover:scale-105 transition-transform">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Verified Government Alerts
            </h3>
            <p className="wgpt-body-text text-xs sm:text-sm text-slate-400">
              Strict domain-verified ground truth from District Collectorates and IMD bulletins. AI never fabricates or hallucinates administrative closures.
            </p>
            <div className="pt-2 border-t border-[#142a47] text-[11px] font-mono text-sky-300 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-sky-400" />
              <span>Zero hallucination guarantee</span>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="group rounded-2xl border border-[#142a47] bg-[#0a1628]/90 p-7 space-y-4 shadow-lg backdrop-blur-sm hover:border-sky-500/50 hover:bg-[#0d1e34] transition-all duration-200">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#07111e] border border-sky-500/30 text-sky-400 shadow-inner group-hover:scale-105 transition-transform">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Personalized Risk Guidance
            </h3>
            <p className="wgpt-body-text text-xs sm:text-sm text-slate-400">
              Mathematical risk synthesis tuned directly to your occupation, transit route, and regional district with bilingual action checklists.
            </p>
            <div className="pt-2 border-t border-[#142a47] text-[11px] font-mono text-sky-300 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-sky-400" />
              <span>Tailored to 8 distinct personas</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 5. HOW IT WORKS (7-Step Architecture Flow)                            */}
      {/* ===================================================================== */}
      <section id="how-it-works" className="py-24 bg-[#07111e]/60 border-y border-[#142a47] px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-[#0a1628] px-3.5 py-1 text-xs font-mono font-medium text-sky-300">
              <Layers className="h-3.5 w-3.5" />
              <span>Architecture Pipeline</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              7-Step Deterministic Intelligence Flow
            </h2>
            <p className="wgpt-body-text text-xs sm:text-sm text-slate-400">
              From raw telemetry ingestion to targeted personalized dispatch, every step is grounded and auditable.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
            <div className="rounded-2xl border border-[#142a47] bg-[#0a1628]/90 p-5 space-y-2">
              <span className="text-sky-400 font-bold text-sm block">01 · USER PROFILE</span>
              <p className="text-slate-300 font-sans text-xs">Occupation, district coordinate pin, and hazard alert thresholds.</p>
            </div>

            <div className="rounded-2xl border border-[#142a47] bg-[#0a1628]/90 p-5 space-y-2">
              <span className="text-sky-400 font-bold text-sm block">02 · METEOROLOGY</span>
              <p className="text-slate-300 font-sans text-xs">High-resolution Open-Meteo multi-variable atmospheric telemetry.</p>
            </div>

            <div className="rounded-2xl border border-[#142a47] bg-[#0a1628]/90 p-5 space-y-2">
              <span className="text-sky-400 font-bold text-sm block">03 · RISK ENGINE</span>
              <p className="text-slate-300 font-sans text-xs">Deterministic 4-vector mathematical calculation (rain, heat, wind, UV).</p>
            </div>

            <div className="rounded-2xl border border-[#142a47] bg-[#0a1628]/90 p-5 space-y-2">
              <span className="text-sky-400 font-bold text-sm block">04 · DISTRICT MATRIX</span>
              <p className="text-slate-300 font-sans text-xs">Subdivision flood vulnerability &amp; local disaster control mapping.</p>
            </div>

            <div className="rounded-2xl border border-[#142a47] bg-[#0a1628]/90 p-5 space-y-2">
              <span className="text-sky-400 font-bold text-sm block">05 · GROUND TRUTH</span>
              <p className="text-slate-300 font-sans text-xs">Whitelist-validated Collectorate and IMD administrative bulletins.</p>
            </div>

            <div className="rounded-2xl border border-[#142a47] bg-[#0a1628]/90 p-5 space-y-2">
              <span className="text-sky-400 font-bold text-sm block">06 · PERSONALIZATION</span>
              <p className="text-slate-300 font-sans text-xs">Action directives and routine guidelines in English and Tamil.</p>
            </div>

            <div className="col-span-1 sm:col-span-2 rounded-2xl border border-sky-500/30 bg-[#0f223d]/90 p-5 space-y-2 shadow-[0_0_20px_-3px_rgba(56,189,248,0.2)]">
              <span className="text-sky-300 font-bold text-sm block">07 · USER DISPATCH</span>
              <p className="text-slate-200 font-sans text-xs">Delivered directly via interactive dashboard with 100% telemetry relevance and zero fatigue.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 6. TRUST SECTION                                                      */}
      {/* ===================================================================== */}
      <section id="trust" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-12 scroll-mt-24">
        <div className="rounded-3xl border border-[#142a47] bg-[#0a1628]/90 p-8 sm:p-12 shadow-2xl backdrop-blur-md space-y-8">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-[#07111e] px-3.5 py-1 text-xs font-semibold text-sky-300">
              <ShieldCheck className="h-3.5 w-3.5 text-sky-400" />
              <span>Separation of Concerns Standard</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              AI Informs. Authorities Decide.
            </h2>
            <p className="wgpt-body-text text-xs sm:text-sm text-slate-300">
              WeatherGPT adheres to a strict architectural rule: AI models calculate environmental risk and provide personal precautions, but never invent administrative closure orders. Official authorities remain the sole source of truth.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="rounded-xl border border-[#142a47] bg-[#07111e] p-5 space-y-2">
              <span className="font-mono font-bold text-lg text-sky-400/40">01</span>
              <h3 className="font-bold text-white text-sm">Live Weather Data</h3>
              <p className="wgpt-body-text text-slate-400 text-[11px]">Real-time open meteorological feeds with continuous telemetry validation.</p>
            </div>

            <div className="rounded-xl border border-[#142a47] bg-[#07111e] p-5 space-y-2">
              <span className="font-mono font-bold text-lg text-sky-400/40">02</span>
              <h3 className="font-bold text-white text-sm">Geospatial Context</h3>
              <p className="wgpt-body-text text-slate-400 text-[11px]">Precise GPS pinning and district-boundary reverse geocoding across Tamil Nadu.</p>
            </div>

            <div className="rounded-xl border border-[#142a47] bg-[#07111e] p-5 space-y-2">
              <span className="font-mono font-bold text-lg text-sky-400/40">03</span>
              <h3 className="font-bold text-white text-sm">Official Verification</h3>
              <p className="wgpt-body-text text-slate-400 text-[11px]">Whitelist filtering against verified government and disaster authority portals.</p>
            </div>

            <div className="rounded-xl border border-[#142a47] bg-[#07111e] p-5 space-y-2">
              <span className="font-mono font-bold text-lg text-sky-400/40">04</span>
              <h3 className="font-bold text-white text-sm">Personalized Context</h3>
              <p className="wgpt-body-text text-slate-400 text-[11px]">Tailored exposure calculations and actionable advice for your daily routine.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 7. PROFESSIONAL MINIMAL FOOTER                                        */}
      {/* ===================================================================== */}
      <footer className="mt-auto border-t border-[#132742] bg-[#040810] py-12 text-xs text-slate-400">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 font-semibold text-slate-200">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-sky-500 text-slate-950 font-bold">
                  <Sparkles className="h-3 w-3 fill-current" />
                </div>
                <span className="font-bold text-sm text-white">Weather<span className="text-sky-400">GPT</span></span>
              </div>
              <p className="wgpt-body-text text-slate-400 max-w-md">
                Personalized Weather Intelligence &amp; Grounded Alert Verification Platform.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-slate-400 font-mono text-[11px]">
              <span className="flex items-center gap-1.5 text-slate-300">
                <ShieldCheck className="h-3.5 w-3.5 text-sky-400" />
                Official Source Verification
              </span>
            </div>
          </div>

          <div className="pt-6 border-t border-[#142a47] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-[11px] text-slate-500">
            <div className="flex items-center gap-4">
              <a href="#telemetry-strip" className="hover:text-sky-300 transition-colors">Telemetry</a>
              <a href="#capabilities" className="hover:text-sky-300 transition-colors">Capabilities</a>
              <a href="#how-it-works" className="hover:text-sky-300 transition-colors">How it Works</a>
              <a href="#trust" className="hover:text-sky-300 transition-colors">Trust Model</a>
              <Link href="/login" className="hover:text-sky-300 transition-colors">Sign In</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
