import Phaser from 'phaser'

export class ParticleManager {
  constructor(private readonly scene: Phaser.Scene) {}

  fireExplosion(x: number, y: number): void {
    const texture = this.resolveTexture('particle_fire', 'particle_fallback_fire', 0xff7a33, 8)
    const emitter = this.scene.add.particles(x, y, texture, {
      speed: { min: 80, max: 220 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.7, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 500,
      quantity: 24,
      blendMode: 'ADD'
    })
    emitter.setDepth(170)
    this.scene.time.delayedCall(520, () => emitter.destroy())
  }

  iceEffect(x: number, y: number): void {
    const texture = this.resolveTexture('particle_ice', 'particle_fallback_ice', 0x75efff, 6)
    const emitter = this.scene.add.particles(x, y, texture, {
      speed: { min: 40, max: 140 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.5, end: 0 },
      alpha: { start: 0.9, end: 0 },
      lifespan: 650,
      quantity: 18,
      blendMode: 'ADD'
    })
    emitter.setDepth(170)
    this.scene.time.delayedCall(700, () => emitter.destroy())
  }

  healEffect(x: number, y: number): void {
    const texture = this.resolveTexture('particle_heal', 'particle_fallback_heal', 0x70ff8c, 5)
    const emitter = this.scene.add.particles(x, y + 16, texture, {
      speedY: { min: -90, max: -30 },
      speedX: { min: -25, max: 25 },
      scale: { start: 0.45, end: 0 },
      alpha: { start: 0.95, end: 0 },
      lifespan: 800,
      quantity: 14,
      blendMode: 'ADD'
    })
    emitter.setDepth(170)
    this.scene.time.delayedCall(860, () => emitter.destroy())
  }

  lightningEffect(x: number, y: number): void {
    const texture = this.resolveTexture('particle_lightning', 'particle_fallback_lightning', 0xfff56d, 4)
    const emitter = this.scene.add.particles(x, y, texture, {
      speed: { min: 120, max: 280 },
      angle: { min: -110, max: -70 },
      scale: { start: 0.55, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 260,
      quantity: 20,
      blendMode: 'ADD'
    })
    emitter.setDepth(170)
    this.scene.time.delayedCall(320, () => emitter.destroy())
  }

  dustCloud(x: number, y: number): void {
    const texture = this.resolveTexture('particle_dust', 'particle_fallback_dust', 0xa6855f, 6)
    const emitter = this.scene.add.particles(x, y + 20, texture, {
      speedX: { min: -50, max: 50 },
      speedY: { min: -20, max: 10 },
      scale: { start: 0.4, end: 0 },
      alpha: { start: 0.7, end: 0 },
      lifespan: 420,
      quantity: 14
    })
    emitter.setDepth(145)
    this.scene.time.delayedCall(470, () => emitter.destroy())
  }

  private resolveTexture(preferredKey: string, fallbackKey: string, color: number, radius: number): string {
    if (this.scene.textures.exists(preferredKey)) {
      return preferredKey
    }

    if (this.scene.textures.exists(fallbackKey)) {
      return fallbackKey
    }

    const graphics = this.scene.add.graphics()
    graphics.fillStyle(color, 1)
    graphics.fillCircle(radius, radius, radius)
    graphics.generateTexture(fallbackKey, radius * 2, radius * 2)
    graphics.destroy()

    return fallbackKey
  }
}
