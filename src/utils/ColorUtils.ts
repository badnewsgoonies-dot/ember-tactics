import { TEAM_COLORS } from '../config';

function clampChannel(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

export function hexToRgb(hex: number): { r: number; g: number; b: number } {
  return {
    r: (hex >> 16) & 0xff,
    g: (hex >> 8) & 0xff,
    b: hex & 0xff
  };
}

export function rgbToHex(r: number, g: number, b: number): number {
  const rr = clampChannel(r);
  const gg = clampChannel(g);
  const bb = clampChannel(b);
  return (rr << 16) | (gg << 8) | bb;
}

export function darken(color: number, amount: number): number {
  const t = Math.max(0, Math.min(1, amount));
  const { r, g, b } = hexToRgb(color);
  return rgbToHex(r * (1 - t), g * (1 - t), b * (1 - t));
}

export function lighten(color: number, amount: number): number {
  const t = Math.max(0, Math.min(1, amount));
  const { r, g, b } = hexToRgb(color);
  return rgbToHex(r + (255 - r) * t, g + (255 - g) * t, b + (255 - b) * t);
}

export function alphaBlend(fg: number, bg: number, alpha: number): number {
  const a = Math.max(0, Math.min(1, alpha));
  const f = hexToRgb(fg);
  const b = hexToRgb(bg);

  return rgbToHex(
    f.r * a + b.r * (1 - a),
    f.g * a + b.g * (1 - a),
    f.b * a + b.b * (1 - a)
  );
}

export function getTeamColor(team: 'player' | 'enemy' | 'ally'): number {
  return TEAM_COLORS[team];
}
