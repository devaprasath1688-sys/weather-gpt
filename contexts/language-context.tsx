"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { LanguageCode } from "@/types";
import { SUPPORTED_LANGUAGES } from "@/lib/constants";
import { useAuth } from "@/contexts/auth-context";
import en from "@/messages/en.json";
import hi from "@/messages/hi.json";
import ta from "@/messages/ta.json";
import te from "@/messages/te.json";
import ml from "@/messages/ml.json";
import kn from "@/messages/kn.json";
import ur from "@/messages/ur.json";
import mr from "@/messages/mr.json";
import bn from "@/messages/bn.json";
import or from "@/messages/or.json";
import { uiMessages, uiMessagesByLanguage } from "@/messages/ui";

const STORAGE_KEY = "wgpt_language";
export type MessageKey = keyof typeof en | keyof typeof uiMessages.en;
const dictionaries: Record<LanguageCode, Partial<Record<MessageKey, string>>> = {
  en: { ...en, ...uiMessagesByLanguage.en }, hi: { ...hi, ...uiMessagesByLanguage.hi }, ta: { ...ta, ...uiMessagesByLanguage.ta },
  te: { ...te, ...uiMessagesByLanguage.te }, ml: { ...ml, ...uiMessagesByLanguage.ml }, kn: { ...kn, ...uiMessagesByLanguage.kn },
  ur: { ...ur, ...uiMessagesByLanguage.ur }, mr: { ...mr, ...uiMessagesByLanguage.mr }, bn: { ...bn, ...uiMessagesByLanguage.bn },
  or: { ...or, ...uiMessagesByLanguage.or },
};
type LanguageContextValue = {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
  t: (key: MessageKey, variables?: Record<string, string | number>) => string;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

function isLanguageCode(value: string): value is LanguageCode {
  return SUPPORTED_LANGUAGES.some((item) => item.code === value);
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>("en");
  const { userProfile } = useAuth();

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved && isLanguageCode(saved)) {
      setLanguageState(saved);
    } else if (userProfile?.language) {
      setLanguageState(userProfile.language);
    }
  }, [userProfile]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ur" ? "rtl" : "ltr";
  }, [language]);

  const setLanguage = (nextLanguage: LanguageCode) => {
    setLanguageState(nextLanguage);
    window.localStorage.setItem(STORAGE_KEY, nextLanguage);
  };

  const value = useMemo(() => ({
    language,
    setLanguage,
    t: (key: MessageKey, variables?: Record<string, string | number>) => {
      let value = dictionaries[language][key] || dictionaries.en[key] || key;
      for (const [name, replacement] of Object.entries(variables || {})) value = value.replace(`{${name}}`, String(replacement));
      return value;
    },
  }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
}
