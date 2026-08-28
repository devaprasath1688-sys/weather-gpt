type StatusDotProps = {
  configured: boolean;
};

export function StatusDot({ configured }: StatusDotProps) {
  return (
    <span className="relative inline-flex h-2.5 w-2.5 items-center justify-center" aria-hidden>
      {configured && (
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-60" />
      )}
      <span
        className={`relative inline-block h-2 w-2 rounded-full ${
          configured ? "bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]" : "bg-slate-600"
        }`}
      />
    </span>
  );
}
