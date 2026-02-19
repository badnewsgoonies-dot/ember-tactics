import Phaser from 'phaser';
import type { DialogueLine } from '../levels/DialogueData';

interface DialogueSceneInitData {
  lines: DialogueLine[];
  nextScene: string;
  nextSceneData?: object;
}

export class DialogueScene extends Phaser.Scene {
  private lines: DialogueLine[] = [];
  private nextScene = 'BattleScene';
  private nextSceneData: object | undefined;

  private lineIndex = 0;
  private isTyping = false;
  private currentText = '';
  private typingEvent: Phaser.Time.TimerEvent | null = null;

  private portraitBox!: Phaser.GameObjects.Rectangle;
  private portraitInitialText!: Phaser.GameObjects.Text;
  private speakerText!: Phaser.GameObjects.Text;
  private lineText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'DialogueScene' });
  }

  init(data: { lines: DialogueLine[]; nextScene: string; nextSceneData?: object }): void {
    this.lines = data?.lines ?? [];
    this.nextScene = data?.nextScene ?? 'BattleScene';
    this.nextSceneData = data?.nextSceneData;
    this.lineIndex = 0;
    this.isTyping = false;
    this.currentText = '';

    if (this.typingEvent) {
      this.typingEvent.destroy();
      this.typingEvent = null;
    }
  }

  create(): void {
    const width = this.scale.width;
    const height = this.scale.height;

    const boxHeight = 180;
    const boxY = height - boxHeight;

    this.add.rectangle(width / 2, boxY + boxHeight / 2, width - 24, boxHeight - 16, 0x10141f, 0.94).setDepth(10);
    this.add.rectangle(width / 2, boxY + boxHeight / 2, width - 24, boxHeight - 16).setStrokeStyle(2, 0xf4c95d, 0.65).setDepth(11);

    const portraitX = 70;
    const portraitY = boxY + 84;

    this.portraitBox = this.add.rectangle(portraitX, portraitY, 64, 64, 0x486090, 1).setDepth(12);
    this.portraitBox.setStrokeStyle(2, 0xddd6b4, 0.8);

    this.portraitInitialText = this.add
      .text(portraitX, portraitY, '?', {
        fontFamily: 'Verdana, sans-serif',
        fontSize: '32px',
        color: '#ffffff',
        fontStyle: 'bold'
      })
      .setOrigin(0.5)
      .setDepth(13);

    this.speakerText = this.add
      .text(120, boxY + 36, '', {
        fontFamily: 'Georgia, serif',
        fontSize: '24px',
        color: '#f4c95d',
        fontStyle: 'bold'
      })
      .setDepth(12);

    this.lineText = this.add
      .text(120, boxY + 72, '', {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '22px',
        color: '#ffffff',
        wordWrap: { width: width - 160 }
      })
      .setDepth(12);

    this.input.on('pointerdown', this.handleAdvance, this);
    this.input.keyboard?.on('keydown-SPACE', this.handleAdvance, this);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.off('pointerdown', this.handleAdvance, this);
      this.input.keyboard?.off('keydown-SPACE', this.handleAdvance, this);
      this.clearTypingEvent();
    });

    if (this.lines.length === 0) {
      this.finishDialogue();
      return;
    }

    this.showLine(this.lineIndex);
  }

  private handleAdvance(): void {
    if (this.isTyping) {
      this.finishTyping();
      return;
    }

    this.lineIndex += 1;
    if (this.lineIndex >= this.lines.length) {
      this.finishDialogue();
      return;
    }

    this.showLine(this.lineIndex);
  }

  private showLine(index: number): void {
    const line = this.lines[index];
    if (!line) {
      this.finishDialogue();
      return;
    }

    this.speakerText.setText(line.speaker);
    this.portraitInitialText.setText((line.portrait.trim()[0] ?? '?').toUpperCase());
    this.portraitBox.setFillStyle(this.portraitColor(line.portrait), 1);

    this.startTypewriter(line.text);
  }

  private startTypewriter(text: string): void {
    this.clearTypingEvent();
    this.currentText = text;
    this.lineText.setText('');

    if (text.length === 0) {
      this.isTyping = false;
      return;
    }

    this.isTyping = true;
    let shown = 0;

    this.typingEvent = this.time.addEvent({
      delay: 18,
      repeat: text.length - 1,
      callback: () => {
        shown += 1;
        this.lineText.setText(text.slice(0, shown));

        if (shown >= text.length) {
          this.isTyping = false;
          this.clearTypingEvent();
        }
      }
    });
  }

  private finishTyping(): void {
    this.clearTypingEvent();
    this.isTyping = false;
    this.lineText.setText(this.currentText);
  }

  private clearTypingEvent(): void {
    if (!this.typingEvent) {
      return;
    }

    this.typingEvent.destroy();
    this.typingEvent = null;
  }

  private finishDialogue(): void {
    const payload = this.nextSceneData ?? {};
    this.scene.start(this.nextScene, payload as DialogueSceneInitData['nextSceneData']);
  }

  private portraitColor(key: string): number {
    let hash = 0;
    for (let i = 0; i < key.length; i += 1) {
      hash = ((hash << 5) - hash + key.charCodeAt(i)) | 0;
    }

    const r = 70 + (Math.abs(hash) % 120);
    const g = 60 + (Math.abs(hash >> 3) % 120);
    const b = 80 + (Math.abs(hash >> 6) % 120);

    return (r << 16) | (g << 8) | b;
  }
}
