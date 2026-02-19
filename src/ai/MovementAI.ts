import { applyTerrainToRange, getDefenseBonus } from '../grid/TerrainEffects';
import type { TerrainType } from '../grid/TileTypes';
import type { UnitData } from '../units/Unit';
import { gridDistance } from '../utils/MathUtils';
import { getAIConfig, getDefaultPersonality } from './AIPersonality';

export interface MoveDecision {
  targetX: number;
  targetY: number;
  reason: string;
}

function tileKey(x: number, y: number): string {
  return `${x},${y}`;
}

function getTerrainAt(grid: TerrainType[][], x: number, y: number): TerrainType {
  return grid[y]?.[x] ?? 'Plains';
}

function getTerrainPreference(terrain: TerrainType): number {
  if (terrain === 'Fort') {
    return 4;
  }

  if (terrain === 'Forest') {
    return 3;
  }

  if (terrain === 'Hill') {
    return 2;
  }

  if (terrain === 'Plains') {
    return 1;
  }

  return 0;
}

function getCandidateTiles(
  aiUnit: UnitData,
  allUnits: UnitData[],
  movementRange: Array<{ x: number; y: number }>
): Array<{ x: number; y: number }> {
  const occupied = new Set(
    allUnits
      .filter((unit) => unit.isAlive && unit.id !== aiUnit.id)
      .map((unit) => tileKey(unit.gridX, unit.gridY))
  );

  return movementRange.filter(
    (tile) => !occupied.has(tileKey(tile.x, tile.y)) || (tile.x === aiUnit.gridX && tile.y === aiUnit.gridY)
  );
}

function pickRetreatTile(
  aiUnit: UnitData,
  candidateTiles: Array<{ x: number; y: number }>,
  nearestEnemy: UnitData,
  allies: UnitData[],
  grid: TerrainType[][]
): MoveDecision {
  const bestTile = candidateTiles
    .map((tile) => {
      const enemyDistance = gridDistance(tile.x, tile.y, nearestEnemy.gridX, nearestEnemy.gridY);
      const closestAllyDistance = allies.reduce((min, ally) => {
        return Math.min(min, gridDistance(tile.x, tile.y, ally.gridX, ally.gridY));
      }, Number.POSITIVE_INFINITY);

      const behindAlly = allies.some((ally) => {
        const allyEnemyDistance = gridDistance(ally.gridX, ally.gridY, nearestEnemy.gridX, nearestEnemy.gridY);
        return closestAllyDistance <= 1 && enemyDistance > allyEnemyDistance;
      });

      const terrain = getTerrainAt(grid, tile.x, tile.y);
      const terrainPref = getTerrainPreference(terrain);
      const defenseBonus = getDefenseBonus(terrain);

      return {
        tile,
        enemyDistance,
        closestAllyDistance,
        behindAlly,
        terrainPref,
        defenseBonus
      };
    })
    .sort((a, b) => {
      if (a.behindAlly !== b.behindAlly) {
        return a.behindAlly ? -1 : 1;
      }

      if (b.enemyDistance !== a.enemyDistance) {
        return b.enemyDistance - a.enemyDistance;
      }

      if (a.closestAllyDistance !== b.closestAllyDistance) {
        return a.closestAllyDistance - b.closestAllyDistance;
      }

      if (b.terrainPref !== a.terrainPref) {
        return b.terrainPref - a.terrainPref;
      }

      return b.defenseBonus - a.defenseBonus;
    })[0];

  if (!bestTile) {
    return {
      targetX: aiUnit.gridX,
      targetY: aiUnit.gridY,
      reason: 'retreat-hold'
    };
  }

  return {
    targetX: bestTile.tile.x,
    targetY: bestTile.tile.y,
    reason: bestTile.behindAlly ? 'retreat-behind-ally' : 'retreat-away'
  };
}

function pickRangedTile(
  aiUnit: UnitData,
  target: UnitData,
  candidateTiles: Array<{ x: number; y: number }>,
  grid: TerrainType[][]
): MoveDecision {
  const inRangeTiles = candidateTiles
    .map((tile) => {
      const terrain = getTerrainAt(grid, tile.x, tile.y);
      const [minRange, maxRange] = applyTerrainToRange(terrain, aiUnit.range[0], aiUnit.range[1], aiUnit.unitClass);
      const distance = gridDistance(tile.x, tile.y, target.gridX, target.gridY);

      return {
        tile,
        distance,
        minRange,
        maxRange,
        terrainPref: getTerrainPreference(terrain),
        defenseBonus: getDefenseBonus(terrain)
      };
    })
    .filter((item) => item.distance >= item.minRange && item.distance <= item.maxRange);

  if (inRangeTiles.length > 0) {
    const best = inRangeTiles.sort((a, b) => {
      if (b.distance !== a.distance) {
        return b.distance - a.distance;
      }

      if (b.terrainPref !== a.terrainPref) {
        return b.terrainPref - a.terrainPref;
      }

      return b.defenseBonus - a.defenseBonus;
    })[0];

    return {
      targetX: best.tile.x,
      targetY: best.tile.y,
      reason: 'ranged-max-range'
    };
  }

  const fallback = candidateTiles
    .map((tile) => {
      const terrain = getTerrainAt(grid, tile.x, tile.y);
      return {
        tile,
        distance: gridDistance(tile.x, tile.y, target.gridX, target.gridY),
        terrainPref: getTerrainPreference(terrain)
      };
    })
    .sort((a, b) => a.distance - b.distance || b.terrainPref - a.terrainPref)[0];

  return {
    targetX: fallback?.tile.x ?? aiUnit.gridX,
    targetY: fallback?.tile.y ?? aiUnit.gridY,
    reason: 'ranged-approach'
  };
}

function pickMeleeTile(
  aiUnit: UnitData,
  target: UnitData,
  candidateTiles: Array<{ x: number; y: number }>,
  grid: TerrainType[][]
): MoveDecision {
  const adjacentTiles = candidateTiles
    .map((tile) => {
      const terrain = getTerrainAt(grid, tile.x, tile.y);
      return {
        tile,
        distance: gridDistance(tile.x, tile.y, target.gridX, target.gridY),
        terrainPref: getTerrainPreference(terrain),
        defenseBonus: getDefenseBonus(terrain),
        moveDistance: gridDistance(tile.x, tile.y, aiUnit.gridX, aiUnit.gridY)
      };
    })
    .filter((item) => item.distance === 1);

  if (adjacentTiles.length > 0) {
    const best = adjacentTiles.sort((a, b) => {
      if (b.terrainPref !== a.terrainPref) {
        return b.terrainPref - a.terrainPref;
      }

      if (b.defenseBonus !== a.defenseBonus) {
        return b.defenseBonus - a.defenseBonus;
      }

      return a.moveDistance - b.moveDistance;
    })[0];

    return {
      targetX: best.tile.x,
      targetY: best.tile.y,
      reason: 'melee-engage'
    };
  }

  const fallback = candidateTiles
    .map((tile) => ({
      tile,
      distance: gridDistance(tile.x, tile.y, target.gridX, target.gridY),
      terrainPref: getTerrainPreference(getTerrainAt(grid, tile.x, tile.y))
    }))
    .sort((a, b) => a.distance - b.distance || b.terrainPref - a.terrainPref)[0];

  return {
    targetX: fallback?.tile.x ?? aiUnit.gridX,
    targetY: fallback?.tile.y ?? aiUnit.gridY,
    reason: 'melee-approach'
  };
}

function pickEnemyCenterTile(
  aiUnit: UnitData,
  candidateTiles: Array<{ x: number; y: number }>,
  enemies: UnitData[],
  grid: TerrainType[][]
): MoveDecision {
  if (enemies.length === 0) {
    return {
      targetX: aiUnit.gridX,
      targetY: aiUnit.gridY,
      reason: 'hold-position'
    };
  }

  const centerX = enemies.reduce((sum, unit) => sum + unit.gridX, 0) / enemies.length;
  const centerY = enemies.reduce((sum, unit) => sum + unit.gridY, 0) / enemies.length;

  const best = candidateTiles
    .map((tile) => {
      const terrain = getTerrainAt(grid, tile.x, tile.y);
      return {
        tile,
        centerDistance: Math.abs(tile.x - centerX) + Math.abs(tile.y - centerY),
        terrainPref: getTerrainPreference(terrain),
        defenseBonus: getDefenseBonus(terrain)
      };
    })
    .sort((a, b) => {
      if (a.centerDistance !== b.centerDistance) {
        return a.centerDistance - b.centerDistance;
      }

      if (b.terrainPref !== a.terrainPref) {
        return b.terrainPref - a.terrainPref;
      }

      return b.defenseBonus - a.defenseBonus;
    })[0];

  return {
    targetX: best?.tile.x ?? aiUnit.gridX,
    targetY: best?.tile.y ?? aiUnit.gridY,
    reason: 'advance-to-enemy-group'
  };
}

export function decideMovePosition(
  aiUnit: UnitData,
  target: UnitData | null,
  allUnits: UnitData[],
  grid: TerrainType[][],
  movementRange: { x: number; y: number }[]
): MoveDecision {
  const candidateTiles = getCandidateTiles(aiUnit, allUnits, movementRange);

  if (candidateTiles.length === 0) {
    return {
      targetX: aiUnit.gridX,
      targetY: aiUnit.gridY,
      reason: 'blocked-hold'
    };
  }

  const personality = getDefaultPersonality(aiUnit.unitClass);
  const config = getAIConfig(personality);
  const hpRatio = aiUnit.maxHp > 0 ? aiUnit.currentHp / aiUnit.maxHp : 0;
  const enemies = allUnits.filter((unit) => unit.isAlive && unit.team !== aiUnit.team);
  const allies = allUnits.filter((unit) => unit.isAlive && unit.team === aiUnit.team && unit.id !== aiUnit.id);

  const nearestEnemy = enemies
    .map((enemy) => ({ enemy, distance: gridDistance(aiUnit.gridX, aiUnit.gridY, enemy.gridX, enemy.gridY) }))
    .sort((a, b) => a.distance - b.distance)[0]?.enemy;

  const shouldRetreat = hpRatio < 0.3 && hpRatio <= config.retreatThreshold && Boolean(nearestEnemy);
  if (shouldRetreat && nearestEnemy) {
    return pickRetreatTile(aiUnit, candidateTiles, nearestEnemy, allies, grid);
  }

  if (target) {
    const isRanged = aiUnit.range[1] > 1;
    if (isRanged) {
      return pickRangedTile(aiUnit, target, candidateTiles, grid);
    }

    return pickMeleeTile(aiUnit, target, candidateTiles, grid);
  }

  return pickEnemyCenterTile(aiUnit, candidateTiles, enemies, grid);
}
