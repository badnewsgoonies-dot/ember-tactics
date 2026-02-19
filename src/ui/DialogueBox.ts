import Phaser from 'phaser'
import { GAME_HEIGHT, GAME_WIDTH } from '../config'

export class DialogueBox {
  private readonly container: Phaser.GameObjects.Container
  private readonly portraitBox: Phaser.GameObjects.Rectangle
  private readonly speakerText: Phaser.GameObjects.Text
  private readonly bodyText: Phaser.GameObjects.Text
  private readonly spaceKey: Phaser.Input.Keyboard.Key | null

  private fullText = ''
  private textIndex = 0
  private isTyping = false
  private visible = false
  private typingEvent: Phaser.Time.TimerEvent | null = null
  private onComplete: (() => void) | null = null

  constructor(private readonly scene: Phaser.Scene) {
    this.container = scene.add.container(0, 0)
    this.container.setDepth(500)
    this.container.setVisible(false)

    const background = scene.add
      .rectangle(0, GAME_HEIGHT - 120, GAME_WIDTH, 120, 0x0a0d13, 0.88)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0x2a3854, 1)

    this.portraitBox = scene.add
      .rectangle(20, GAME_HEIGHT - 100, 80, 80, 0x6b6b6b, 1)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0x101010, 1)

    this.speakerText = scene.add.text(120, GAME_HEIGHT - 106, '', {
      fontFamily: 'Verdana, sans-serif',
      fontSize: '16px',
      color: '#f2d27a',
      fontStyle: 'bold'
    })

    this.bodyText = scene.add.text(120, GAME_HEIGHT - 78, '', {
      fontFamily: 'Verdana, sans-serif',
      fontSize: '15px',
      color: '#ffffff',
      wordWrap: { width: GAME_WIDTH - 140 }
    })

    this.container.add([background, this.portraitBox, this.speakerText, this.bodyText])

    scene.input.on('pointerdown', this.handleAdvance, this)
    this.spaceKey = scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE) ?? null
    this.spaceKey?.on('down', this.handleAdvance, this)

    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      scene.input.off('pointerdown', this.handleAdvance, this)
      this.spaceKey?.off('down', this.handleAdvance, this)
    })
  }

  show(speaker: string, portrait: string, text: string, onComplete?: () => void): void {
    this.clearTypingEvent()

    this.visible = true
    this.isTyping = true
    this.textIndex = 0
    this.fullText = text
    this.onComplete = onComplete ?? null

    this.speakerText.setText(speaker)
    this.bodyText.setText('')
    this.portraitBox.setFillStyle(this.getPortraitColor(speaker, portrait), 1)
    this.container.setVisible(true)

    this.typingEvent = this.scene.time.addEvent({
      delay: 20,
      loop: true,
      callback: () => {
        if (!this.isTyping) {
          return
        }

        this.textIndex += 1
        this.bodyText.setText(this.fullText.slice(0, this.textIndex))

        if (this.textIndex >= this.fullText.length) {
          this.finishTyping()
        }
      }
    })
  }

  hide(): void {
    this.clearTypingEvent()
    this.visible = false
    this.isTyping = false
    this.onComplete = null
    this.container.setVisible(false)
  }

  isVisible(): boolean {
    return this.visible
  }

  private readonly handleAdvance = (): void => {
    if (!this.visible) {
      return
    }

    if (this.isTyping) {
      this.bodyText.setText(this.fullText)
      this.finishTyping()
      return
    }

    const callback = this.onComplete
    this.onComplete = null
    callback?.()
  }

  private finishTyping(): void {
    this.isTyping = false
    this.clearTypingEvent()
  }

  private clearTypingEvent(): void {
    if (!this.typingEvent) {
      return
    }

    this.typingEvent.destroy()
    this.typingEvent = null
  }

  private getPortraitColor(speaker: string, portrait: string): number {
    const key = `${speaker} ${portrait}`.toLowerCase()

    if (key.includes('knight') || key.includes('aldric')) {
      return 0x7087c8
    }

    if (key.includes('archer') || key.includes('lyra')) {
      return 0x6a9e5f
    }

    if (key.includes('mage') || key.includes('seren')) {
      return 0xa069cc
    }

    if (key.includes('healer') || key.includes('mira')) {
      return 0x6fa8a1
    }

    if (key.includes('thief') || key.includes('shade')) {
      return 0x777777
    }

    return 0x8c6c53
  }
}
