"use client";

import React from "react";
import { Globe } from "lucide-react";
import { SUPPORTED_LANGUAGES } from "@/lib/constants";
import { useLanguage } from "@/contexts/language-context";

export function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <label className="flex items-center gap-1.5 rounded-xl border border-[#142a47] bg-[#0a1628] px-2.5 py-1.5 text-xs font-medium text-slate-300">
      <Globe className="h-3.5 w-3.5 text-sky-400" />
      <span className="sr-only">{t("app.language")}</span>
      <select
        value={language}
        onChange={(event) => setLanguage(event.target.value as typeof language)}
        aria-label={t("app.language")}
        className="max-w-[110px] bg-transparent text-xs text-slate-200 outline-none"
      >
        {SUPPORTED_LANGUAGES.map((item) => (
          <option key={item.code} value={item.code} className="bg-[#07111e] text-white">
            {item.label}
          </option>
        ))}
      </select>
    </label>
  );
}
