import React from "react";
import Link from "next/link";

type ButtonVariant = "primary" | "secondary" | "onDark" | "onDarkOutline" | "danger";

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
    "group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs sm:text-sm font-semibold text-black shadow-sm transition-all hover:bg-neutral-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
  secondary:
    "inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900 px-5 py-2.5 text-xs sm:text-sm font-semibold text-neutral-200 shadow-sm transition-all hover:border-neutral-700 hover:bg-neutral-800 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed",
  onDark:
    "inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs sm:text-sm font-semibold text-black transition-all hover:bg-neutral-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed",
  onDarkOutline:
    "inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-700 bg-neutral-900 px-5 py-2.5 text-xs sm:text-sm font-semibold text-neutral-200 transition-all hover:border-neutral-500 hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed",
  danger:
    "inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900 px-5 py-2.5 text-xs sm:text-sm font-semibold text-neutral-300 transition-all hover:border-neutral-600 hover:bg-neutral-800 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed",
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
  const disabledClasses = disabled || loading ? "opacity-50 cursor-not-allowed" : "";
  const combinedClasses = `${baseClasses} ${disabledClasses} ${className}`;

  if (href) {
    return (
      <Link href={href} className={combinedClasses}>
        {loading ? <span className="animate-spin text-xs">●</span> : children}
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
      {loading ? <span className="animate-spin text-xs">●</span> : children}
    </button>
  );
}