import { getMovementRange } from '../grid/Pathfinding';
import type { TerrainType } from '../grid/TileTypes';

function makeGrid(cols: number, rows: number, fill: TerrainType = 'Plains'): TerrainType[][] {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => fill));
}

function hasTile(tiles: Array<{ x: number; y: number }>, x: number, y: number): boolean {
  return tiles.some((tile) => tile.x === x && tile.y === y);
}

describe('getMovementRange', () => {
  test('Unit with 3 move on open plains gets correct tile count', () => {
    const grid = makeGrid(9, 9);
    const range = getMovementRange(4, 4, 3, grid);

    expect(range).toHaveLength(25);
    expect(hasTile(range, 4, 4)).toBe(true);
    expect(hasTile(range, 7, 4)).toBe(true);
    expect(hasTile(range, 1, 4)).toBe(true);
  });

  test('Unit blocked by water/mountain tiles', () => {
    const grid = makeGrid(5, 5);
    grid[1][2] = 'Water';
    grid[2][1] = 'Mountain';

    const range = getMovementRange(2, 2, 2, grid);

    expect(hasTile(range, 2, 1)).toBe(false);
    expect(hasTile(range, 1, 2)).toBe(false);
    expect(hasTile(range, 3, 2)).toBe(true);
  });

  test('Unit cannot walk through enemy positions (use isBlocked callback)', () => {
    const grid = makeGrid(5, 1);
    const blocked = new Set<string>(['2,0']);
    const isBlocked = (x: number, y: number): boolean => blocked.has(`${x},${y}`);

    const range = getMovementRange(0, 0, 4, grid, isBlocked);

    expect(hasTile(range, 0, 0)).toBe(true);
    expect(hasTile(range, 1, 0)).toBe(true);
    expect(hasTile(range, 3, 0)).toBe(false);
    expect(hasTile(range, 4, 0)).toBe(false);
  });

  test('Forest costs 2 move, hill costs 2 move', () => {
    const grid = makeGrid(5, 3);
    grid[1][1] = 'Forest';
    grid[2][0] = 'Hill';

    const range = getMovementRange(0, 1, 3, grid);

    expect(hasTile(range, 1, 1)).toBe(true);
    expect(hasTile(range, 2, 1)).toBe(true);
    expect(hasTile(range, 3, 1)).toBe(false);
    expect(hasTile(range, 0, 2)).toBe(true);
  });

  test('Correct movement range for cavalry (5 move) on plains', () => {
    const grid = makeGrid(13, 13);
    const range = getMovementRange(6, 6, 5, grid);

    expect(range).toHaveLength(61);
    expect(hasTile(range, 11, 6)).toBe(true);
    expect(hasTile(range, 1, 6)).toBe(true);
  });
});
