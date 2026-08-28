"use client";

import React from "react";
import Link from "next/link";
import { Container } from "@/components/layout/SiteShell";
import { OnboardingWizard } from "@/components/profile/OnboardingWizard";
import { Sparkles, ArrowRight } from "lucide-react";
import { SIH_PROBLEM_CODE } from "@/lib/constants";

export default function SignupPage() {
  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 bg-radar-mesh">
      <Container className="w-full max-w-xl">
        {/* Top Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black font-bold shadow-sm">
              <Sparkles className="h-5 w-5 fill-current" />
            </div>
            <div className="text-left">
              <h1 className="font-display text-2xl font-bold tracking-tight text-white">
                Weather<span className="text-neutral-400">GPT</span>
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="inline-flex items-center rounded-full border border-neutral-700 bg-neutral-900 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-neutral-300">
                  {SIH_PROBLEM_CODE}
                </span>
                <span className="text-[11px] text-neutral-400">Onboarding</span>
              </div>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-sm mx-auto">
            Configure your personalized weather risk profile in 6 simple steps.
          </p>
        </div>

        {/* 6-Step Interactive Onboarding Wizard */}
        <OnboardingWizard />

        {/* Home Link */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-white transition-colors"
          >
            <ArrowRight className="h-3 w-3 rotate-180" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </Container>
    </div>
  );
}