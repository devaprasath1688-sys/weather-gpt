"use client";

import React from "react";
import Link from "next/link";
import { Container } from "@/components/layout/SiteShell";
import { OnboardingWizard } from "@/components/profile/OnboardingWizard";
import { Sparkles, ArrowRight } from "lucide-react";
import { SIH_PROBLEM_CODE } from "@/lib/constants";
import { useLanguage } from "@/contexts/language-context";

export default function SignupPage() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 bg-radar-mesh">
      <Container className="w-full max-w-xl">
        {/* Top Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500 text-slate-950 font-bold shadow-[0_0_20px_rgba(56,189,248,0.5)]">
              <Sparkles className="h-5 w-5 fill-current" />
            </div>
            <div className="text-left">
              <h1 className="font-display text-2xl font-bold tracking-tight text-white">
                Weather<span className="text-sky-400">GPT</span>
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="inline-flex items-center rounded-full border border-sky-500/30 bg-[#0a1628] px-2 py-0.5 text-[10px] font-semibold tracking-wide text-sky-300">
                  {SIH_PROBLEM_CODE}
                </span>
                <span className="text-[11px] text-slate-400">{t("auth.onboarding")}</span>
              </div>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
            {t("auth.setup")}
          </p>
        </div>

        {/* 6-Step Interactive Onboarding Wizard */}
        <OnboardingWizard />

        {/* Home Link */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-sky-300 transition-colors"
          >
            <ArrowRight className="h-3 w-3 rotate-180" />
            <span>{t("auth.backDashboard")}</span>
          </Link>
        </div>
      </Container>
    </div>
  );
}