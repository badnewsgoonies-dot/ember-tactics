import type { UnitData } from '../units/Unit';

export type ObjectiveStatus = 'active' | 'completed' | 'failed';

export function checkObjective(
  objectiveType: string,
  units: UnitData[],
  objectiveTarget?: string,
  turnNumber?: number,
  surviveTurns?: number
): ObjectiveStatus {
  if (objectiveType === 'defeat_all') {
    const aliveEnemies = units.filter((unit) => unit.team === 'enemy' && unit.isAlive);
    return aliveEnemies.length === 0 ? 'completed' : 'active';
  }

  if (objectiveType === 'defeat_boss') {
    if (!objectiveTarget) {
      return 'active';
    }

    const target = units.find((unit) => unit.name === objectiveTarget);
    return !target || !target.isAlive ? 'completed' : 'active';
  }

  if (objectiveType === 'survive') {
    if (typeof turnNumber !== 'number' || typeof surviveTurns !== 'number') {
      return 'active';
    }

    return turnNumber >= surviveTurns ? 'completed' : 'active';
  }

  if (objectiveType === 'escort') {
    if (!objectiveTarget) {
      return 'active';
    }

    const vip = units.find((unit) => unit.team === 'ally' && unit.name === objectiveTarget);
    if (!vip || !vip.isAlive) {
      return 'failed';
    }

    if (vip.gridX >= 12) {
      return 'completed';
    }

    return 'active';
  }

  return 'active';
}

export function checkDefeat(units: UnitData[]): boolean {
  const playerUnits = units.filter((unit) => unit.team === 'player');
  if (playerUnits.length === 0) {
    return false;
  }

  return playerUnits.every((unit) => !unit.isAlive);
}
