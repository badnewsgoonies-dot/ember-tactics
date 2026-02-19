import Phaser from 'phaser';
import { TERRAIN_COLORS } from '../config';
import { darken, lighten } from '../utils/ColorUtils';
import { GridManager } from './GridManager';
import type { TerrainType } from './TileTypes';

const TERRAIN_TYPES: TerrainType[] = [
  'Plains',
  'Forest',
  'Hill',
  'Water',
  'Mountain',
  'Fort',
  'Bridge',
  'Fire'
];

export class GridRenderer {
  private readonly tileLayer: Phaser.GameObjects.Layer;
  private readonly gridLines: Phaser.GameObjects.Graphics;

  constructor(private readonly scene: Phaser.Scene, private readonly gridManager: GridManager) {
    this.tileLayer = scene.add.layer();
    this.gridLines = scene.add.graphics();
    this.tileLayer.setDepth(0);
    this.gridLines.setDepth(1);
  }

  renderGrid(): void {
    for (const terrain of TERRAIN_TYPES) {
      this.ensureTerrainTexture(terrain);
    }

    this.tileLayer.removeAll(true);

    for (let y = 0; y < this.gridManager.rows; y += 1) {
      for (let x = 0; x < this.gridManager.cols; x += 1) {
        const terrain = this.gridManager.getTerrain(x, y);
        const key = this.getTerrainTextureKey(terrain);
        const pos = this.gridManager.gridToPixel(x, y);

        const tile = this.scene.add.image(pos.x, pos.y, key);
        tile.setDisplaySize(this.gridManager.tileSize, this.gridManager.tileSize);
        this.tileLayer.add(tile);
      }
    }

    this.gridLines.clear();
    this.gridLines.lineStyle(1, 0x111111, 0.35);

    for (let x = 0; x <= this.gridManager.cols; x += 1) {
      this.gridLines.beginPath();
      this.gridLines.moveTo(x * this.gridManager.tileSize, 0);
      this.gridLines.lineTo(x * this.gridManager.tileSize, this.gridManager.rows * this.gridManager.tileSize);
      this.gridLines.strokePath();
    }

    for (let y = 0; y <= this.gridManager.rows; y += 1) {
      this.gridLines.beginPath();
      this.gridLines.moveTo(0, y * this.gridManager.tileSize);
      this.gridLines.lineTo(this.gridManager.cols * this.gridManager.tileSize, y * this.gridManager.tileSize);
      this.gridLines.strokePath();
    }
  }

  private getTerrainTextureKey(terrain: TerrainType): string {
    return `grid_terrain_${terrain.toLowerCase()}`;
  }

  private ensureTerrainTexture(terrain: TerrainType): void {
    const key = this.getTerrainTextureKey(terrain);
    if (this.scene.textures.exists(key)) {
      return;
    }

    const size = this.gridManager.tileSize;
    const baseColor = TERRAIN_COLORS[terrain];
    const graphics = this.scene.add.graphics();

    graphics.fillStyle(baseColor, 1);
    graphics.fillRect(0, 0, size, size);

    switch (terrain) {
      case 'Forest': {
        graphics.fillStyle(darken(baseColor, 0.35), 0.65);
        const dots = [
          [12, 10],
          [24, 14],
          [41, 11],
          [16, 28],
          [33, 24],
          [49, 27],
          [10, 45],
          [27, 43],
          [43, 47]
        ];
        dots.forEach(([x, y]) => graphics.fillCircle(x, y, 3));
        break;
      }
      case 'Hill': {
        graphics.lineStyle(2, darken(baseColor, 0.28), 0.65);
        graphics.strokeEllipse(size * 0.3, size * 0.55, size * 0.45, size * 0.28);
        graphics.strokeEllipse(size * 0.55, size * 0.45, size * 0.55, size * 0.35);
        graphics.strokeEllipse(size * 0.7, size * 0.35, size * 0.42, size * 0.25);
        break;
      }
      case 'Water': {
        graphics.lineStyle(2, lighten(baseColor, 0.25), 0.7);
        for (let y = 12; y <= 52; y += 13) {
          graphics.beginPath();
          graphics.moveTo(6, y);
          graphics.lineTo(18, y - 3);
          graphics.lineTo(30, y + 2);
          graphics.lineTo(42, y - 2);
          graphics.lineTo(58, y + 3);
          graphics.strokePath();
        }
        break;
      }
      case 'Fort': {
        graphics.fillStyle(darken(baseColor, 0.22), 0.9);
        graphics.fillRect(12, 28, 40, 24);
        graphics.fillRect(20, 20, 8, 8);
        graphics.fillRect(36, 20, 8, 8);

        graphics.fillStyle(0x6b4f2a, 1);
        graphics.fillRect(30, 10, 2, 18);
        graphics.fillStyle(0xcc2222, 1);
        graphics.beginPath();
        graphics.moveTo(32, 10);
        graphics.lineTo(45, 14);
        graphics.lineTo(32, 18);
        graphics.closePath();
        graphics.fillPath();
        break;
      }
      case 'Fire': {
        graphics.fillStyle(0xffaa33, 0.65);
        const sparks = [
          [12, 18],
          [21, 10],
          [30, 22],
          [40, 15],
          [50, 24],
          [17, 38],
          [29, 42],
          [41, 34],
          [52, 44]
        ];
        sparks.forEach(([x, y]) => graphics.fillCircle(x, y, 2));
        break;
      }
      default:
        break;
    }

    graphics.generateTexture(key, size, size);
    graphics.destroy();
  }
}
