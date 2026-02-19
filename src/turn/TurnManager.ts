import { getFireDamage } from '../grid/TerrainEffects';
import type { TerrainType } from '../grid/TileTypes';
import { tickStatuses } from '../units/StatusEffects';
import { damageUnit, resetTurnState, type UnitData } from '../units/Unit';

// TurnManager logic is intentionally implemented as pure functions.
export type Phase = 'player' | 'enemy' | 'environment';

export interface TurnState {
  turnNumber: number;
  currentPhase: Phase;
  activeUnitIndex: number;
  units: UnitData[];
  phaseOrder: Phase[];
}

const DEFAULT_PHASE_ORDER: Phase[] = ['player', 'enemy', 'environment'];

function isInBounds(grid: TerrainType[][], x: number, y: number): boolean {
  return y >= 0 && y < grid.length && x >= 0 && x < (grid[0]?.length ?? 0);
}

function belongsToPhase(unit: UnitData, phase: Phase): boolean {
  if (phase === 'player') {
    return unit.team === 'player' || unit.team === 'ally';
  }

  if (phase === 'enemy') {
    return unit.team === 'enemy';
  }

  return false;
}

function getNextActiveUnitIndex(units: UnitData[], phase: Phase): number {
  const idx = units.findIndex((unit) => unit.isAlive && belongsToPhase(unit, phase) && !unit.hasActed);
  return idx >= 0 ? idx : 0;
}

export function createTurnState(units: UnitData[]): TurnState {
  const startingPhase: Phase = 'player';
  return {
    turnNumber: 1,
    currentPhase: startingPhase,
    activeUnitIndex: getNextActiveUnitIndex(units, startingPhase),
    units: [...units],
    phaseOrder: [...DEFAULT_PHASE_ORDER]
  };
}

export function getActiveTeamUnits(state: TurnState): UnitData[] {
  return state.units.filter((unit) => unit.isAlive && belongsToPhase(unit, state.currentPhase));
}

export function nextPhase(state: TurnState): TurnState {
  const currentIndex = state.phaseOrder.indexOf(state.currentPhase);
  const nextPhaseIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % state.phaseOrder.length;
  const wrappedTurn = currentIndex >= 0 && nextPhaseIndex === 0;
  const nextCurrentPhase = state.phaseOrder[nextPhaseIndex] ?? 'player';

  const nextUnits = state.units.map((unit) => {
    if (!unit.isAlive) {
      return unit;
    }

    if (belongsToPhase(unit, nextCurrentPhase)) {
      return resetTurnState(unit);
    }

    return unit;
  });

  return {
    ...state,
    turnNumber: wrappedTurn ? state.turnNumber + 1 : state.turnNumber,
    currentPhase: nextCurrentPhase,
    activeUnitIndex: getNextActiveUnitIndex(nextUnits, nextCurrentPhase),
    units: nextUnits
  };
}

export function isPlayerPhase(state: TurnState): boolean {
  return state.currentPhase === 'player';
}

export function isEnemyPhase(state: TurnState): boolean {
  return state.currentPhase === 'enemy';
}

export function markUnitDone(state: TurnState, unitId: string): TurnState {
  const nextUnits = state.units.map((unit) => {
    if (unit.id !== unitId) {
      return unit;
    }

    return {
      ...unit,
      hasMoved: true,
      hasActed: true
    };
  });

  return {
    ...state,
    units: nextUnits,
    activeUnitIndex: getNextActiveUnitIndex(nextUnits, state.currentPhase)
  };
}

export function allUnitsActed(state: TurnState): boolean {
  const activeUnits = getActiveTeamUnits(state);
  if (activeUnits.length === 0) {
    return true;
  }

  return activeUnits.every((unit) => unit.hasActed);
}

export function applyEnvironmentEffects(state: TurnState, grid: TerrainType[][]): TurnState {
  const fireDamage = getFireDamage();

  const nextUnits = state.units.map((unit) => {
    if (!unit.isAlive) {
      return unit;
    }

    let nextUnit = unit;

    if (isInBounds(grid, unit.gridX, unit.gridY) && grid[unit.gridY][unit.gridX] === 'Fire') {
      nextUnit = damageUnit(nextUnit, fireDamage);
    }

    if (!nextUnit.isAlive) {
      return nextUnit;
    }

    const statusTick = tickStatuses(nextUnit.statusEffects);
    nextUnit = {
      ...nextUnit,
      statusEffects: statusTick.remaining
    };

    if (statusTick.damage > 0) {
      nextUnit = damageUnit(nextUnit, statusTick.damage);
    }

    return nextUnit;
  });

  return {
    ...state,
    units: nextUnits,
    activeUnitIndex: getNextActiveUnitIndex(nextUnits, state.currentPhase)
  };
}
