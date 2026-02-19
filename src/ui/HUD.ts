import Phaser from 'phaser'
import { GAME_WIDTH } from '../config'

export class HUD {
  public readonly container: Phaser.GameObjects.Container
  public readonly levelNameText: Phaser.GameObjects.Text
  public readonly turnCountText: Phaser.GameObjects.Text
  public readonly objectiveText: Phaser.GameObjects.Text

  constructor(private readonly scene: Phaser.Scene) {
    this.container = scene.add.container(0, 0)
    this.container.setDepth(280)

    const background = scene.add.rectangle(0, 0, GAME_WIDTH, 32, 0x0d111a, 0.78).setOrigin(0, 0)

    this.levelNameText = scene.add.text(8, 16, 'Level', {
      fontFamily: 'Verdana, sans-serif',
      fontSize: '14px',
      color: '#ffffff'
    })
    this.levelNameText.setOrigin(0, 0.5)

    this.turnCountText = scene.add.text(GAME_WIDTH / 2, 16, 'Turn 1', {
      fontFamily: 'Verdana, sans-serif',
      fontSize: '14px',
      color: '#f2d27a',
      fontStyle: 'bold'
    })
    this.turnCountText.setOrigin(0.5, 0.5)

    this.objectiveText = scene.add.text(GAME_WIDTH - 8, 16, 'Objective', {
      fontFamily: 'Verdana, sans-serif',
      fontSize: '14px',
      color: '#ffffff'
    })
    this.objectiveText.setOrigin(1, 0.5)

    this.container.add([background, this.levelNameText, this.turnCountText, this.objectiveText])
  }

  update(levelName: string, turnNumber: number, objectiveText: string): void {
    this.levelNameText.setText(levelName)
    this.turnCountText.setText(`Turn ${turnNumber}`)
    this.objectiveText.setText(objectiveText)
  }
}
