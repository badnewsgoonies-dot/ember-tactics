import { findPath, getAttackRange } from '../grid/Pathfinding';
import { getMoveCost, type TerrainType } from '../grid/TileTypes';

function hasPoint(points: Array<{ x: number; y: number }>, x: number, y: number): boolean {
  return points.some((point) => point.x === x && point.y === y);
}

describe('findPath', () => {
  test('Direct path across open plains', () => {
    const grid: TerrainType[][] = [['Plains', 'Plains', 'Plains', 'Plains']];
    const path = findPath(0, 0, 3, 0, grid, getMoveCost);

    expect(path.map((node) => [node.x, node.y])).toEqual([
      [0, 0],
      [1, 0],
      [2, 0],
      [3, 0]
    ]);
    expect(path[path.length - 1]?.cost).toBe(3);
  });

  test('Path around water obstacle', () => {
    const grid: TerrainType[][] = [
      ['Plains', 'Plains', 'Plains', 'Plains', 'Plains'],
      ['Plains', 'Plains', 'Water', 'Plains', 'Plains'],
      ['Plains', 'Plains', 'Plains', 'Plains', 'Plains']
    ];

    const path = findPath(0, 1, 4, 1, grid, getMoveCost);

    expect(path.length).toBeGreaterThan(0);
    expect(path[path.length - 1]).toMatchObject({ x: 4, y: 1 });
    expect(hasPoint(path, 2, 1)).toBe(false);
  });

  test('No path to surrounded tile', () => {
    const grid: TerrainType[][] = [
      ['Plains', 'Water', 'Plains'],
      ['Water', 'Plains', 'Water'],
      ['Plains', 'Water', 'Plains']
    ];

    const path = findPath(0, 0, 1, 1, grid, getMoveCost);
    expect(path).toEqual([]);
  });

  test('Path cost accounts for forest (cost 2)', () => {
    const grid: TerrainType[][] = [['Plains', 'Forest', 'Plains']];
    const path = findPath(0, 0, 2, 0, grid, getMoveCost);

    expect(path.length).toBe(3);
    expect(path[path.length - 1]?.cost).toBe(3);
  });

  test('Path through bridge over water', () => {
    const grid: TerrainType[][] = [
      ['Water', 'Plains', 'Water'],
      ['Water', 'Bridge', 'Water'],
      ['Water', 'Plains', 'Water']
    ];

    const path = findPath(1, 0, 1, 2, grid, getMoveCost);

    expect(path.map((node) => [node.x, node.y])).toEqual([
      [1, 0],
      [1, 1],
      [1, 2]
    ]);
  });
});

describe('getAttackRange', () => {
  test('getAttackRange returns correct tiles for range 2-3', () => {
    const attackTiles = getAttackRange([{ x: 3, y: 3 }], 2, 3, 7, 7);

    expect(hasPoint(attackTiles, 5, 3)).toBe(true);
    expect(hasPoint(attackTiles, 6, 3)).toBe(true);
    expect(hasPoint(attackTiles, 4, 3)).toBe(false);

    for (const tile of attackTiles) {
      const distance = Math.abs(tile.x - 3) + Math.abs(tile.y - 3);
      expect(distance).toBeGreaterThanOrEqual(2);
      expect(distance).toBeLessThanOrEqual(3);
    }
  });

  test('getAttackRange excludes out-of-bounds tiles', () => {
    const attackTiles = getAttackRange([{ x: 0, y: 0 }], 1, 2, 3, 3);

    expect(attackTiles).toHaveLength(5);
    expect(attackTiles.every((tile) => tile.x >= 0 && tile.y >= 0 && tile.x < 3 && tile.y < 3)).toBe(
      true
    );
  });
});
