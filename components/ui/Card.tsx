import React from "react";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "glass" | "glassStrong" | "selected" | "highlight";
};

export function Card({
  children,
  className = "",
  variant = "glass",
  ...props
}: CardProps) {
  const baseStyles = "rounded-2xl transition-all duration-200";
  
  const variants = {
    default: "bg-neutral-900 border border-neutral-800 text-neutral-100 p-6",
    glass: "bg-neutral-900/90 border border-neutral-800 text-neutral-100 p-6",
    glassStrong: "bg-neutral-950 border border-neutral-800 text-neutral-100 p-6 shadow-xl",
    selected: "bg-neutral-900 border border-white text-neutral-100 p-6 shadow-md",
    highlight: "bg-neutral-950 border border-neutral-700 text-neutral-100 p-6 shadow-xl",
  };

  return (
    <div className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
}
