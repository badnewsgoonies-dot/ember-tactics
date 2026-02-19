import Phaser from 'phaser'
import { GAME_HEIGHT, GAME_WIDTH } from '../config'

export class ScreenEffects {
  constructor(private readonly scene: Phaser.Scene) {}

  screenShake(intensity = 0.005, duration = 120): void {
    this.scene.cameras.main.shake(duration, intensity)
  }

  flashWhite(duration = 110): void {
    this.scene.cameras.main.flash(duration, 255, 255, 255)
  }

  dimScreen(duration = 260): Promise<void> {
    return new Promise((resolve) => {
      const overlay = this.scene.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0)
      overlay.setOrigin(0, 0)
      overlay.setDepth(900)

      this.scene.tweens.chain({
        targets: overlay,
        tweens: [
          { alpha: 0.5, duration: duration / 2, ease: 'Sine.easeOut' },
          { alpha: 0, duration: duration / 2, ease: 'Sine.easeIn' }
        ],
        onComplete: () => {
          overlay.destroy()
          resolve()
        }
      })
    })
  }

  fadeToBlack(duration = 450): Promise<void> {
    const camera = this.scene.cameras.main
    return new Promise((resolve) => {
      camera.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => resolve())
      camera.fadeOut(duration, 0, 0, 0)
    })
  }

  fadeFromBlack(duration = 450): Promise<void> {
    const camera = this.scene.cameras.main
    return new Promise((resolve) => {
      camera.once(Phaser.Cameras.Scene2D.Events.FADE_IN_COMPLETE, () => resolve())
      camera.fadeIn(duration, 0, 0, 0)
    })
  }
}
