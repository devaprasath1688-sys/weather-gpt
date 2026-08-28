import React from "react";
import Link from "next/link";

type ButtonLinkVariant = "primary" | "secondary" | "outline" | "ghost";

type ButtonLinkProps = {
  children: React.ReactNode;
  href: string;
  variant?: ButtonLinkVariant;
  className?: string;
};

const variantClass: Record<ButtonLinkVariant, string> = {
  primary:
    "group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs sm:text-sm font-semibold text-black shadow-sm transition-all hover:bg-neutral-200 active:scale-[0.98]",
  secondary:
    "inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900 px-5 py-2.5 text-xs sm:text-sm font-semibold text-neutral-200 shadow-sm transition-all hover:border-neutral-700 hover:bg-neutral-800 hover:text-white",
  outline:
    "inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-700 bg-transparent px-5 py-2.5 text-xs sm:text-sm font-semibold text-neutral-200 transition-all hover:border-neutral-500 hover:bg-neutral-900",
  ghost:
    "inline-flex items-center justify-center gap-2 rounded-xl bg-transparent px-4 py-2 text-xs sm:text-sm font-medium text-neutral-400 transition-colors hover:bg-neutral-900 hover:text-white",
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
