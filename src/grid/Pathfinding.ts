import type { TerrainType } from './TileTypes';
import { getMoveCost as getTerrainMoveCost } from './TileTypes';

export interface PathNode {
  x: number;
  y: number;
  cost: number;
}

interface SearchNode {
  x: number;
  y: number;
  g: number;
  f: number;
}

const DIRECTIONS: Array<{ x: number; y: number }> = [
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 }
];

function key(x: number, y: number): string {
  return `${x},${y}`;
}

function parseKey(value: string): { x: number; y: number } {
  const [x, y] = value.split(',').map(Number);
  return { x, y };
}

function isInBounds(x: number, y: number, grid: TerrainType[][]): boolean {
  return y >= 0 && y < grid.length && x >= 0 && x < (grid[0]?.length ?? 0);
}

function manhattanDistance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}

export function findPath(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  grid: TerrainType[][],
  moveCost: (terrain: TerrainType) => number,
  isBlocked?: (x: number, y: number) => boolean
): PathNode[] {
  if (!isInBounds(startX, startY, grid) || !isInBounds(endX, endY, grid)) {
    return [];
  }

  if (startX === endX && startY === endY) {
    return [{ x: startX, y: startY, cost: 0 }];
  }

  const startKey = key(startX, startY);
  const endKey = key(endX, endY);

  const open: SearchNode[] = [
    {
      x: startX,
      y: startY,
      g: 0,
      f: manhattanDistance(startX, startY, endX, endY)
    }
  ];

  const cameFrom = new Map<string, string>();
  const gScore = new Map<string, number>([[startKey, 0]]);
  const closed = new Set<string>();

  while (open.length > 0) {
    open.sort((a, b) => a.f - b.f);
    const current = open.shift();

    if (!current) {
      break;
    }

    const currentKey = key(current.x, current.y);
    if (currentKey === endKey) {
      const path: PathNode[] = [];
      let traceKey: string | undefined = currentKey;

      while (traceKey) {
        const { x, y } = parseKey(traceKey);
        path.push({ x, y, cost: gScore.get(traceKey) ?? 0 });

        if (traceKey === startKey) {
          break;
        }

        traceKey = cameFrom.get(traceKey);
      }

      return path.reverse();
    }

    closed.add(currentKey);

    for (const dir of DIRECTIONS) {
      const nx = current.x + dir.x;
      const ny = current.y + dir.y;
      const neighborKey = key(nx, ny);

      if (!isInBounds(nx, ny, grid) || closed.has(neighborKey)) {
        continue;
      }

      if (isBlocked?.(nx, ny) && !(nx === startX && ny === startY)) {
        continue;
      }

      const terrain = grid[ny][nx];
      const stepCost = moveCost(terrain);

      if (!Number.isFinite(stepCost)) {
        continue;
      }

      const tentativeG = current.g + stepCost;
      const knownG = gScore.get(neighborKey);

      if (knownG !== undefined && tentativeG >= knownG) {
        continue;
      }

      cameFrom.set(neighborKey, currentKey);
      gScore.set(neighborKey, tentativeG);

      const existing = open.find((node) => node.x === nx && node.y === ny);
      const heuristic = manhattanDistance(nx, ny, endX, endY);
      const f = tentativeG + heuristic;

      if (existing) {
        existing.g = tentativeG;
        existing.f = f;
      } else {
        open.push({ x: nx, y: ny, g: tentativeG, f });
      }
    }
  }

  return [];
}

export function getMovementRange(
  startX: number,
  startY: number,
  movePoints: number,
  grid: TerrainType[][],
  isBlocked?: (x: number, y: number) => boolean
): { x: number; y: number }[] {
  if (!isInBounds(startX, startY, grid)) {
    return [];
  }

  const startKey = key(startX, startY);
  const frontier: Array<{ x: number; y: number; cost: number }> = [{
    x: startX,
    y: startY,
    cost: 0
  }];
  const bestCost = new Map<string, number>([[startKey, 0]]);

  while (frontier.length > 0) {
    frontier.sort((a, b) => a.cost - b.cost);
    const current = frontier.shift();

    if (!current) {
      break;
    }

    for (const dir of DIRECTIONS) {
      const nx = current.x + dir.x;
      const ny = current.y + dir.y;
      const neighborKey = key(nx, ny);

      if (!isInBounds(nx, ny, grid)) {
        continue;
      }

      if (isBlocked?.(nx, ny) && !(nx === startX && ny === startY)) {
        continue;
      }

      const stepCost = getTerrainMoveCost(grid[ny][nx]);
      if (!Number.isFinite(stepCost)) {
        continue;
      }

      const nextCost = current.cost + stepCost;
      if (nextCost > movePoints) {
        continue;
      }

      const known = bestCost.get(neighborKey);
      if (known !== undefined && nextCost >= known) {
        continue;
      }

      bestCost.set(neighborKey, nextCost);
      frontier.push({ x: nx, y: ny, cost: nextCost });
    }
  }

  return Array.from(bestCost.keys())
    .map(parseKey)
    .sort((a, b) => a.y - b.y || a.x - b.x);
}

export function getAttackRange(
  positions: { x: number; y: number }[],
  minRange: number,
  maxRange: number,
  gridCols: number,
  gridRows: number
): { x: number; y: number }[] {
  const tiles = new Set<string>();

  for (const position of positions) {
    for (let dy = -maxRange; dy <= maxRange; dy += 1) {
      for (let dx = -maxRange; dx <= maxRange; dx += 1) {
        const distance = Math.abs(dx) + Math.abs(dy);
        if (distance < minRange || distance > maxRange) {
          continue;
        }

        const x = position.x + dx;
        const y = position.y + dy;

        if (x < 0 || y < 0 || x >= gridCols || y >= gridRows) {
          continue;
        }

        tiles.add(key(x, y));
      }
    }
  }

  return Array.from(tiles)
    .map(parseKey)
    .sort((a, b) => a.y - b.y || a.x - b.x);
}
