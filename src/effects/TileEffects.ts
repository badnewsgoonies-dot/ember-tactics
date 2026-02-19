import Phaser from 'phaser'
import { GridManager } from '../grid/GridManager'

export class TileEffects {
  constructor(private readonly scene: Phaser.Scene, private readonly gridManager: GridManager) {}

  addForestLeaves(gridX: number, gridY: number): void {
    const texture = this.ensureCircleTexture('tile_leaf_particle', 0x7bc96f, 3)
    const pixel = this.gridManager.gridToPixel(gridX, gridY)

    const emitter = this.scene.add.particles(pixel.x, pixel.y, texture, {
      x: { min: pixel.x - 24, max: pixel.x + 24 },
      y: { min: pixel.y - 20, max: pixel.y + 20 },
      speedY: { min: 8, max: 20 },
      speedX: { min: -12, max: 12 },
      lifespan: 1600,
      alpha: { start: 0.35, end: 0 },
      scale: { start: 0.35, end: 0.1 },
      quantity: 1,
      frequency: 900
    })
    emitter.setDepth(6)
  }

  addWaterRipple(gridX: number, gridY: number): void {
    const pixel = this.gridManager.gridToPixel(gridX, gridY)
    const ripple = this.scene.add.circle(pixel.x, pixel.y, 10, 0x77c8ff, 0.2).setDepth(6)
    ripple.setStrokeStyle(1, 0xb9e7ff, 0.45)

    this.scene.tweens.add({
      targets: ripple,
      scaleX: 1.6,
      scaleY: 1.6,
      alpha: 0,
      duration: 1200,
      ease: 'Sine.easeOut',
      repeat: -1,
      repeatDelay: 250,
      yoyo: false,
      onRepeat: () => {
        ripple.setScale(1)
        ripple.setAlpha(0.2)
      }
    })
  }

  addFortFlag(gridX: number, gridY: number): void {
    const pixel = this.gridManager.gridToPixel(gridX, gridY)
    const pole = this.scene.add.rectangle(pixel.x + 18, pixel.y - 10, 2, 20, 0x5d452a, 1).setDepth(7)
    const flag = this.scene.add
      .triangle(pixel.x + 23, pixel.y - 14, 0, 0, 12, 4, 0, 8, 0xcb2f2f, 1)
      .setOrigin(0, 0)
      .setDepth(7)

    this.scene.tweens.add({
      targets: flag,
      scaleY: 1.08,
      angle: 5,
      duration: 380,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    pole.setAlpha(0.92)
  }

  addFireFlicker(gridX: number, gridY: number): void {
    const pixel = this.gridManager.gridToPixel(gridX, gridY)
    const glow = this.scene.add.circle(pixel.x, pixel.y, 14, 0xff9538, 0.32).setDepth(6)

    this.scene.tweens.add({
      targets: glow,
      alpha: { from: 0.22, to: 0.45 },
      scaleX: { from: 0.9, to: 1.2 },
      scaleY: { from: 0.9, to: 1.2 },
      duration: 220,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })
  }

  initAllEffects(): void {
    for (let y = 0; y < this.gridManager.rows; y += 1) {
      for (let x = 0; x < this.gridManager.cols; x += 1) {
        const terrain = this.gridManager.getTerrain(x, y)

        if (terrain === 'Forest') {
          this.addForestLeaves(x, y)
          continue
        }

        if (terrain === 'Water') {
          this.addWaterRipple(x, y)
          continue
        }

        if (terrain === 'Fort') {
          this.addFortFlag(x, y)
          continue
        }

        if (terrain === 'Fire') {
          this.addFireFlicker(x, y)
        }
      }
    }
  }

  private ensureCircleTexture(key: string, color: number, radius: number): string {
    if (this.scene.textures.exists(key)) {
      return key
    }

    const graphics = this.scene.add.graphics()
    graphics.fillStyle(color, 1)
    graphics.fillCircle(radius, radius, radius)
    graphics.generateTexture(key, radius * 2, radius * 2)
    graphics.destroy()

    return key
  }
}
