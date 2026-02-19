import Phaser from 'phaser'

export class DamagePopup {
  constructor(private readonly scene: Phaser.Scene) {}

  showDamage(x: number, y: number, amount: number, isCrit: boolean): void {
    if (isCrit) {
      this.spawnFloatingText(x, y - 22, 'CRIT!', '#ffd857', '18px')
      this.spawnFloatingText(x, y, `-${amount}`, '#ffd857', '30px')
      return
    }

    this.spawnFloatingText(x, y, `-${amount}`, '#ffffff', '28px')
  }

  showHeal(x: number, y: number, amount: number): void {
    this.spawnFloatingText(x, y, `+${amount}`, '#76ff8e', '28px')
  }

  showMiss(x: number, y: number): void {
    this.spawnFloatingText(x, y, 'MISS', '#bbbbbb', '24px')
  }

  showPoison(x: number, y: number, amount: number): void {
    this.spawnFloatingText(x, y, `-${amount}`, '#b86aff', '26px')
  }

  private spawnFloatingText(x: number, y: number, text: string, color: string, fontSize: string): void {
    const label = this.scene.add
      .text(x, y, text, {
        fontFamily: 'Verdana, sans-serif',
        fontSize,
        color,
        fontStyle: 'bold',
        stroke: '#111111',
        strokeThickness: 4
      })
      .setOrigin(0.5)
      .setDepth(320)

    this.scene.tweens.add({
      targets: label,
      y: y - 40,
      alpha: 0,
      duration: 800,
      ease: 'Quad.easeOut',
      onComplete: () => {
        label.destroy()
      }
    })
  }
}
