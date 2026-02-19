import { getLevelDialogue, type LevelDialogue } from './DialogueData';
import { LEVELS, type LevelDef, type LevelUnitDef } from './LevelDefs';
import type { ReinforcementWave } from './ReinforcementSystem';
import { createAllyUnit, createBossUnit, createEnemyUnit, createPlayerUnit } from '../units/UnitFactory';
import type { Team, UnitData } from '../units/Unit';
import { LEVEL_8_EXTRA_WAVES } from './level8-data';
import { LEVEL_10_EXTRA_WAVES } from './level10-data';
import { LEVEL_13_EXTRA_WAVES } from './level13-data';
import { LEVEL_15_EXTRA_WAVES } from './level15-data';

export interface LevelState {
  levelId: number;
  units: UnitData[];
  objectiveType: string;
  objectiveTarget?: string;
  reinforcementWaves: ReinforcementWave[];
  dialogue: LevelDialogue;
  started: boolean;
  completed: boolean;
}

function createUnitsForTeam(defs: LevelUnitDef[], team: Team, prefix: string): UnitData[] {
  return defs.map((def, idx) => {
    const id = `${prefix}-${idx + 1}`;

    if (team === 'player') {
      return createPlayerUnit(id, def.name, def.unitClass, def.level, def.gridX, def.gridY);
    }

    if (team === 'ally') {
      return createAllyUnit(id, def.name, def.unitClass, def.level, def.gridX, def.gridY);
    }

    if (def.isBoss) {
      return createBossUnit(id, def.name, def.unitClass, def.level, def.gridX, def.gridY);
    }

    return createEnemyUnit(id, def.name, def.unitClass, def.level, def.gridX, def.gridY);
  });
}

export function getLevelDef(levelId: number): LevelDef | undefined {
  return LEVELS.find((level) => level.id === levelId);
}

export function initLevel(levelId: number): LevelState {
  const def = getLevelDef(levelId);
  if (!def) {
    throw new Error(`Unknown level id: ${levelId}`);
  }

  const playerUnits = createUnitsForTeam(def.playerUnits, 'player', `l${levelId}-p`);
  const allyUnits = createUnitsForTeam(def.allyUnits ?? [], 'ally', `l${levelId}-a`);
  const enemyUnits = createUnitsForTeam(def.enemyUnits, 'enemy', `l${levelId}-e`);

  const reinforcementWaves: ReinforcementWave[] = def.reinforcements
    ? [
        {
          turn: def.reinforcements.turn,
          units: def.reinforcements.units,
          spawned: false
        }
      ]
    : [];

  // Add extra reinforcement waves for levels with multiple waves
  if (def.id === 8) {
    for (const wave of LEVEL_8_EXTRA_WAVES) {
      reinforcementWaves.push({ turn: wave.turn, units: wave.units, spawned: false });
    }
  }
  if (def.id === 10) {
    for (const wave of LEVEL_10_EXTRA_WAVES) {
      reinforcementWaves.push({ turn: wave.turn, units: wave.units, spawned: false });
    }
  }
  if (def.id === 13) {
    for (const wave of LEVEL_13_EXTRA_WAVES) {
      reinforcementWaves.push({ turn: wave.turn, units: wave.units, spawned: false });
    }
  }
  if (def.id === 15) {
    for (const wave of LEVEL_15_EXTRA_WAVES) {
      reinforcementWaves.push({ turn: wave.turn, units: wave.units, spawned: false });
    }
  }

  return {
    levelId: def.id,
    units: [...playerUnits, ...allyUnits, ...enemyUnits],
    objectiveType: def.objectiveType,
    objectiveTarget: def.objectiveTarget,
    reinforcementWaves,
    dialogue: getLevelDialogue(def.id),
    started: false,
    completed: false
  };
}
