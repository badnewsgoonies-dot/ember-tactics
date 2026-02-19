import Phaser from 'phaser'
import { GAME_HEIGHT, GAME_WIDTH, TILE_SIZE } from '../config'
import type { AbilityDef } from '../combat/AbilitySystem'
import type { UnitData } from '../units/Unit'

export class AbilityMenu {
  public onSelect: ((ability: AbilityDef) => void) | null = null

  private container: Phaser.GameObjects.Container | null = null

  constructor(private readonly scene: Phaser.Scene) {}

  show(unit: UnitData, abilities: AbilityDef[]): void {
    this.hide()

    const panelWidth = 320
    const rowHeight = 58
    const panelHeight = 42 + rowHeight * abilities.length

    const unitX = unit.gridX * TILE_SIZE + TILE_SIZE / 2
    const unitY = unit.gridY * TILE_SIZE + TILE_SIZE / 2
    const panelX = Phaser.Math.Clamp(unitX + 170, panelWidth / 2 + 8, GAME_WIDTH - panelWidth / 2 - 8)
    const panelY = Phaser.Math.Clamp(unitY, panelHeight / 2 + 40, GAME_HEIGHT - panelHeight / 2 - 8)

    const container = this.scene.add.container(0, 0)
    container.setDepth(300)

    const background = this.scene.add
      .rectangle(panelX, panelY, panelWidth, panelHeight, 0x0f131b, 0.92)
      .setStrokeStyle(2, 0x304366, 1)
    container.add(background)

    const title = this.scene.add.text(panelX - panelWidth / 2 + 10, panelY - panelHeight / 2 + 8, `${unit.name} Abilities`, {
      fontFamily: 'Verdana, sans-serif',
      fontSize: '13px',
      color: '#ffe7a3',
      fontStyle: 'bold'
    })
    container.add(title)

    abilities.forEach((ability, index) => {
      const rowY = panelY - panelHeight / 2 + 34 + index * rowHeight + rowHeight / 2
      const cooldownLabel = unit.abilityCD > 0 ? `CD ${unit.abilityCD}` : 'Ready'
      const canUse = unit.mp >= ability.mpCost && unit.abilityCD <= 0

      const row = this.scene.add
        .rectangle(panelX, rowY, panelWidth - 16, rowHeight - 6, canUse ? 0x22314a : 0x2a2a2a, 0.95)
        .setStrokeStyle(1, canUse ? 0x4d658d : 0x555555, 1)

      const label = this.scene.add.text(panelX - panelWidth / 2 + 14, rowY - 20, '', {
        fontFamily: 'Verdana, sans-serif',
        fontSize: '11px',
        color: canUse ? '#ffffff' : '#999999',
        wordWrap: { width: panelWidth - 32 }
      })
      label.setText(
        `${ability.name}  MP ${ability.mpCost}  R ${ability.range}  ${cooldownLabel}\n${ability.description}`
      )

      if (canUse) {
        row.setInteractive({ useHandCursor: true })
        row.on('pointerover', () => row.setFillStyle(0x2f4568, 1))
        row.on('pointerout', () => row.setFillStyle(0x22314a, 0.95))
        row.on('pointerdown', () => {
          this.hide()
          this.onSelect?.(ability)
        })
      }

      container.add([row, label])
    })

    this.container = container
  }

  hide(): void {
    if (!this.container) {
      return
    }

    this.container.destroy(true)
    this.container = null
  }
}
