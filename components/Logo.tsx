export function Logo({ size = 28, dark = false }: { size?: number; dark?: boolean }) {
  const textColor = dark ? '#ffffff' : '#111827';
  return (
    <span className="inline-flex items-center gap-2.5 select-none">
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <rect x="2" y="2" width="36" height="36" rx="8" stroke={textColor} strokeWidth="3" />
        <path
          d="M11 20.5L17 26.5L29 13"
          stroke="#E31E24"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="leading-none">
        <span className="block text-[15px] font-extrabold tracking-tight" style={{ color: textColor }}>
          SIMPLE
        </span>
        <span className="block text-[10px] font-bold tracking-[0.2em] text-brand-red">LOGISTICS</span>
      </span>
    </span>
  );
}
