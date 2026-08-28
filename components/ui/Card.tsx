import React from "react";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "glass" | "glassStrong" | "selected" | "highlight" | "command";
};

export function Card({
  children,
  className = "",
  variant = "glass",
  ...props
}: CardProps) {
  const baseStyles = "rounded-2xl transition-all duration-200";
  
  const variants = {
    default: "bg-[#0a1628] border border-[#142a47] text-slate-100 p-6 shadow-md hover:border-sky-500/30",
    glass: "bg-[#0a1628]/85 border border-[#142a47] text-slate-100 p-6 shadow-lg backdrop-blur-md hover:border-sky-500/30",
    glassStrong: "bg-[#07111e]/92 border border-[#1a365d] text-slate-100 p-6 shadow-2xl backdrop-blur-xl",
    selected: "bg-[#0d1e34] border border-sky-400 text-slate-100 p-6 shadow-[0_0_25px_-5px_rgba(56,189,248,0.25)]",
    highlight: "bg-[#0a1628] border border-sky-500/40 text-slate-100 p-6 shadow-xl relative overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-[2px] before:bg-gradient-to-r before:from-transparent before:via-sky-400 before:to-transparent",
    command: "bg-[#060e1a]/95 border border-[#142a47] text-slate-100 p-6 shadow-[0_20px_50px_-10px_rgba(2,6,23,0.9)] backdrop-blur-2xl",
  };

  return (
    <div className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
}
