import Phaser from 'phaser';
import type { UnitData } from '../units/Unit';

type ActionType = 'move' | 'attack' | 'ability' | 'wait';

interface ActionOption {
  label: string;
  action: ActionType;
}

export class ActionMenu {
  public onAction: ((action: ActionType) => void) | null = null;

  private container: Phaser.GameObjects.Container | null = null;

  constructor(private readonly scene: Phaser.Scene) {}

  show(
    unit: UnitData,
    options: { canMove: boolean; canAttack: boolean; canAbility: boolean; canWait: boolean }
  ): void {
    this.hide();

    const items: ActionOption[] = [];
    if (options.canMove) {
      items.push({ label: 'Move', action: 'move' });
    }
    if (options.canAttack) {
      items.push({ label: 'Attack', action: 'attack' });
    }
    if (options.canAbility) {
      items.push({ label: 'Ability', action: 'ability' });
    }
    if (options.canWait || items.length >= 0) {
      items.push({ label: 'Wait', action: 'wait' });
    }

    const panelWidth = 180;
    const buttonHeight = 38;
    const panelHeight = 64 + items.length * (buttonHeight + 8);
    const x = this.scene.scale.width - panelWidth / 2 - 18;
    const y = 120 + panelHeight / 2;

    const container = this.scene.add.container(0, 0);
    container.setDepth(260);

    const panel = this.scene.add
      .rectangle(x, y, panelWidth, panelHeight, 0x12161f, 0.95)
      .setStrokeStyle(2, 0xd2b15c, 1);
    container.add(panel);

    const title = this.scene.add.text(x, y - panelHeight / 2 + 16, unit.name, {
      fontFamily: 'Verdana, sans-serif',
      fontSize: '14px',
      color: '#f2e8c7',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5, 0);
    container.add(title);

    items.forEach((item, idx) => {
      const buttonY = y - panelHeight / 2 + 46 + idx * (buttonHeight + 8);

      const button = this.scene.add
        .rectangle(x, buttonY, panelWidth - 20, buttonHeight, 0x253144, 1)
        .setStrokeStyle(1, 0x415677, 1)
        .setInteractive({ useHandCursor: true });

      const label = this.scene.add.text(x, buttonY, item.label, {
        fontFamily: 'Verdana, sans-serif',
        fontSize: '18px',
        color: '#ffffff',
        fontStyle: 'bold'
      });
      label.setOrigin(0.5);

      button.on('pointerover', () => {
        button.setFillStyle(0x334764, 1);
      });

      button.on('pointerout', () => {
        button.setFillStyle(0x253144, 1);
      });

      button.on('pointerdown', () => {
        this.hide();
        this.onAction?.(item.action);
      });

      container.add([button, label]);
    });

    this.container = container;
  }

  hide(): void {
    if (!this.container) {
      return;
    }

    this.container.destroy(true);
    this.container = null;
  }
}
