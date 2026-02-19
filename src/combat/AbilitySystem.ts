import type { StatusType } from '../units/StatusEffects';
import type { UnitData } from '../units/Unit';

export type AoEShape = 'single' | 'cross' | 'diamond' | 'line';

export interface AbilityDef {
  name: string;
  mpCost: number;
  cooldown: number;
  range: number;
  aoeShape: AoEShape;
  aoeSize: number;
  damageMultiplier: number;
  healAmount: number;
  statusApplied?: StatusType;
  statusDuration?: number;
  ignoreTerrainDef: boolean;
  description: string;
  targetType: 'enemy' | 'ally' | 'self' | 'all';
}

export function canUseAbility(unit: UnitData, ability: AbilityDef): boolean {
  if (!unit.isAlive) {
    return false;
  }

  return unit.mp >= ability.mpCost && unit.abilityCD <= 0;
}

export function getAoETiles(
  centerX: number,
  centerY: number,
  shape: AoEShape,
  size: number,
  gridCols: number,
  gridRows: number
): { x: number; y: number }[] {
  const boundedSize = Math.max(0, Math.floor(size));
  const seen = new Set<string>();
  const tiles: { x: number; y: number }[] = [];

  const addTile = (x: number, y: number): void => {
    if (x < 0 || y < 0 || x >= gridCols || y >= gridRows) {
      return;
    }

    const key = `${x},${y}`;
    if (seen.has(key)) {
      return;
    }

    seen.add(key);
    tiles.push({ x, y });
  };

  if (shape === 'single') {
    addTile(centerX, centerY);
    return tiles;
  }

  if (shape === 'cross') {
    for (let d = 0; d <= boundedSize; d += 1) {
      addTile(centerX + d, centerY);
      addTile(centerX - d, centerY);
      addTile(centerX, centerY + d);
      addTile(centerX, centerY - d);
    }
    return tiles;
  }

  if (shape === 'diamond') {
    for (let dx = -boundedSize; dx <= boundedSize; dx += 1) {
      for (let dy = -boundedSize; dy <= boundedSize; dy += 1) {
        if (Math.abs(dx) + Math.abs(dy) <= boundedSize) {
          addTile(centerX + dx, centerY + dy);
        }
      }
    }
    return tiles;
  }

  for (let dx = -boundedSize; dx <= boundedSize; dx += 1) {
    addTile(centerX + dx, centerY);
  }

  return tiles;
}

export function applyAbilityCost(unit: UnitData, ability: AbilityDef): UnitData {
  return {
    ...unit,
    mp: Math.max(0, unit.mp - ability.mpCost),
    abilityCD: Math.max(0, ability.cooldown)
  };
}
