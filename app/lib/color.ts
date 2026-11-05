/** Turns #RRGGBB into an rgba() color. Falls back to a dark wash when the hex is unusable. */
export function withAlpha(hex: string, alpha: number): string {
  const raw = hex.replace("#", "");
  const full = raw.length === 3 ? raw.split("").map((char) => char + char).join("") : raw;
  const value = Number.parseInt(full, 16);
  if (!Number.isFinite(value) || full.length !== 6) return `rgba(22, 16, 48, ${alpha})`;
  return `rgba(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}, ${alpha})`;
}
