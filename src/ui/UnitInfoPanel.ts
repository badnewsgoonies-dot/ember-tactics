import Phaser from 'phaser'
import type { UnitData } from '../units/Unit'

export class UnitInfoPanel {
  private readonly container: Phaser.GameObjects.Container
  private readonly nameText: Phaser.GameObjects.Text
  private readonly classTeamText: Phaser.GameObjects.Text
  private readonly hpText: Phaser.GameObjects.Text
  private readonly hpFill: Phaser.GameObjects.Rectangle
  private readonly statsText: Phaser.GameObjects.Text
  private readonly abilitiesText: Phaser.GameObjects.Text
  private readonly statusText: Phaser.GameObjects.Text

  constructor(private readonly scene: Phaser.Scene) {
    this.container = scene.add.container(0, 480)
    this.container.setDepth(250)
    this.container.setVisible(false)

    const background = scene.add.rectangle(0, 0, 200, 160, 0x0f131c, 0.82).setOrigin(0, 0)
    background.setStrokeStyle(1, 0x2e3b58, 1)

    this.nameText = scene.add.text(8, 8, '', {
      fontFamily: 'Verdana, sans-serif',
      fontSize: '14px',
      color: '#ffffff',
      fontStyle: 'bold'
    })

    this.classTeamText = scene.add.text(8, 28, '', {
      fontFamily: 'Verdana, sans-serif',
      fontSize: '12px',
      color: '#d5def0'
    })

    this.hpText = scene.add.text(8, 50, '', {
      fontFamily: 'Verdana, sans-serif',
      fontSize: '12px',
      color: '#ffffff'
    })

    const hpBg = scene.add.rectangle(8, 70, 184, 10, 0x2a2d32, 1).setOrigin(0, 0)
    this.hpFill = scene.add.rectangle(8, 70, 184, 10, 0xd74f4f, 1).setOrigin(0, 0)

    this.statsText = scene.add.text(8, 86, '', {
      fontFamily: 'Verdana, sans-serif',
      fontSize: '11px',
      color: '#d7dced'
    })

    this.abilitiesText = scene.add.text(8, 114, '', {
      fontFamily: 'Verdana, sans-serif',
      fontSize: '11px',
      color: '#ffe9aa',
      wordWrap: { width: 184 }
    })

    this.statusText = scene.add.text(8, 138, '', {
      fontFamily: 'Verdana, sans-serif',
      fontSize: '10px',
      color: '#c6d2e8',
      wordWrap: { width: 184 }
    })

    this.container.add([
      background,
      this.nameText,
      this.classTeamText,
      this.hpText,
      hpBg,
      this.hpFill,
      this.statsText,
      this.abilitiesText,
      this.statusText
    ])
  }

  show(unit: UnitData): void {
    const hpRatio = unit.maxHp <= 0 ? 0 : Phaser.Math.Clamp(unit.currentHp / unit.maxHp, 0, 1)
    this.nameText.setText(unit.name)
    this.classTeamText.setText(`Class: ${unit.unitClass}   Lvl: ${unit.level}   Team: ${unit.team.toUpperCase()}`)
    this.hpText.setText(`HP ${unit.currentHp}/${unit.maxHp}`)
    this.hpFill.setDisplaySize(Math.max(0, 184 * hpRatio), 10)
    this.hpFill.setVisible(hpRatio > 0)

    this.statsText.setText(`ATK ${unit.atk}   DEF ${unit.def}   SPD ${unit.spd}   EVA ${Math.round(unit.eva * 100)}%`)

    const cooldownLabel = unit.abilityCD > 0 ? `CD ${unit.abilityCD}` : 'Ready'
    this.abilitiesText.setText(`Ability: ${unit.ability} (${cooldownLabel})`)

    const activeStatuses = unit.statusEffects
      .filter((status) => status.turnsRemaining > 0)
      .map((status) => `${status.type}(${status.turnsRemaining})`)

    this.statusText.setText(`Status: ${activeStatuses.length > 0 ? activeStatuses.join(', ') : 'None'}`)

    this.container.setVisible(true)
  }

  hide(): void {
    this.container.setVisible(false)
  }
}
