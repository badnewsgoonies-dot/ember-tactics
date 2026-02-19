import Phaser from 'phaser';

export class UnitAnimations {
  constructor(private readonly scene: Phaser.Scene) {}

  idleBob(sprite: Phaser.GameObjects.Sprite): void {
    this.scene.tweens.killTweensOf(sprite);
    this.scene.tweens.add({
      targets: sprite,
      y: sprite.y - 4,
      duration: 900,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });
  }

  attackAnimation(
    sprite: Phaser.GameObjects.Sprite,
    targetX: number,
    targetY: number
  ): Promise<void> {
    return new Promise((resolve) => {
      if (!sprite.active) {
        resolve();
        return;
      }

      const startX = sprite.x;
      const startY = sprite.y;
      const dx = targetX - startX;
      const dy = targetY - startY;
      const distance = Math.hypot(dx, dy);
      const lungeDistance = Math.min(24, distance * 0.35);
      const lungeX = distance === 0 ? startX : startX + (dx / distance) * lungeDistance;
      const lungeY = distance === 0 ? startY : startY + (dy / distance) * lungeDistance;

      this.scene.tweens.chain({
        targets: sprite,
        tweens: [
          { x: lungeX, y: lungeY, duration: 90, ease: 'Quad.easeOut' },
          { x: startX, y: startY, duration: 120, ease: 'Quad.easeIn' }
        ],
        onComplete: () => resolve()
      });
    });
  }

  damageFlash(sprite: Phaser.GameObjects.Sprite): Promise<void> {
    return new Promise((resolve) => {
      if (!sprite.active) {
        resolve();
        return;
      }

      sprite.setTintFill(0xff4d4d);
      this.scene.time.delayedCall(90, () => {
        if (sprite.active) {
          sprite.clearTint();
        }
        resolve();
      });
    });
  }

  deathFade(sprite: Phaser.GameObjects.Sprite): Promise<void> {
    return new Promise((resolve) => {
      if (!sprite.active) {
        resolve();
        return;
      }

      this.scene.tweens.add({
        targets: sprite,
        alpha: 0,
        scaleX: 0.65,
        scaleY: 0.65,
        duration: 320,
        ease: 'Quad.easeIn',
        onComplete: () => resolve()
      });
    });
  }

  healGlow(sprite: Phaser.GameObjects.Sprite): Promise<void> {
    return new Promise((resolve) => {
      if (!sprite.active) {
        resolve();
        return;
      }

      sprite.setTint(0x6aff8a);
      this.scene.tweens.add({
        targets: sprite,
        scaleX: sprite.scaleX * 1.08,
        scaleY: sprite.scaleY * 1.08,
        duration: 140,
        yoyo: true,
        repeat: 1,
        ease: 'Sine.easeInOut',
        onComplete: () => {
          if (sprite.active) {
            sprite.clearTint();
          }
          resolve();
        }
      });
    });
  }
}
