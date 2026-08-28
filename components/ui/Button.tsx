import React from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "onDark" | "onDarkOutline" | "danger" | "ghost" | "cyanOutline";

type ButtonProps = {
  children: React.ReactNode;
  variant?: ButtonVariant;
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: () => void;
  href?: string;
  loading?: boolean;
};

const variantClass: Record<ButtonVariant, string> = {
  primary:
    "group inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 px-5 py-2.5 text-xs sm:text-sm font-bold shadow-[0_0_20px_-3px_rgba(56,189,248,0.4)] transition-all duration-200 hover:shadow-[0_0_25px_-2px_rgba(56,189,248,0.6)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none",
  secondary:
    "inline-flex items-center justify-center gap-2 rounded-xl border border-sky-500/20 bg-[#0a1628] px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-200 shadow-sm transition-all duration-200 hover:border-sky-500/50 hover:bg-[#0f223d] hover:text-white hover:shadow-[0_0_15px_-3px_rgba(56,189,248,0.2)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed",
  onDark:
    "inline-flex items-center justify-center gap-2 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 px-5 py-2.5 text-xs sm:text-sm font-bold shadow-sm transition-all duration-200 hover:shadow-[0_0_20px_rgba(56,189,248,0.5)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed",
  onDarkOutline:
    "inline-flex items-center justify-center gap-2 rounded-xl border border-sky-500/30 bg-[#07111e]/80 px-5 py-2.5 text-xs sm:text-sm font-semibold text-sky-200 transition-all duration-200 hover:border-sky-400 hover:bg-[#0a182c] hover:text-white hover:shadow-[0_0_15px_-3px_rgba(56,189,248,0.25)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed",
  cyanOutline:
    "inline-flex items-center justify-center gap-2 rounded-xl border border-sky-400/50 bg-sky-500/10 px-5 py-2.5 text-xs sm:text-sm font-semibold text-sky-300 transition-all duration-200 hover:border-sky-300 hover:bg-sky-500/20 hover:text-white hover:shadow-[0_0_20px_-3px_rgba(56,189,248,0.3)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed",
  danger:
    "inline-flex items-center justify-center gap-2 rounded-xl border border-rose-500/30 bg-rose-950/30 px-5 py-2.5 text-xs sm:text-sm font-semibold text-rose-200 transition-all duration-200 hover:border-rose-400 hover:bg-rose-950/60 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]",
  ghost:
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-medium text-slate-400 transition-colors duration-150 hover:bg-[#0a1628] hover:text-sky-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed",
};

export function Button({
  children,
  variant = "primary",
  className = "",
  type = "button",
  disabled = false,
  onClick,
  href,
  loading = false,
}: ButtonProps) {
  const baseClasses = variantClass[variant];
  const disabledClasses = disabled || loading ? "opacity-50 cursor-not-allowed pointer-events-none" : "";
  const combinedClasses = `${baseClasses} ${disabledClasses} ${className}`;

  if (href) {
    return (
      <Link href={href} className={combinedClasses}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin text-current" /> : children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={combinedClasses}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin text-current" /> : children}
    </button>
  );
}