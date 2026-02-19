import Phaser from 'phaser';

export class PhaseTransition {
  constructor(private readonly scene: Phaser.Scene) {}

  showPhaseTransition(phase: 'player' | 'enemy'): Promise<void> {
    return new Promise((resolve) => {
      const width = this.scene.scale.width;
      const y = 84;
      const bannerWidth = width;
      const bannerHeight = 76;
      const isPlayer = phase === 'player';
      const fillColor = isPlayer ? 0x2458b8 : 0xb83a3a;
      const accentColor = isPlayer ? 0x6ca5ff : 0xff8c8c;
      const label = isPlayer ? 'PLAYER PHASE' : 'ENEMY PHASE';

      const container = this.scene.add.container(-bannerWidth, y);
      container.setDepth(320);

      const banner = this.scene.add
        .rectangle(0, 0, bannerWidth, bannerHeight, fillColor, 0.93)
        .setOrigin(0, 0.5)
        .setStrokeStyle(2, 0xf0dba5, 1);

      const swoosh = this.scene.add.triangle(
        bannerWidth - 70,
        0,
        0,
        -bannerHeight / 2,
        70,
        0,
        0,
        bannerHeight / 2,
        accentColor,
        0.95
      );

      const text = this.scene.add.text(bannerWidth / 2, 0, label, {
        fontFamily: 'Georgia, serif',
        fontSize: '40px',
        color: '#fff4d1',
        fontStyle: 'bold',
        stroke: '#101010',
        strokeThickness: 5
      });
      text.setOrigin(0.5);

      container.add([banner, swoosh, text]);

      this.scene.tweens.chain({
        targets: container,
        tweens: [
          {
            x: 0,
            duration: 320,
            ease: 'Cubic.easeOut'
          },
          {
            x: 0,
            duration: 1000,
            ease: 'Linear'
          },
          {
            x: width + bannerWidth,
            duration: 320,
            ease: 'Cubic.easeIn'
          }
        ],
        onComplete: () => {
          container.destroy(true);
          resolve();
        }
      });
    });
  }
}
