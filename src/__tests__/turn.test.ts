import { describe, expect, test } from 'vitest';
import type { TerrainType } from '../grid/TileTypes';
import {
  allUnitsActed,
  applyEnvironmentEffects,
  createTurnState,
  getActiveTeamUnits,
  isEnemyPhase,
  isPlayerPhase,
  markUnitDone,
  nextPhase
} from '../turn/TurnManager';
import { createStatus } from '../units/StatusEffects';
import { createUnit } from '../units/Unit';

function makeGrid(cols: number, rows: number, fill: TerrainType = 'Plains'): TerrainType[][] {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => fill));
}

describe('TurnManager', () => {
  test('createTurnState starts at turn 1, player phase', () => {
    const units = [
      createUnit('p1', 'Hero', 'Knight', 'player', 1, 0, 0),
      createUnit('e1', 'Enemy', 'Knight', 'enemy', 1, 1, 0)
    ];

    const state = createTurnState(units);

    expect(state.turnNumber).toBe(1);
    expect(state.currentPhase).toBe('player');
    expect(state.phaseOrder).toEqual(['player', 'enemy', 'environment']);
  });

  test('getActiveTeamUnits returns correct team units', () => {
    const units = [
      createUnit('p1', 'Hero', 'Knight', 'player', 1, 0, 0),
      createUnit('p2', 'Scout', 'Thief', 'player', 1, 0, 1),
      createUnit('e1', 'Enemy', 'Knight', 'enemy', 1, 1, 0)
    ];

    const state = createTurnState(units);

    expect(getActiveTeamUnits(state).map((u) => u.id)).toEqual(['p1', 'p2']);
  });

  test('nextPhase cycles player -> enemy -> environment -> player and increments turn', () => {
    const units = [
      createUnit('p1', 'Hero', 'Knight', 'player', 1, 0, 0),
      createUnit('e1', 'Enemy', 'Knight', 'enemy', 1, 1, 0)
    ];

    const state = createTurnState(units);
    const enemyPhase = nextPhase(state);
    const environmentPhase = nextPhase(enemyPhase);
    const playerPhaseTurn2 = nextPhase(environmentPhase);

    expect(enemyPhase.currentPhase).toBe('enemy');
    expect(environmentPhase.currentPhase).toBe('environment');
    expect(playerPhaseTurn2.currentPhase).toBe('player');
    expect(playerPhaseTurn2.turnNumber).toBe(2);
  });

  test('markUnitDone marks hasMoved + hasActed true', () => {
    const units = [createUnit('p1', 'Hero', 'Knight', 'player', 1, 0, 0)];
    const state = createTurnState(units);

    const updated = markUnitDone(state, 'p1');

    expect(updated.units[0]?.hasMoved).toBe(true);
    expect(updated.units[0]?.hasActed).toBe(true);
  });

  test('allUnitsActed returns true when all active phase units have acted', () => {
    const units = [
      createUnit('p1', 'Hero', 'Knight', 'player', 1, 0, 0),
      createUnit('p2', 'Scout', 'Archer', 'player', 1, 1, 0)
    ];

    let state = createTurnState(units);
    expect(allUnitsActed(state)).toBe(false);

    state = markUnitDone(state, 'p1');
    state = markUnitDone(state, 'p2');

    expect(allUnitsActed(state)).toBe(true);
  });

  test('isPlayerPhase and isEnemyPhase are correct', () => {
    const units = [
      createUnit('p1', 'Hero', 'Knight', 'player', 1, 0, 0),
      createUnit('e1', 'Enemy', 'Knight', 'enemy', 1, 1, 0)
    ];

    const playerState = createTurnState(units);
    const enemyState = nextPhase(playerState);

    expect(isPlayerPhase(playerState)).toBe(true);
    expect(isEnemyPhase(playerState)).toBe(false);
    expect(isPlayerPhase(enemyState)).toBe(false);
    expect(isEnemyPhase(enemyState)).toBe(true);
  });

  test('applyEnvironmentEffects applies fire terrain damage', () => {
    const unit = createUnit('p1', 'Hero', 'Knight', 'player', 1, 2, 2);
    const grid = makeGrid(5, 5);
    grid[2][2] = 'Fire';

    const state = createTurnState([unit]);
    const result = applyEnvironmentEffects(state, grid);

    expect(result.units[0]?.currentHp).toBe(unit.currentHp - 5);
  });

  test('applyEnvironmentEffects ticks statuses and applies status damage', () => {
    const unit = {
      ...createUnit('p1', 'Hero', 'Knight', 'player', 1, 1, 1),
      statusEffects: [createStatus('Poison', 2, 3)]
    };

    const grid = makeGrid(3, 3);
    const state = createTurnState([unit]);
    const result = applyEnvironmentEffects(state, grid);

    expect(result.units[0]?.currentHp).toBe(unit.currentHp - 3);
    expect(result.units[0]?.statusEffects).toHaveLength(1);
    expect(result.units[0]?.statusEffects[0]?.turnsRemaining).toBe(1);
  });
});
