export function Logo({ size = 28, dark = false }: { size?: number; dark?: boolean }) {
  return (
    <span className="inline-flex select-none items-end gap-2 leading-none" aria-label="Simple Logistics">
      <span
        className="font-black tracking-[-0.06em]"
        style={{ color: dark ? '#ffffff' : '#111111', fontSize: Math.max(18, size * 0.72) }}
      >
        SIMPLE
      </span>
      <span
        className="pb-[2px] font-extrabold uppercase tracking-[0.24em] text-brand-red"
        style={{ fontSize: Math.max(8, size * 0.32) }}
      >
        Logistics
      </span>
    </span>
  );
}
