export function gridDistance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}

export function euclideanDistance(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export function randomInt(min: number, max: number): number {
  const low = Math.ceil(Math.min(min, max));
  const high = Math.floor(Math.max(min, max));
  return Math.floor(Math.random() * (high - low + 1)) + low;
}

export function chance(percent: number): boolean {
  const boundedPercent = clamp(percent, 0, 100);
  return Math.random() * 100 < boundedPercent;
}

export function gridToPixel(
  gridX: number,
  gridY: number,
  tileSize: number
): { x: number; y: number } {
  return {
    x: gridX * tileSize + tileSize / 2,
    y: gridY * tileSize + tileSize / 2
  };
}

export function pixelToGrid(
  pixelX: number,
  pixelY: number,
  tileSize: number
): { x: number; y: number } {
  return {
    x: Math.floor(pixelX / tileSize),
    y: Math.floor(pixelY / tileSize)
  };
}
