import Phaser from 'phaser'

export class ProjectileRenderer {
  constructor(private readonly scene: Phaser.Scene) {}

  fireArrow(fromX: number, fromY: number, toX: number, toY: number): Promise<void> {
    const texture = this.ensureArrowTexture()
    const arrow = this.scene.add.image(fromX, fromY, texture).setDepth(150)
    arrow.setScale(0.75)
    arrow.setRotation(Phaser.Math.Angle.Between(fromX, fromY, toX, toY))

    return this.tweenArc(arrow, fromX, fromY, toX, toY, 26, 260)
  }

  fireFireball(fromX: number, fromY: number, toX: number, toY: number): Promise<void> {
    const texture = this.ensureCircleTexture('projectile_fireball', 0xff7a2e, 8)
    const fireball = this.scene.add.image(fromX, fromY, texture).setDepth(150)

    return new Promise((resolve) => {
      this.scene.tweens.addCounter({
        from: 0,
        to: 1,
        duration: 300,
        ease: 'Sine.easeInOut',
        onUpdate: (tween) => {
          const t = tween.getValue() ?? 0
          fireball.x = Phaser.Math.Linear(fromX, toX, t)
          fireball.y = Phaser.Math.Linear(fromY, toY, t) - Math.sin(t * Math.PI) * 14

          if (Math.random() > 0.35) {
            const trail = this.scene.add.circle(fireball.x, fireball.y, 3, 0xff9a3d, 0.8).setDepth(145)
            this.scene.tweens.add({
              targets: trail,
              alpha: 0,
              scale: 0.2,
              duration: 180,
              onComplete: () => trail.destroy()
            })
          }
        },
        onComplete: () => {
          fireball.destroy()
          resolve()
        }
      })
    })
  }

  fireHealBeam(fromX: number, fromY: number, toX: number, toY: number): Promise<void> {
    return new Promise((resolve) => {
      const beam = this.scene.add.line(0, 0, fromX, fromY, toX, toY, 0x66ff9e, 0.95).setOrigin(0, 0).setDepth(145)
      beam.setLineWidth(3, 3)

      this.scene.tweens.add({
        targets: beam,
        alpha: 0.25,
        duration: 120,
        yoyo: true,
        repeat: 2,
        onComplete: () => {
          beam.destroy()
          resolve()
        }
      })
    })
  }

  fireLightning(fromX: number, fromY: number, toX: number, toY: number): Promise<void> {
    return new Promise((resolve) => {
      const graphics = this.scene.add.graphics()
      graphics.setDepth(152)

      const points = this.buildLightningPoints(fromX, fromY, toX, toY)
      graphics.lineStyle(3, 0xfff27a, 1)
      graphics.beginPath()
      graphics.moveTo(points[0].x, points[0].y)
      for (let i = 1; i < points.length; i += 1) {
        graphics.lineTo(points[i].x, points[i].y)
      }
      graphics.strokePath()

      this.scene.tweens.add({
        targets: graphics,
        alpha: 0,
        duration: 170,
        yoyo: true,
        repeat: 1,
        onComplete: () => {
          graphics.destroy()
          resolve()
        }
      })
    })
  }

  private tweenArc(
    sprite: Phaser.GameObjects.Image,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    arcHeight: number,
    duration: number
  ): Promise<void> {
    return new Promise((resolve) => {
      this.scene.tweens.addCounter({
        from: 0,
        to: 1,
        duration,
        ease: 'Quad.easeOut',
        onUpdate: (tween) => {
          const t = tween.getValue() ?? 0
          sprite.x = Phaser.Math.Linear(fromX, toX, t)
          sprite.y = Phaser.Math.Linear(fromY, toY, t) - Math.sin(t * Math.PI) * arcHeight
        },
        onComplete: () => {
          sprite.destroy()
          resolve()
        }
      })
    })
  }

  private buildLightningPoints(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number
  ): Array<{ x: number; y: number }> {
    const segments = 6
    const points: Array<{ x: number; y: number }> = []

    for (let i = 0; i <= segments; i += 1) {
      const t = i / segments
      const baseX = Phaser.Math.Linear(fromX, toX, t)
      const baseY = Phaser.Math.Linear(fromY, toY, t)
      const offset = i === 0 || i === segments ? 0 : Phaser.Math.Between(-14, 14)
      points.push({ x: baseX + offset, y: baseY + Phaser.Math.Between(-8, 8) })
    }

    return points
  }

  private ensureArrowTexture(): string {
    const key = 'projectile_arrow'
    if (this.scene.textures.exists(key)) {
      return key
    }

    const graphics = this.scene.add.graphics()
    graphics.fillStyle(0xd6d6d6, 1)
    graphics.beginPath()
    graphics.moveTo(2, 5)
    graphics.lineTo(16, 8)
    graphics.lineTo(2, 11)
    graphics.closePath()
    graphics.fillPath()
    graphics.generateTexture(key, 18, 16)
    graphics.destroy()

    return key
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
