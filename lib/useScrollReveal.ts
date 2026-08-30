"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Lightweight IntersectionObserver-based scroll reveal hook.
 * Returns a ref to attach to any element and a boolean indicating visibility.
 * Respects prefers-reduced-motion automatically (element becomes visible immediately).
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options?: {
    threshold?: number;
    rootMargin?: string;
    once?: boolean;
  }
) {
  const { threshold = 0.12, rootMargin = "0px 0px -60px 0px", once = true } = options || {};
  const ref = useRef<T | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Respect reduced motion — show immediately
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (once) {
              observer.unobserve(entry.target);
            }
          } else if (!once) {
            setIsVisible(false);
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return { ref, isVisible };
}
