import Phaser from 'phaser'
import { TERRAIN_COLORS } from '../config'
import { getDefenseBonus, getEvasionBonus } from '../grid/TerrainEffects'
import type { TerrainType } from '../grid/TileTypes'
import { getTerrainData } from '../grid/TileTypes'

export class TerrainInfoPanel {
  private readonly container: Phaser.GameObjects.Container
  private readonly nameText: Phaser.GameObjects.Text
  private readonly detailsText: Phaser.GameObjects.Text

  constructor(private readonly scene: Phaser.Scene) {
    this.container = scene.add.container(800, 560)
    this.container.setDepth(250)
    this.container.setVisible(false)

    const background = scene.add.rectangle(0, 0, 160, 80, 0x0f131c, 0.82).setOrigin(0, 0)
    background.setStrokeStyle(1, 0x314361, 1)

    this.nameText = scene.add.text(8, 8, '', {
      fontFamily: 'Verdana, sans-serif',
      fontSize: '13px',
      color: '#ffffff',
      fontStyle: 'bold'
    })

    this.detailsText = scene.add.text(8, 28, '', {
      fontFamily: 'Verdana, sans-serif',
      fontSize: '11px',
      color: '#dce5f4'
    })

    this.container.add([background, this.nameText, this.detailsText])
  }

  show(terrain: TerrainType, gridX: number, gridY: number): void {
    const terrainData = getTerrainData(terrain)
    const defBonus = getDefenseBonus(terrain)
    const evaBonus = getEvasionBonus(terrain)

    this.nameText.setText(`${terrain} (${gridX},${gridY})`)
    this.nameText.setColor(`#${TERRAIN_COLORS[terrain].toString(16).padStart(6, '0')}`)

    const moveCost = Number.isFinite(terrainData.moveCost) ? terrainData.moveCost.toString() : 'Blocked'
    this.detailsText.setText(
      `Move: ${moveCost}\nDEF: +${defBonus}\nEVA: +${Math.round(evaBonus * 100)}%`
    )

    this.container.setVisible(true)
  }

  hide(): void {
    this.container.setVisible(false)
  }
}
