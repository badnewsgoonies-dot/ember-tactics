import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config';
import { deleteSave, hasSave } from '../save/SaveManager';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TitleScene' });
  }

  create(): void {
    this.cameras.main.setBackgroundColor(0x1a1a2e);
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x1a1a2e, 1);

    this.add.particles(GAME_WIDTH / 2, GAME_HEIGHT * 0.3 + 22, 'particle_fire', {
      speed: { min: 16, max: 70 },
      angle: { min: 245, max: 295 },
      lifespan: { min: 550, max: 950 },
      scale: { start: 1, end: 0 },
      alpha: { start: 0.8, end: 0 },
      quantity: 3,
      frequency: 90,
      blendMode: 'ADD'
    });

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT * 0.28, 'EMBER TACTICS', {
        fontFamily: 'Georgia, serif',
        fontSize: '72px',
        color: '#f4c95d',
        fontStyle: 'bold',
        stroke: '#5f4515',
        strokeThickness: 6
      })
      .setOrigin(0.5)
      .setDepth(2);

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT * 0.39, 'A Tactical RPG', {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '28px',
        color: '#d6d6ea'
      })
      .setOrigin(0.5)
      .setDepth(2);

    this.createButton('New Game', GAME_HEIGHT * 0.62, true, () => {
      deleteSave();
      this.scene.start('LevelSelectScene');
    });

    this.createButton('Continue', GAME_HEIGHT * 0.74, hasSave(), () => {
      this.scene.start('LevelSelectScene');
    });

    this.add
      .text(GAME_WIDTH - 16, GAME_HEIGHT - 12, 'v1.0', {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#b5b5c8'
      })
      .setOrigin(1, 1)
      .setDepth(2);
  }

  private createButton(label: string, y: number, enabled: boolean, onClick: () => void): void {
    const width = 280;
    const height = 58;
    const x = GAME_WIDTH / 2;

    const fill = enabled ? 0x263a7a : 0x4a4a4a;
    const border = enabled ? 0x6d8df0 : 0x777777;
    const textColor = enabled ? '#ffffff' : '#b0b0b0';

    const buttonBg = this.add
      .rectangle(x, y, width, height, fill, 0.95)
      .setStrokeStyle(2, border, 1)
      .setDepth(2);

    const buttonLabel = this.add
      .text(x, y, label, {
        fontFamily: 'Verdana, sans-serif',
        fontSize: '30px',
        color: textColor,
        fontStyle: 'bold'
      })
      .setOrigin(0.5)
      .setDepth(3);

    if (!enabled) {
      return;
    }

    buttonBg.setInteractive({ useHandCursor: true });

    buttonBg.on('pointerover', () => {
      buttonBg.setFillStyle(0x3553a8, 1);
      buttonLabel.setScale(1.03);
    });

    buttonBg.on('pointerout', () => {
      buttonBg.setFillStyle(fill, 0.95);
      buttonLabel.setScale(1);
    });

    buttonBg.on('pointerdown', () => {
      buttonBg.setFillStyle(0x1f2f60, 1);
      this.time.delayedCall(90, onClick);
    });
  }
}
