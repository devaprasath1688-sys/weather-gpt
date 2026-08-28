import React from "react";
import Link from "next/link";

type ButtonLinkVariant = "primary" | "secondary" | "outline" | "ghost" | "cyanOutline";

type ButtonLinkProps = {
  children: React.ReactNode;
  href: string;
  variant?: ButtonLinkVariant;
  className?: string;
};

const variantClass: Record<ButtonLinkVariant, string> = {
  primary:
    "group inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 px-5 py-2.5 text-xs sm:text-sm font-bold shadow-[0_0_20px_-3px_rgba(56,189,248,0.4)] transition-all duration-200 hover:shadow-[0_0_25px_-2px_rgba(56,189,248,0.6)] active:scale-[0.98]",
  secondary:
    "inline-flex items-center justify-center gap-2 rounded-xl border border-sky-500/20 bg-[#0a1628] px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-200 shadow-sm transition-all duration-200 hover:border-sky-500/50 hover:bg-[#0f223d] hover:text-white hover:shadow-[0_0_15px_-3px_rgba(56,189,248,0.2)] active:scale-[0.98]",
  outline:
    "inline-flex items-center justify-center gap-2 rounded-xl border border-sky-500/30 bg-[#07111e]/80 px-5 py-2.5 text-xs sm:text-sm font-semibold text-sky-200 transition-all duration-200 hover:border-sky-400 hover:bg-[#0a182c] hover:text-white hover:shadow-[0_0_15px_-3px_rgba(56,189,248,0.25)] active:scale-[0.98]",
  cyanOutline:
    "inline-flex items-center justify-center gap-2 rounded-xl border border-sky-400/50 bg-sky-500/10 px-5 py-2.5 text-xs sm:text-sm font-semibold text-sky-300 transition-all duration-200 hover:border-sky-300 hover:bg-sky-500/20 hover:text-white hover:shadow-[0_0_20px_-3px_rgba(56,189,248,0.3)] active:scale-[0.98]",
  ghost:
    "inline-flex items-center justify-center gap-2 rounded-xl bg-transparent px-4 py-2 text-xs sm:text-sm font-medium text-slate-400 transition-colors duration-150 hover:bg-[#0a1628] hover:text-sky-300 active:scale-[0.98]",
};

export function ButtonLink({
  children,
  href,
  variant = "primary",
  className = "",
}: ButtonLinkProps) {
  return (
    <Link href={href} className={`${variantClass[variant]} ${className}`}>
      {children}
    </Link>
  );
}
