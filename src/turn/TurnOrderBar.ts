import Phaser from 'phaser';
import { TEAM_COLORS } from '../config';
import type { TurnState, Phase } from './TurnManager';
import type { UnitData } from '../units/Unit';

function belongsToPhase(unit: UnitData, phase: Phase): boolean {
  if (phase === 'player') {
    return unit.team === 'player' || unit.team === 'ally';
  }

  if (phase === 'enemy') {
    return unit.team === 'enemy';
  }

  return false;
}

function getPhaseOrder(state: TurnState): Phase[] {
  const idx = state.phaseOrder.indexOf(state.currentPhase);
  if (idx < 0) {
    return [...state.phaseOrder];
  }

  return [...state.phaseOrder.slice(idx), ...state.phaseOrder.slice(0, idx)];
}

function getCurrentActiveUnitId(state: TurnState): string | null {
  const indexed = state.units[state.activeUnitIndex];
  if (indexed && indexed.isAlive && belongsToPhase(indexed, state.currentPhase) && !indexed.hasActed) {
    return indexed.id;
  }

  const fallback = state.units.find(
    (unit) => unit.isAlive && belongsToPhase(unit, state.currentPhase) && !unit.hasActed
  );

  return fallback?.id ?? null;
}

export class TurnOrderBar {
  private readonly container: Phaser.GameObjects.Container;

  constructor(private readonly scene: Phaser.Scene) {
    this.container = scene.add.container(0, 0);
    this.container.setDepth(200);
  }

  update(turnState: TurnState): void {
    this.container.removeAll(true);

    const width = this.scene.scale.width;
    const background = this.scene.add
      .rectangle(width / 2, 28, width, 56, 0x101520, 0.95)
      .setStrokeStyle(2, 0x2e3b58, 1);
    this.container.add(background);

    const phaseLabel = this.scene.add.text(16, 12, `Turn ${turnState.turnNumber} - ${turnState.currentPhase.toUpperCase()} PHASE`, {
      fontFamily: 'Verdana, sans-serif',
      fontSize: '18px',
      color: '#f2e8b8',
      fontStyle: 'bold'
    });
    this.container.add(phaseLabel);

    const rotatedPhases = getPhaseOrder(turnState);
    const orderedUnits = rotatedPhases
      .flatMap((phase) =>
        turnState.units
          .filter((unit) => unit.isAlive && belongsToPhase(unit, phase))
          .sort((a, b) => Number(a.hasActed) - Number(b.hasActed) || b.spd - a.spd)
      )
      .slice(0, 11);

    const activeId = getCurrentActiveUnitId(turnState);
    const startX = 270;
    const step = 56;

    orderedUnits.forEach((unit, idx) => {
      const x = startX + idx * step;
      const y = 28;
      const slotColor = TEAM_COLORS[unit.team];
      const border = unit.id === activeId ? 0xf4c95d : 0x1e2538;

      const slot = this.scene.add
        .rectangle(x, y, 50, 50, slotColor, 0.9)
        .setStrokeStyle(3, border, 1);
      this.container.add(slot);

      const portraitKey = `portrait_${unit.unitClass.toLowerCase()}`;
      if (this.scene.textures.exists(portraitKey)) {
        const portrait = this.scene.add.image(x, y, portraitKey).setDisplaySize(42, 42);
        portrait.setAlpha(unit.hasActed ? 0.6 : 1);
        this.container.add(portrait);
      } else {
        const initials = unit.unitClass.slice(0, 2).toUpperCase();
        const text = this.scene.add.text(x, y, initials, {
          fontFamily: 'Verdana, sans-serif',
          fontSize: '18px',
          color: '#ffffff',
          fontStyle: 'bold'
        });
        text.setOrigin(0.5);
        text.setAlpha(unit.hasActed ? 0.6 : 1);
        this.container.add(text);
      }
    });
  }
}
