import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config';

interface DefeatSceneInitData {
  levelId: number;
}

export class DefeatScene extends Phaser.Scene {
  private levelId = 1;

  constructor() {
    super({ key: 'DefeatScene' });
  }

  init(data: DefeatSceneInitData): void {
    this.levelId = data?.levelId ?? 1;
  }

  create(): void {
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x160d10, 0x160d10, 0x0d0809, 0x0d0809, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    this.add.particles(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'particle_fire', {
      speed: { min: 10, max: 55 },
      angle: { min: 240, max: 300 },
      lifespan: { min: 900, max: 1400 },
      scale: { start: 0.5, end: 0 },
      alpha: { start: 0.35, end: 0 },
      quantity: 2,
      frequency: 130,
      tint: 0xaa3344
    });

    this.add
      .text(GAME_WIDTH / 2, 120, 'DEFEAT', {
        fontFamily: 'Georgia, serif',
        fontSize: '94px',
        color: '#d44646',
        fontStyle: 'bold',
        stroke: '#3d1111',
        strokeThickness: 6
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, 240, 'Regroup and strike again.', {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '30px',
        color: '#c8b9bf'
      })
      .setOrigin(0.5);

    this.createButton('Retry', GAME_HEIGHT - 190, () => {
      this.scene.start('BattleScene', {
        levelId: this.levelId,
        skipPreBattleDialogue: true
      });
    });

    this.createButton('Return to Map', GAME_HEIGHT - 108, () => {
      this.scene.start('LevelSelectScene');
    });
  }

  private createButton(label: string, y: number, onClick: () => void): void {
    const button = this.add
      .rectangle(GAME_WIDTH / 2, y, 320, 62, 0x3d2730, 0.95)
      .setStrokeStyle(2, 0xa85a70)
      .setInteractive({ useHandCursor: true });

    this.add
      .text(GAME_WIDTH / 2, y, label, {
        fontFamily: 'Verdana, sans-serif',
        fontSize: '30px',
        color: '#ffffff',
        fontStyle: 'bold'
      })
      .setOrigin(0.5);

    button.on('pointerover', () => button.setFillStyle(0x573241, 1));
    button.on('pointerout', () => button.setFillStyle(0x3d2730, 0.95));
    button.on('pointerdown', onClick);
  }
}
