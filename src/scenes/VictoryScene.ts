import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config';
import { LEVELS } from '../levels/LevelDefs';
import {
  calculateStars,
  createInitialProgression,
  type LevelProgress,
  unlockNextLevel
} from '../levels/LevelProgression';
import { loadGame, saveGame } from '../save/SaveManager';
import { serializeGameState } from '../save/Serializer';

interface VictoryInitData {
  levelId: number;
  turnsTaken: number;
  unitsLost: number;
  xpGained: number;
  unitRoster?: Array<{ name: string; unitClass: string; level: number; xp: number }>;
}

export class VictoryScene extends Phaser.Scene {
  private levelId = 1;
  private turnsTaken = 0;
  private unitsLost = 0;
  private xpGained = 0;
  private starsEarned = 1;
  private unitRoster: Array<{ name: string; unitClass: string; level: number; xp: number }> = [];
  private levelProgress: LevelProgress[] = [];

  constructor() {
    super({ key: 'VictoryScene' });
  }

  init(data: VictoryInitData): void {
    this.levelId = data?.levelId ?? 1;
    this.turnsTaken = data?.turnsTaken ?? 0;
    this.unitsLost = data?.unitsLost ?? 0;
    this.xpGained = data?.xpGained ?? 0;
    this.unitRoster = data?.unitRoster ?? [];
  }

  create(): void {
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a2238, 0x1a2238, 0x0f1527, 0x0f1527, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    this.add.particles(GAME_WIDTH / 2, GAME_HEIGHT * 0.2, 'particle_fire', {
      speed: { min: 25, max: 120 },
      angle: { min: 210, max: 330 },
      lifespan: { min: 700, max: 1200 },
      scale: { start: 1, end: 0 },
      alpha: { start: 0.9, end: 0 },
      quantity: 4,
      frequency: 80,
      blendMode: 'ADD'
    });

    this.add
      .text(GAME_WIDTH / 2, 88, 'VICTORY!', {
        fontFamily: 'Georgia, serif',
        fontSize: '82px',
        color: '#f4c95d',
        fontStyle: 'bold',
        stroke: '#6b4f14',
        strokeThickness: 6
      })
      .setOrigin(0.5);

    this.applyVictoryProgress();

    this.add
      .text(GAME_WIDTH / 2, 220, `${'★'.repeat(this.starsEarned)}${'☆'.repeat(3 - this.starsEarned)}`, {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '56px',
        color: '#f4c95d'
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, 292, `XP Gained: ${this.xpGained}`, {
        fontFamily: 'Verdana, sans-serif',
        fontSize: '32px',
        color: '#d8ddf5'
      })
      .setOrigin(0.5);

    const stats = [
      `Level: ${this.levelId}`,
      `Turns Taken: ${this.turnsTaken}`,
      `Units Lost: ${this.unitsLost}`
    ];

    this.add
      .text(GAME_WIDTH / 2, 370, stats.join('\n'), {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '26px',
        color: '#ffffff',
        align: 'center',
        lineSpacing: 12
      })
      .setOrigin(0.5);

    const button = this.add
      .rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 92, 280, 62, 0x2f5c9c, 0.95)
      .setStrokeStyle(2, 0x8cb2f5)
      .setInteractive({ useHandCursor: true });

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 92, 'Continue', {
        fontFamily: 'Verdana, sans-serif',
        fontSize: '32px',
        color: '#ffffff',
        fontStyle: 'bold'
      })
      .setOrigin(0.5);

    button.on('pointerover', () => button.setFillStyle(0x3b74c1, 1));
    button.on('pointerout', () => button.setFillStyle(0x2f5c9c, 0.95));
    button.on('pointerdown', () => {
      if (this.levelId >= LEVELS.length) {
        this.scene.start('GameOverScene');
        return;
      }

      this.scene.start('LevelSelectScene');
    });
  }

  private applyVictoryProgress(): void {
    const save = loadGame();
    const baseProgress = save?.levelProgress ?? createInitialProgression();

    this.starsEarned = calculateStars(this.levelId, this.turnsTaken, this.unitsLost);

    const unlocked = unlockNextLevel(baseProgress, this.levelId);
    this.levelProgress = unlocked.map((entry) => {
      if (entry.levelId !== this.levelId) {
        return entry;
      }

      return {
        ...entry,
        completed: true,
        unlocked: true,
        stars: Math.max(entry.stars, this.starsEarned),
        bestTurns: Math.min(entry.bestTurns, this.turnsTaken)
      };
    });

    const roster = this.unitRoster.length > 0 ? this.unitRoster : (save?.unitRoster ?? []);
    const saveData = serializeGameState(this.levelProgress, roster);
    saveGame(saveData);
  }
}
