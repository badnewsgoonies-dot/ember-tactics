import { createBossUnit, createEnemyUnit } from '../units/UnitFactory';
import type { UnitData } from '../units/Unit';
import type { LevelUnitDef } from './LevelDefs';

export interface ReinforcementWave {
  turn: number;
  units: LevelUnitDef[];
  spawned: boolean;
}

export function checkReinforcements(
  waves: ReinforcementWave[],
  currentTurn: number
): { unitsToSpawn: LevelUnitDef[]; updatedWaves: ReinforcementWave[] } {
  const unitsToSpawn: LevelUnitDef[] = [];

  const updatedWaves = waves.map((wave) => {
    if (!wave.spawned && currentTurn >= wave.turn) {
      unitsToSpawn.push(...wave.units);
      return {
        ...wave,
        spawned: true
      };
    }

    return wave;
  });

  return {
    unitsToSpawn,
    updatedWaves
  };
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'enemy';
}

function nextUniqueId(base: string, usedIds: Set<string>): string {
  let counter = 1;
  let candidate = `${base}-${counter}`;

  while (usedIds.has(candidate)) {
    counter += 1;
    candidate = `${base}-${counter}`;
  }

  usedIds.add(candidate);
  return candidate;
}

export function spawnReinforcements(defs: LevelUnitDef[], existingIds: string[]): UnitData[] {
  const usedIds = new Set(existingIds);

  return defs.map((def) => {
    const idBase = `e-rf-${slugify(def.name)}`;
    const id = nextUniqueId(idBase, usedIds);

    if (def.isBoss) {
      return createBossUnit(id, def.name, def.unitClass, def.level, def.gridX, def.gridY);
    }

    return createEnemyUnit(id, def.name, def.unitClass, def.level, def.gridX, def.gridY);
  });
}
