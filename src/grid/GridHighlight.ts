import Phaser from 'phaser';
import { GridManager } from './GridManager';

interface TileCoord {
  x: number;
  y: number;
}

export class GridHighlight {
  private readonly movementGraphics: Phaser.GameObjects.Graphics;
  private readonly attackGraphics: Phaser.GameObjects.Graphics;
  private readonly abilityGraphics: Phaser.GameObjects.Graphics;
  private readonly hoverGraphics: Phaser.GameObjects.Graphics;

  constructor(private readonly scene: Phaser.Scene, private readonly gridManager: GridManager) {
    this.movementGraphics = scene.add.graphics();
    this.attackGraphics = scene.add.graphics();
    this.abilityGraphics = scene.add.graphics();
    this.hoverGraphics = scene.add.graphics();

    this.movementGraphics.setDepth(5);
    this.attackGraphics.setDepth(6);
    this.abilityGraphics.setDepth(7);
    this.hoverGraphics.setDepth(8);
  }

  showMovementRange(tiles: TileCoord[]): void {
    this.clearMovement();
    this.drawTiles(this.movementGraphics, tiles, 0x3399ff, 0.35);
  }

  showAttackRange(tiles: TileCoord[]): void {
    this.clearAttack();
    this.drawTiles(this.attackGraphics, tiles, 0xff4444, 0.35);
  }

  showAbilityRange(tiles: TileCoord[]): void {
    this.abilityGraphics.clear();
    this.drawTiles(this.abilityGraphics, tiles, 0x44cc66, 0.35);
  }

  showHoverTile(x: number, y: number): void {
    this.hoverGraphics.clear();

    if (!this.gridManager.isInBounds(x, y)) {
      return;
    }

    this.hoverGraphics.lineStyle(2, 0xffffff, 0.9);
    this.hoverGraphics.strokeRect(
      x * this.gridManager.tileSize,
      y * this.gridManager.tileSize,
      this.gridManager.tileSize,
      this.gridManager.tileSize
    );
  }

  clearAll(): void {
    this.movementGraphics.clear();
    this.attackGraphics.clear();
    this.abilityGraphics.clear();
    this.hoverGraphics.clear();
  }

  clearMovement(): void {
    this.movementGraphics.clear();
  }

  clearAttack(): void {
    this.attackGraphics.clear();
  }

  private drawTiles(
    graphics: Phaser.GameObjects.Graphics,
    tiles: TileCoord[],
    color: number,
    alpha: number
  ): void {
    graphics.fillStyle(color, alpha);

    for (const tile of tiles) {
      if (!this.gridManager.isInBounds(tile.x, tile.y)) {
        continue;
      }

      graphics.fillRect(
        tile.x * this.gridManager.tileSize,
        tile.y * this.gridManager.tileSize,
        this.gridManager.tileSize,
        this.gridManager.tileSize
      );
    }
  }
}
