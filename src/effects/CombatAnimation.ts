import Phaser from 'phaser'
import type { CombatResult } from '../combat/DamageCalculation'
import { ParticleManager } from './ParticleManager'
import { ScreenEffects } from './ScreenEffects'

export class CombatAnimation {
  constructor(
    private readonly scene: Phaser.Scene,
    private readonly particles: ParticleManager,
    private readonly screenEffects: ScreenEffects
  ) {}

  async playAttackSequence(
    attackerSprite: Phaser.GameObjects.Sprite,
    defenderSprite: Phaser.GameObjects.Sprite,
    result: CombatResult
  ): Promise<void> {
    if (!attackerSprite.active || !defenderSprite.active) {
      return
    }

    const origin = { x: attackerSprite.x, y: attackerSprite.y }
    const dx = defenderSprite.x - attackerSprite.x
    const dy = defenderSprite.y - attackerSprite.y
    const lungeX = attackerSprite.x + dx * 0.6
    const lungeY = attackerSprite.y + dy * 0.6

    await this.tweenTo(attackerSprite, lungeX, lungeY, 130)
    await this.delay(100)

    if (result.hit) {
      this.screenEffects.screenShake(0.004, 110)
      if (result.crit) {
        this.screenEffects.flashWhite(120)
      }

      this.particles.fireExplosion(defenderSprite.x, defenderSprite.y)
      defenderSprite.setTintFill(0xff5f5f)
      await this.delay(100)
      if (defenderSprite.active) {
        defenderSprite.clearTint()
      }
    } else {
      const whoosh = this.scene.add
        .text((attackerSprite.x + defenderSprite.x) / 2, (attackerSprite.y + defenderSprite.y) / 2 - 10, 'WHOOSH', {
          fontFamily: 'Verdana, sans-serif',
          fontSize: '14px',
          color: '#d6d6d6',
          fontStyle: 'bold',
          stroke: '#101010',
          strokeThickness: 2
        })
        .setOrigin(0.5)
        .setDepth(240)

      this.scene.tweens.add({
        targets: whoosh,
        y: whoosh.y - 14,
        alpha: 0,
        duration: 220,
        onComplete: () => whoosh.destroy()
      })
    }

    if (attackerSprite.active) {
      await this.tweenTo(attackerSprite, origin.x, origin.y, 150)
    }
  }

  async playHealSequence(
    healerSprite: Phaser.GameObjects.Sprite,
    targetSprite: Phaser.GameObjects.Sprite
  ): Promise<void> {
    if (!targetSprite.active) {
      return
    }

    this.particles.healEffect(targetSprite.x, targetSprite.y)

    const baseScaleX = targetSprite.scaleX
    const baseScaleY = targetSprite.scaleY
    targetSprite.setTint(0x7bff9e)

    await new Promise<void>((resolve) => {
      this.scene.tweens.add({
        targets: targetSprite,
        scaleX: baseScaleX * 1.08,
        scaleY: baseScaleY * 1.08,
        duration: 130,
        yoyo: true,
        repeat: 1,
        ease: 'Sine.easeInOut',
        onComplete: () => {
          if (targetSprite.active) {
            targetSprite.clearTint()
            targetSprite.setScale(baseScaleX, baseScaleY)
          }
          resolve()
        }
      })
    })

    if (healerSprite.active) {
      healerSprite.clearTint()
    }
  }

  private tweenTo(target: Phaser.GameObjects.Sprite, x: number, y: number, duration: number): Promise<void> {
    return new Promise((resolve) => {
      this.scene.tweens.add({
        targets: target,
        x,
        y,
        duration,
        ease: 'Quad.easeOut',
        onComplete: () => resolve()
      })
    })
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
      this.scene.time.delayedCall(ms, () => resolve())
    })
  }
}
