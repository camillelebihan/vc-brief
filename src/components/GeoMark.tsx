// A small geometric mark generated from a company name: filled shapes in the app palette.
// Used instead of real logos (decided in the spec).
const COLORS = ["#4352d6", "#d9c8f5", "#e4f08e", "#f06b3f", "#262626", "#b9a1ea"];

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

export function GeoMark({ name, size = 40 }: { name: string; size?: number }) {
  const h = hash(name);
  const bg = COLORS[h % COLORS.length];
  const fg = COLORS[(h >> 3) % COLORS.length] === bg ? COLORS[(h % COLORS.length + 2) % COLORS.length] : COLORS[(h >> 3) % COLORS.length];
  const shape = (h >> 6) % 4;
  const rot = ((h >> 9) % 4) * 90;
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden className="shrink-0 rounded-full">
      <rect width="40" height="40" rx="20" fill={bg} />
      <g transform={`rotate(${rot} 20 20)`} fill={fg}>
        {shape === 0 && <path d="M20 8 32 30H8Z" />}
        {shape === 1 && <path d="M8 20a12 12 0 0 1 24 0Z" />}
        {shape === 2 && <rect x="11" y="11" width="18" height="18" rx="4" />}
        {shape === 3 && (
          <>
            <circle cx="15" cy="20" r="6" />
            <circle cx="26" cy="20" r="6" opacity=".7" />
          </>
        )}
      </g>
    </svg>
  );
}
