import type { TerrainType } from './TileTypes';
import { gridToPixel as convertGridToPixel, pixelToGrid as convertPixelToGrid } from '../utils/MathUtils';

export class GridManager {
  public grid: TerrainType[][];

  constructor(
    public readonly cols: number,
    public readonly rows: number,
    public readonly tileSize: number
  ) {
    this.grid = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => 'Plains' as TerrainType)
    );
  }

  setTerrain(x: number, y: number, terrain: TerrainType): void {
    if (!this.isInBounds(x, y)) {
      return;
    }

    this.grid[y][x] = terrain;
  }

  getTerrain(x: number, y: number): TerrainType {
    if (!this.isInBounds(x, y)) {
      return 'Mountain';
    }

    return this.grid[y][x];
  }

  isInBounds(x: number, y: number): boolean {
    return x >= 0 && x < this.cols && y >= 0 && y < this.rows;
  }

  gridToPixel(x: number, y: number): { x: number; y: number } {
    return convertGridToPixel(x, y, this.tileSize);
  }

  pixelToGrid(px: number, py: number): { x: number; y: number } {
    return convertPixelToGrid(px, py, this.tileSize);
  }

  loadMap(mapData: TerrainType[][]): void {
    for (let y = 0; y < this.rows; y += 1) {
      for (let x = 0; x < this.cols; x += 1) {
        this.grid[y][x] = mapData[y]?.[x] ?? 'Plains';
      }
    }
  }
}
