"use client";

import React from "react";
import { useScrollReveal } from "@/lib/useScrollReveal";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  /** Animation variant: "up" (default), "fade", or "scale" */
  variant?: "up" | "fade" | "scale";
  /** Stagger delay index 1-6 for sequential reveals */
  delay?: 1 | 2 | 3 | 4 | 5 | 6;
  as?: keyof React.JSX.IntrinsicElements;
};

/**
 * Reveal wrapper component — fades/slides children into view on scroll.
 * Uses IntersectionObserver, no scroll listeners. GPU-friendly transforms only.
 */
export function Reveal({
  children,
  className = "",
  variant = "up",
  delay,
  as: Tag = "div",
}: RevealProps) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();

  const variantClass =
    variant === "fade" ? "reveal-fade" : variant === "scale" ? "reveal-scale" : "reveal-visible";
  const delayClass = delay ? `reveal-delay-${delay}` : "";

  const Component = Tag as React.ElementType;

  return (
    <Component
      ref={ref}
      className={`reveal ${isVisible ? `${variantClass} ${delayClass}` : ""} ${className}`}
    >
      {children}
    </Component>
  );
}
