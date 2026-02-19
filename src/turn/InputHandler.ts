import Phaser from 'phaser';
import { GridManager } from '../grid/GridManager';

export class InputHandler {
  public onTileClick: ((gridX: number, gridY: number) => void) | null = null;
  public onTileHover: ((gridX: number, gridY: number) => void) | null = null;
  public onRightClick: (() => void) | null = null;

  private enabled = false;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly gridManager: GridManager
  ) {}

  private readonly handlePointerDown = (pointer: Phaser.Input.Pointer): void => {
    if (!this.enabled) {
      return;
    }

    if (pointer.rightButtonDown()) {
      this.onRightClick?.();
      return;
    }

    const { x, y } = this.getGridPosition(pointer);
    if (this.gridManager.isInBounds(x, y)) {
      this.onTileClick?.(x, y);
    }
  };

  private readonly handlePointerMove = (pointer: Phaser.Input.Pointer): void => {
    if (!this.enabled || !this.onTileHover) {
      return;
    }

    const { x, y } = this.getGridPosition(pointer);
    if (this.gridManager.isInBounds(x, y)) {
      this.onTileHover(x, y);
    }
  };

  enable(): void {
    if (this.enabled) {
      return;
    }

    this.enabled = true;
    this.scene.input.mouse?.disableContextMenu();
    this.scene.input.on('pointerdown', this.handlePointerDown);
    this.scene.input.on('pointermove', this.handlePointerMove);
  }

  disable(): void {
    if (!this.enabled) {
      return;
    }

    this.enabled = false;
    this.scene.input.off('pointerdown', this.handlePointerDown);
    this.scene.input.off('pointermove', this.handlePointerMove);
  }

  getGridPosition(pointer: Phaser.Input.Pointer): { x: number; y: number } {
    return this.gridManager.pixelToGrid(pointer.worldX, pointer.worldY);
  }
}
