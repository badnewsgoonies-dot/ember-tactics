import { calcDamagePreview } from '../combat/DamageCalculation';
import { applyTerrainToRange } from '../grid/TerrainEffects';
import type { TerrainType } from '../grid/TileTypes';
import type { UnitData } from '../units/Unit';
import { gridDistance } from '../utils/MathUtils';

export interface TargetDecision {
  targetId: string;
  targetUnit: UnitData;
  score: number;
  reason: string;
}

interface Reachability {
  canAttack: boolean;
  canKill: boolean;
  nearestDistance: number;
}

function getTerrainAt(grid: TerrainType[][], x: number, y: number): TerrainType {
  return grid[y]?.[x] ?? 'Plains';
}

function getClassKillPriority(unitClass: UnitData['unitClass']): number {
  if (unitClass === 'Healer') {
    return 4;
  }

  if (unitClass === 'Mage') {
    return 3;
  }

  if (unitClass === 'Archer') {
    return 2;
  }

  return 1;
}

function evaluateReachability(
  aiUnit: UnitData,
  enemy: UnitData,
  grid: TerrainType[][],
  reachableTiles: Array<{ x: number; y: number }>
): Reachability {
  const targetTerrain = getTerrainAt(grid, enemy.gridX, enemy.gridY);
  const preview = calcDamagePreview(aiUnit, enemy, targetTerrain);
  let canAttack = false;
  let nearestDistance = Number.POSITIVE_INFINITY;

  for (const tile of reachableTiles) {
    const attackerTerrain = getTerrainAt(grid, tile.x, tile.y);
    const [minRange, maxRange] = applyTerrainToRange(
      attackerTerrain,
      aiUnit.range[0],
      aiUnit.range[1],
      aiUnit.unitClass
    );
    const distance = gridDistance(tile.x, tile.y, enemy.gridX, enemy.gridY);

    if (distance >= minRange && distance <= maxRange) {
      canAttack = true;
      nearestDistance = Math.min(nearestDistance, distance);
    }
  }

  return {
    canAttack,
    canKill: canAttack && preview.maxDamage >= enemy.currentHp,
    nearestDistance: Number.isFinite(nearestDistance) ? nearestDistance : 999
  };
}

export function selectTarget(
  aiUnit: UnitData,
  enemies: UnitData[],
  grid: TerrainType[][],
  reachableTiles: { x: number; y: number }[]
): TargetDecision | null {
  const aliveEnemies = enemies.filter((enemy) => enemy.isAlive);
  const inRange = aliveEnemies
    .map((enemy) => ({ enemy, reachability: evaluateReachability(aiUnit, enemy, grid, reachableTiles) }))
    .filter(({ reachability }) => reachability.canAttack);

  if (inRange.length === 0) {
    return null;
  }

  const killShots = inRange.filter(({ reachability }) => reachability.canKill);
  if (killShots.length > 0) {
    const bestKill = killShots.sort((a, b) => {
      const classDelta = getClassKillPriority(b.enemy.unitClass) - getClassKillPriority(a.enemy.unitClass);
      if (classDelta !== 0) {
        return classDelta;
      }

      const lowHpDelta = a.enemy.currentHp - b.enemy.currentHp;
      if (lowHpDelta !== 0) {
        return lowHpDelta;
      }

      return a.reachability.nearestDistance - b.reachability.nearestDistance;
    })[0];

    return {
      targetId: bestKill.enemy.id,
      targetUnit: bestKill.enemy,
      score: 1000 + getClassKillPriority(bestKill.enemy.unitClass),
      reason: `kill-shot-${bestKill.enemy.unitClass.toLowerCase()}`
    };
  }

  const healerTargets = inRange.filter(({ enemy }) => enemy.unitClass === 'Healer');
  if (healerTargets.length > 0) {
    const bestHealer = healerTargets.sort(
      (a, b) => a.reachability.nearestDistance - b.reachability.nearestDistance || a.enemy.currentHp - b.enemy.currentHp
    )[0];

    return {
      targetId: bestHealer.enemy.id,
      targetUnit: bestHealer.enemy,
      score: 800,
      reason: 'healer-in-range'
    };
  }

  const lowHpTargets = inRange.filter(({ enemy }) => enemy.currentHp < enemy.maxHp * 0.3);
  if (lowHpTargets.length > 0) {
    const bestLowHp = lowHpTargets.sort(
      (a, b) => a.enemy.currentHp - b.enemy.currentHp || a.reachability.nearestDistance - b.reachability.nearestDistance
    )[0];

    return {
      targetId: bestLowHp.enemy.id,
      targetUnit: bestLowHp.enemy,
      score: 600,
      reason: 'low-hp'
    };
  }

  const squishyTargets = inRange.filter(({ enemy }) => enemy.def < 5);
  if (squishyTargets.length > 0) {
    const bestSquishy = squishyTargets.sort(
      (a, b) => a.enemy.def - b.enemy.def || a.reachability.nearestDistance - b.reachability.nearestDistance
    )[0];

    return {
      targetId: bestSquishy.enemy.id,
      targetUnit: bestSquishy.enemy,
      score: 400,
      reason: 'squishy'
    };
  }

  const nearest = inRange.sort(
    (a, b) => a.reachability.nearestDistance - b.reachability.nearestDistance || a.enemy.currentHp - b.enemy.currentHp
  )[0];

  return {
    targetId: nearest.enemy.id,
    targetUnit: nearest.enemy,
    score: 200,
    reason: 'nearest'
  };
}
