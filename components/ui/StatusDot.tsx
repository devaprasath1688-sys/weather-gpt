type StatusDotProps = {
  configured: boolean;
};

export function StatusDot({ configured }: StatusDotProps) {
  return (
    <span
      className={`inline-block h-2 w-2 rounded-full ${
        configured ? "bg-white" : "bg-neutral-600"
      }`}
      aria-hidden
    />
  );
}
