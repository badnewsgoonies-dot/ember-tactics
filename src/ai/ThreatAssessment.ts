import { calcDamagePreview } from '../combat/DamageCalculation';
import type { TerrainType } from '../grid/TileTypes';
import type { UnitData } from '../units/Unit';
import { gridDistance } from '../utils/MathUtils';

export interface ThreatScore {
  targetId: string;
  score: number;
  canKill: boolean;
  isHealer: boolean;
  isLowHp: boolean;
  isSquishy: boolean;
  distance: number;
}

function getTerrainAt(grid: TerrainType[][], x: number, y: number): TerrainType {
  return grid[y]?.[x] ?? 'Plains';
}

export function assessThreat(aiUnit: UnitData, target: UnitData, grid: TerrainType[][]): ThreatScore {
  const terrain = getTerrainAt(grid, target.gridX, target.gridY);
  const preview = calcDamagePreview(aiUnit, target, terrain);
  const distance = gridDistance(aiUnit.gridX, aiUnit.gridY, target.gridX, target.gridY);

  const canKill = preview.maxDamage >= target.currentHp;
  const isHealer = target.unitClass === 'Healer';
  const isLowHp = target.currentHp < target.maxHp * 0.3;
  const isSquishy = target.def < 5;
  const isHighValueCaster = (target.unitClass === 'Mage' || target.unitClass === 'Archer') && target.def < 5;

  let score = 0;

  if (canKill) {
    score += 100;
  }

  if (isHealer) {
    score += 30;
  }

  if (isLowHp) {
    score += 25;
  }

  if (isSquishy) {
    score += 15;
  }

  score += 10 / Math.max(1, distance);

  if (isHighValueCaster) {
    score += 10;
  }

  return {
    targetId: target.id,
    score,
    canKill,
    isHealer,
    isLowHp,
    isSquishy,
    distance
  };
}

export function rankTargets(aiUnit: UnitData, enemies: UnitData[], grid: TerrainType[][]): ThreatScore[] {
  return enemies
    .filter((enemy) => enemy.isAlive)
    .map((enemy) => assessThreat(aiUnit, enemy, grid))
    .sort((a, b) => b.score - a.score || a.distance - b.distance || a.targetId.localeCompare(b.targetId));
}
