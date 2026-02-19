import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config';
import { getLevelDialogue } from '../levels/DialogueData';
import { LEVELS } from '../levels/LevelDefs';
import { createInitialProgression, type LevelProgress } from '../levels/LevelProgression';
import { loadGame } from '../save/SaveManager';

export class LevelSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LevelSelectScene' });
  }

  create(): void {
    const progress = this.loadProgress();

    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    this.add
      .text(GAME_WIDTH / 2, 70, 'SELECT BATTLE', {
        fontFamily: 'Georgia, serif',
        fontSize: '48px',
        color: '#f4c95d',
        fontStyle: 'bold',
        stroke: '#5f4515',
        strokeThickness: 4
      })
      .setOrigin(0.5);

    const startY = 140;
    const gapY = 52;

    const container = this.add.container(0, 0);
    const totalHeight = startY + LEVELS.length * gapY + 60;
    const maxScroll = Math.max(0, totalHeight - GAME_HEIGHT);
    let scrollY = 0;

    this.input.on('wheel', (_p: unknown, _gx: number, _gy: number, _gz: number, _gw: number, dy: number) => {
      scrollY = Phaser.Math.Clamp(scrollY + (dy > 0 ? 40 : -40), 0, maxScroll);
      container.y = -scrollY;
    });

    // Touch drag scroll
    let dragStartY = 0;
    let dragScrollY = 0;
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => { dragStartY = p.y; dragScrollY = scrollY; });
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      if (!p.isDown) return;
      const delta = dragStartY - p.y;
      if (Math.abs(delta) > 10) {
        scrollY = Phaser.Math.Clamp(dragScrollY + delta, 0, maxScroll);
        container.y = -scrollY;
      }
    });

    LEVELS.forEach((level, idx) => {
      const levelProgress = progress.find((entry) => entry.levelId === level.id);
      const unlocked = levelProgress?.unlocked ?? level.id === 1;
      const stars = Phaser.Math.Clamp(levelProgress?.stars ?? 0, 0, 3);
      const starText = `${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}`;

      const y = startY + idx * gapY;
      const width = 760;
      const height = 44;
      const fill = unlocked ? 0x24315f : 0x333341;
      const border = unlocked ? 0x5e78c9 : 0x555566;
      const textColor = unlocked ? '#ffffff' : '#9fa3b4';

      const card = this.add
        .rectangle(GAME_WIDTH / 2, y, width, height, fill, 0.95)
        .setStrokeStyle(2, border)
        .setOrigin(0.5);
      container.add(card);

      const label = this.add
        .text(GAME_WIDTH / 2 - 350, y, `Lv ${level.id}  ${level.name}`, {
          fontFamily: 'Verdana, sans-serif',
          fontSize: '18px',
          color: textColor,
          fontStyle: 'bold'
        })
        .setOrigin(0, 0.5);
      container.add(label);

      const starLabel = this.add
        .text(GAME_WIDTH / 2 + 200, y, starText, {
          fontFamily: 'Trebuchet MS, sans-serif',
          fontSize: '20px',
          color: unlocked ? '#f4c95d' : '#737387'
        })
        .setOrigin(0, 0.5);
      container.add(starLabel);

      if (!unlocked) {
        const lock = this.add
          .text(GAME_WIDTH / 2 + 330, y, '🔒', {
            fontFamily: 'Verdana, sans-serif',
            fontSize: '22px',
            color: '#8f8f9f'
          })
          .setOrigin(0.5);
        container.add(lock);
        return;
      }

      card.setInteractive({ useHandCursor: true });
      card.on('pointerover', () => {
        card.setFillStyle(0x2f427e, 1);
      });
      card.on('pointerout', () => {
        card.setFillStyle(fill, 0.95);
      });
      card.on('pointerdown', () => {
        this.startLevel(level.id);
      });
    });

    const back = this.add
      .rectangle(110, GAME_HEIGHT - 42, 150, 44, 0x2f2f42, 0.95)
      .setStrokeStyle(2, 0x7a7a9a)
      .setInteractive({ useHandCursor: true });

    this.add
      .text(110, GAME_HEIGHT - 42, 'Back', {
        fontFamily: 'Verdana, sans-serif',
        fontSize: '24px',
        color: '#ffffff',
        fontStyle: 'bold'
      })
      .setOrigin(0.5);

    back.on('pointerover', () => back.setFillStyle(0x3a3a55, 1));
    back.on('pointerout', () => back.setFillStyle(0x2f2f42, 0.95));
    back.on('pointerdown', () => this.scene.start('TitleScene'));
  }

  private loadProgress(): LevelProgress[] {
    const save = loadGame();
    return save?.levelProgress ?? createInitialProgression();
  }

  private startLevel(levelId: number): void {
    const dialogue = getLevelDialogue(levelId);

    this.scene.start('DialogueScene', {
      lines: dialogue.pre,
      nextScene: 'BattleScene',
      nextSceneData: {
        levelId,
        skipPreBattleDialogue: true
      }
    });
  }
}
