import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config';
import { createInitialProgression } from '../levels/LevelProgression';
import { deleteSave, loadGame } from '../save/SaveManager';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  create(): void {
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1e2033, 0x1e2033, 0x111520, 0x111520, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    this.add.particles(GAME_WIDTH / 2, GAME_HEIGHT * 0.24, 'particle_lightning', {
      speed: { min: 30, max: 140 },
      angle: { min: 210, max: 330 },
      lifespan: { min: 700, max: 1300 },
      scale: { start: 0.8, end: 0 },
      alpha: { start: 0.8, end: 0 },
      quantity: 3,
      frequency: 90,
      blendMode: 'ADD'
    });

    this.add
      .text(GAME_WIDTH / 2, 96, 'CAMPAIGN COMPLETE', {
        fontFamily: 'Georgia, serif',
        fontSize: '64px',
        color: '#f4c95d',
        fontStyle: 'bold',
        stroke: '#5c4516',
        strokeThickness: 5
      })
      .setOrigin(0.5);

    const save = loadGame();
    const progress = save?.levelProgress ?? createInitialProgression();
    const levelsCompleted = progress.filter((entry) => entry.completed).length;
    const totalStars = progress.reduce((sum, entry) => sum + entry.stars, 0);
    const totalTurns = progress
      .filter((entry) => entry.completed && entry.bestTurns < 999)
      .reduce((sum, entry) => sum + entry.bestTurns, 0);

    const stats = [
      `Levels Completed: ${levelsCompleted}`,
      `Total Stars: ${totalStars}`,
      `Total Turns: ${totalTurns}`
    ];

    this.add
      .text(GAME_WIDTH / 2, 280, stats.join('\n'), {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '30px',
        color: '#e6ecff',
        align: 'center',
        lineSpacing: 14
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, 408, 'The Ember King has fallen. The realm breathes again.', {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '24px',
        color: '#d6d6e8'
      })
      .setOrigin(0.5);

    this.createButton('New Game', GAME_HEIGHT - 164, () => {
      deleteSave();
      this.scene.start('TitleScene');
    });

    this.createButton('Return to Map', GAME_HEIGHT - 86, () => {
      this.scene.start('LevelSelectScene');
    });
  }

  private createButton(label: string, y: number, onClick: () => void): void {
    const button = this.add
      .rectangle(GAME_WIDTH / 2, y, 320, 58, 0x2e3e7a, 0.95)
      .setStrokeStyle(2, 0x8ca2ef)
      .setInteractive({ useHandCursor: true });

    this.add
      .text(GAME_WIDTH / 2, y, label, {
        fontFamily: 'Verdana, sans-serif',
        fontSize: '30px',
        color: '#ffffff',
        fontStyle: 'bold'
      })
      .setOrigin(0.5);

    button.on('pointerover', () => button.setFillStyle(0x3c53a0, 1));
    button.on('pointerout', () => button.setFillStyle(0x2e3e7a, 0.95));
    button.on('pointerdown', onClick);
  }
}
