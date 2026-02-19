import Phaser from 'phaser'
import { GAME_WIDTH, TEAM_COLORS, TERRAIN_COLORS } from '../config'
import { GridManager } from '../grid/GridManager'
import type { UnitData } from '../units/Unit'

export class MinimapOverlay {
  private readonly container: Phaser.GameObjects.Container
  private readonly terrainGraphics: Phaser.GameObjects.Graphics
  private readonly unitGraphics: Phaser.GameObjects.Graphics
  private readonly width = 150
  private readonly height = 100

  constructor(private readonly scene: Phaser.Scene, private readonly gridManager: GridManager) {
    this.container = scene.add.container(GAME_WIDTH - this.width - 8, 8)
    this.container.setDepth(280)

    const background = scene.add.rectangle(0, 0, this.width, this.height, 0x0b0f15, 0.58).setOrigin(0, 0)
    background.setStrokeStyle(1, 0x445579, 0.8)

    this.terrainGraphics = scene.add.graphics()
    this.unitGraphics = scene.add.graphics()

    this.container.add([background, this.terrainGraphics, this.unitGraphics])

    this.drawTerrain()

    scene.input.keyboard?.on('keydown-M', () => {
      this.toggle()
    })
  }

  update(units: UnitData[]): void {
    if (!this.container.visible) {
      return
    }

    const tileWidth = this.width / this.gridManager.cols
    const tileHeight = this.height / this.gridManager.rows

    this.unitGraphics.clear()

    for (const unit of units) {
      if (!unit.isAlive) {
        continue
      }

      const x = unit.gridX * tileWidth + tileWidth / 2
      const y = unit.gridY * tileHeight + tileHeight / 2
      const color = TEAM_COLORS[unit.team]

      this.unitGraphics.fillStyle(color, 1)
      this.unitGraphics.fillCircle(x, y, 2.5)
    }
  }

  toggle(): void {
    this.container.setVisible(!this.container.visible)
  }

  private drawTerrain(): void {
    const tileWidth = this.width / this.gridManager.cols
    const tileHeight = this.height / this.gridManager.rows

    this.terrainGraphics.clear()

    for (let y = 0; y < this.gridManager.rows; y += 1) {
      for (let x = 0; x < this.gridManager.cols; x += 1) {
        const terrain = this.gridManager.getTerrain(x, y)
        this.terrainGraphics.fillStyle(TERRAIN_COLORS[terrain], 0.95)
        this.terrainGraphics.fillRect(x * tileWidth, y * tileHeight, tileWidth, tileHeight)
      }
    }
  }
}
