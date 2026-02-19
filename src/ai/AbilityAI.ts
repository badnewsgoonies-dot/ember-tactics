import { getAbility } from '../combat/AbilityDefs';
import { canUseAbility, getAoETiles } from '../combat/AbilitySystem';
import type { TerrainType } from '../grid/TileTypes';
import type { UnitData } from '../units/Unit';
import { gridDistance } from '../utils/MathUtils';

export interface AbilityDecision {
  abilityName: string;
  targetX: number;
  targetY: number;
  reason: string;
}

type UnitWithOptionalOrigin = UnitData &
  Partial<{
    originalGridX: number;
    originalGridY: number;
    startGridX: number;
    startGridY: number;
    turnStartX: number;
    turnStartY: number;
  }>;

function hasTile(tiles: Array<{ x: number; y: number }>, x: number, y: number): boolean {
  return tiles.some((tile) => tile.x === x && tile.y === y);
}

function getMovedDistance(unit: UnitData): number {
  const withOrigin = unit as UnitWithOptionalOrigin;
  const originX = withOrigin.originalGridX ?? withOrigin.startGridX ?? withOrigin.turnStartX ?? unit.gridX;
  const originY = withOrigin.originalGridY ?? withOrigin.startGridY ?? withOrigin.turnStartY ?? unit.gridY;

  return gridDistance(originX, originY, unit.gridX, unit.gridY);
}

function decideHealerAbility(
  aiUnit: UnitData,
  allUnits: UnitData[],
  grid: TerrainType[][]
): AbilityDecision | null {
  const woundedAllies = allUnits
    .filter((unit) => unit.isAlive && unit.team === aiUnit.team && unit.currentHp < unit.maxHp)
    .sort((a, b) => a.currentHp / a.maxHp - b.currentHp / b.maxHp);

  if (woundedAllies.length === 0) {
    return null;
  }

  const massHeal = getAbility('MassHeal');
  const heal = getAbility('Heal');

  if (massHeal && canUseAbility(aiUnit, massHeal)) {
    const cols = grid[0]?.length ?? 0;
    const rows = grid.length;
    if (cols <= 0 || rows <= 0) {
      return null;
    }

    const aoeTiles = getAoETiles(
      aiUnit.gridX,
      aiUnit.gridY,
      massHeal.aoeShape,
      massHeal.aoeSize,
      cols,
      rows
    );
    const woundedInAoe = woundedAllies.filter((ally) => hasTile(aoeTiles, ally.gridX, ally.gridY));

    if (woundedInAoe.length >= 2) {
      return {
        abilityName: 'MassHeal',
        targetX: aiUnit.gridX,
        targetY: aiUnit.gridY,
        reason: 'mass-heal-multiple-allies'
      };
    }
  }

  if (heal && canUseAbility(aiUnit, heal)) {
    const bestTarget = woundedAllies.find(
      (ally) => gridDistance(aiUnit.gridX, aiUnit.gridY, ally.gridX, ally.gridY) <= heal.range
    );

    if (bestTarget) {
      return {
        abilityName: 'Heal',
        targetX: bestTarget.gridX,
        targetY: bestTarget.gridY,
        reason: 'heal-most-wounded-ally'
      };
    }
  }

  if (massHeal && canUseAbility(aiUnit, massHeal)) {
    const cols = grid[0]?.length ?? 0;
    const rows = grid.length;
    if (cols <= 0 || rows <= 0) {
      return null;
    }

    const aoeTiles = getAoETiles(
      aiUnit.gridX,
      aiUnit.gridY,
      massHeal.aoeShape,
      massHeal.aoeSize,
      cols,
      rows
    );

    const anyWoundedInAoe = woundedAllies.some((ally) => hasTile(aoeTiles, ally.gridX, ally.gridY));
    if (anyWoundedInAoe) {
      return {
        abilityName: 'MassHeal',
        targetX: aiUnit.gridX,
        targetY: aiUnit.gridY,
        reason: 'mass-heal-single-fallback'
      };
    }
  }

  return null;
}

function getBestAoECenter(
  aiUnit: UnitData,
  enemies: UnitData[],
  abilityName: 'Fireball' | 'RainOfArrows',
  grid: TerrainType[][]
): { x: number; y: number; hitCount: number } | null {
  const ability = getAbility(abilityName);
  if (!ability || !canUseAbility(aiUnit, ability)) {
    return null;
  }

  const cols = grid[0]?.length ?? 0;
  const rows = grid.length;
  if (cols <= 0 || rows <= 0) {
    return null;
  }

  let best: { x: number; y: number; hitCount: number } | null = null;

  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      if (gridDistance(aiUnit.gridX, aiUnit.gridY, x, y) > ability.range) {
        continue;
      }

      const aoeTiles = getAoETiles(x, y, ability.aoeShape, ability.aoeSize, cols, rows);
      const hitCount = enemies.filter((enemy) => hasTile(aoeTiles, enemy.gridX, enemy.gridY)).length;

      if (!best || hitCount > best.hitCount) {
        best = { x, y, hitCount };
      }
    }
  }

  return best;
}

export function decideAbilityUse(
  aiUnit: UnitData,
  allUnits: UnitData[],
  grid: TerrainType[][]
): AbilityDecision | null {
  if (!aiUnit.isAlive) {
    return null;
  }

  if (aiUnit.unitClass === 'Healer') {
    const healerDecision = decideHealerAbility(aiUnit, allUnits, grid);
    if (healerDecision) {
      return healerDecision;
    }
  }

  const enemies = allUnits.filter((unit) => unit.isAlive && unit.team !== aiUnit.team);

  if (aiUnit.ability === 'Fireball' || aiUnit.ability === 'RainOfArrows') {
    const bestCenter = getBestAoECenter(aiUnit, enemies, aiUnit.ability, grid);
    if (bestCenter && bestCenter.hitCount >= 2) {
      return {
        abilityName: aiUnit.ability,
        targetX: bestCenter.x,
        targetY: bestCenter.y,
        reason: `aoe-${bestCenter.hitCount}-targets`
      };
    }

    return null;
  }

  if (aiUnit.ability === 'Charge') {
    const ability = getAbility('Charge');
    const movedDistance = getMovedDistance(aiUnit);
    if (ability && canUseAbility(aiUnit, ability) && movedDistance >= 3) {
      const adjacentEnemy = enemies
        .filter((enemy) => gridDistance(aiUnit.gridX, aiUnit.gridY, enemy.gridX, enemy.gridY) <= 1)
        .sort((a, b) => a.currentHp - b.currentHp)[0];

      if (adjacentEnemy) {
        return {
          abilityName: 'Charge',
          targetX: adjacentEnemy.gridX,
          targetY: adjacentEnemy.gridY,
          reason: 'charge-after-long-move'
        };
      }
    }

    return null;
  }

  if (aiUnit.ability === 'Taunt') {
    const ability = getAbility('Taunt');
    const nearbyEnemies = enemies.filter(
      (enemy) => gridDistance(aiUnit.gridX, aiUnit.gridY, enemy.gridX, enemy.gridY) <= 3
    );
    const enemiesInBasicRange = enemies.filter((enemy) => {
      const distance = gridDistance(aiUnit.gridX, aiUnit.gridY, enemy.gridX, enemy.gridY);
      return distance >= aiUnit.range[0] && distance <= aiUnit.range[1];
    });

    if (
      ability &&
      canUseAbility(aiUnit, ability) &&
      nearbyEnemies.length >= 2 &&
      enemiesInBasicRange.length === 0
    ) {
      return {
        abilityName: 'Taunt',
        targetX: aiUnit.gridX,
        targetY: aiUnit.gridY,
        reason: 'taunt-multiple-nearby-enemies'
      };
    }

    return null;
  }

  if (aiUnit.ability === 'Steal') {
    const ability = getAbility('Steal');
    const stealTarget = enemies.find(
      (enemy) => enemy.items.length > 0 && gridDistance(aiUnit.gridX, aiUnit.gridY, enemy.gridX, enemy.gridY) <= 1
    );

    if (ability && canUseAbility(aiUnit, ability) && stealTarget) {
      return {
        abilityName: 'Steal',
        targetX: stealTarget.gridX,
        targetY: stealTarget.gridY,
        reason: 'steal-adjacent-item-holder'
      };
    }
  }

  return null;
}
