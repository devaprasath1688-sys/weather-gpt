"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { Container } from "@/components/layout/SiteShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Sparkles, Mail, Lock, ArrowRight, User, CheckCircle2, ShieldCheck } from "lucide-react";
import { SIH_PROBLEM_CODE } from "@/lib/constants";
import { useLanguage } from "@/contexts/language-context";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, loading } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await signIn(email, password);

    if (result.error) {
      setError(result.error.message);
      setIsSubmitting(false);
    } else {
      router.push("/#overview");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-radar-mesh">
      <Container className="w-full max-w-md">
        {/* Header */}
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
                <span className="text-[11px] text-slate-400">{t("nav.signIn")}</span>
              </div>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            {t("auth.setup")}
          </p>
        </div>

        {/* Login Card */}
        <Card variant="glassStrong" className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white tracking-tight">{t("auth.welcome")}</h2>
            <p className="text-xs text-slate-400">
              {t("auth.signInTo")}
            </p>
          </div>

          {error && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-950/40 p-3.5 text-xs text-rose-200 flex items-start gap-2.5">
              <span className="text-rose-400 font-bold">!</span>
              <p className="flex-1">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <Mail className="h-3.5 w-3.5 text-sky-400" />
                {t("auth.email")}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-[#142a47] bg-[#07111e] px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 transition-all duration-150 focus:border-sky-400 focus:ring-1 focus:ring-sky-400/50 focus:outline-none"
                placeholder="you@example.com"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <Lock className="h-3.5 w-3.5 text-sky-400" />
                {t("auth.password")}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-[#142a47] bg-[#07111e] px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 transition-all duration-150 focus:border-sky-400 focus:ring-1 focus:ring-sky-400/50 focus:outline-none"
                placeholder="••••••••"
                disabled={isSubmitting}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              disabled={isSubmitting || loading}
              loading={isSubmitting}
            >
              {isSubmitting ? t("auth.signingIn") : t("auth.signInTo")}
              {!isSubmitting && <ArrowRight className="h-4 w-4" />}
            </Button>
          </form>

          <div className="pt-4 border-t border-[#142a47] text-center">
            <p className="text-xs text-slate-400">
              {t("auth.noAccount")} {" "}
              <Link
                href="/signup"
                className="font-semibold text-sky-300 hover:text-sky-200 hover:underline transition-colors"
              >
                {t("auth.startOnboarding")}
              </Link>
            </p>
          </div>
        </Card>

        {/* Feature Highlights */}
        <div className="mt-8 grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-[#142a47] bg-[#0a1628]/80 p-3 text-center">
            <ShieldCheck className="h-4 w-4 text-sky-400 mx-auto mb-1" />
            <p className="text-[11px] font-medium text-slate-300">{t("nav.trust")}</p>
          </div>
          <div className="rounded-xl border border-[#142a47] bg-[#0a1628]/80 p-3 text-center">
            <User className="h-4 w-4 text-sky-400 mx-auto mb-1" />
            <p className="text-[11px] font-medium text-slate-300">{t("nav.recommendations")}</p>
          </div>
          <div className="rounded-xl border border-[#142a47] bg-[#0a1628]/80 p-3 text-center">
            <CheckCircle2 className="h-4 w-4 text-sky-400 mx-auto mb-1" />
            <p className="text-[11px] font-medium text-slate-300">{t("nav.alerts")}</p>
          </div>
        </div>

        <div className="mt-6 text-center">
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