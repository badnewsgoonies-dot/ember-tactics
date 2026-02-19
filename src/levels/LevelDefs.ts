import type { TerrainType } from '../grid/TileTypes';
import { getMap1, getMap2, getMap3, getMap4, getMap5 } from './MapData';
import { getMap6 } from './level6-data';
import { getMap7 } from './level7-data';
import { getMap8 } from './level8-data';
import { getMap9 } from './level9-data';
import { getMap10 } from './level10-data';
import type { UnitClass } from '../units/UnitClasses';
import { LEVEL_6_DEF } from './level6-data';
import { LEVEL_7_DEF } from './level7-data';
import { LEVEL_8_DEF } from './level8-data';
import { LEVEL_9_DEF } from './level9-data';
import { LEVEL_10_DEF } from './level10-data';
import { LEVEL_11_DEF } from './level11-data';
import { LEVEL_12_DEF } from './level12-data';
import { LEVEL_13_DEF } from './level13-data';
import { LEVEL_14_DEF } from './level14-data';
import { LEVEL_15_DEF } from './level15-data';

export interface LevelUnitDef {
  name: string;
  unitClass: UnitClass;
  level: number;
  gridX: number;
  gridY: number;
  personality?: string;
  isBoss?: boolean;
}

export interface LevelDef {
  id: number;
  name: string;
  description: string;
  mapGetter: () => TerrainType[][];
  playerUnits: LevelUnitDef[];
  enemyUnits: LevelUnitDef[];
  allyUnits?: LevelUnitDef[];
  objectiveType: 'defeat_all' | 'defeat_boss' | 'survive' | 'escort';
  objectiveTarget?: string;
  reinforcements?: { turn: number; units: LevelUnitDef[] };
  starCriteria: { turns: number; unitsLost: number };
}

export const LEVELS: LevelDef[] = [
  {
    id: 1,
    name: 'First Flames',
    description: 'A first deployment on open terrain to establish battlefield discipline.',
    mapGetter: getMap1,
    playerUnits: [
      { name: 'Aldric', unitClass: 'Knight', level: 1, gridX: 2, gridY: 5, personality: 'Leader' },
      { name: 'Lyra', unitClass: 'Archer', level: 1, gridX: 1, gridY: 4, personality: 'Calm' },
      { name: 'Mira', unitClass: 'Healer', level: 1, gridX: 1, gridY: 6, personality: 'Supportive' }
    ],
    enemyUnits: [
      { name: 'Raider 1', unitClass: 'Knight', level: 1, gridX: 12, gridY: 4, personality: 'Aggressive' },
      { name: 'Raider 2', unitClass: 'Knight', level: 1, gridX: 12, gridY: 5, personality: 'Aggressive' },
      { name: 'Raider 3', unitClass: 'Knight', level: 1, gridX: 12, gridY: 6, personality: 'Aggressive' }
    ],
    objectiveType: 'defeat_all',
    starCriteria: { turns: 8, unitsLost: 0 }
  },
  {
    id: 2,
    name: 'Forest Ambush',
    description: 'Dense woods and a river crossing force careful positioning.',
    mapGetter: getMap2,
    playerUnits: [
      { name: 'Aldric', unitClass: 'Knight', level: 2, gridX: 1, gridY: 5, personality: 'Leader' },
      { name: 'Lyra', unitClass: 'Archer', level: 2, gridX: 0, gridY: 4, personality: 'Calm' },
      { name: 'Seren', unitClass: 'Mage', level: 2, gridX: 0, gridY: 6, personality: 'Analytical' },
      { name: 'Mira', unitClass: 'Healer', level: 2, gridX: 1, gridY: 7, personality: 'Supportive' }
    ],
    enemyUnits: [
      { name: 'Sniper 1', unitClass: 'Archer', level: 2, gridX: 10, gridY: 2, personality: 'Patient' },
      { name: 'Sniper 2', unitClass: 'Archer', level: 2, gridX: 10, gridY: 4, personality: 'Patient' },
      { name: 'Sniper 3', unitClass: 'Archer', level: 2, gridX: 10, gridY: 6, personality: 'Patient' },
      { name: 'Sniper 4', unitClass: 'Archer', level: 2, gridX: 10, gridY: 8, personality: 'Patient' },
      { name: 'Shadeblade 1', unitClass: 'Thief', level: 2, gridX: 8, gridY: 3, personality: 'Flanker' },
      { name: 'Shadeblade 2', unitClass: 'Thief', level: 2, gridX: 8, gridY: 7, personality: 'Flanker' }
    ],
    objectiveType: 'defeat_all',
    starCriteria: { turns: 10, unitsLost: 1 }
  },
  {
    id: 3,
    name: 'Bridge of Ashvale',
    description: 'Escort merchant Galen through a contested bridge chokepoint.',
    mapGetter: getMap3,
    playerUnits: [
      { name: 'Aldric', unitClass: 'Knight', level: 3, gridX: 2, gridY: 5, personality: 'Leader' },
      { name: 'Rowan', unitClass: 'Cavalier', level: 3, gridX: 2, gridY: 3, personality: 'Bold' },
      { name: 'Mira', unitClass: 'Healer', level: 3, gridX: 2, gridY: 7, personality: 'Supportive' },
      { name: 'Lyra', unitClass: 'Archer', level: 3, gridX: 1, gridY: 5, personality: 'Calm' }
    ],
    allyUnits: [{ name: 'Galen', unitClass: 'Knight', level: 1, gridX: 3, gridY: 5, personality: 'Panicked' }],
    enemyUnits: [
      { name: 'Bridgeguard 1', unitClass: 'Knight', level: 3, gridX: 10, gridY: 4, personality: 'Aggressive' },
      { name: 'Bridgeguard 2', unitClass: 'Knight', level: 3, gridX: 10, gridY: 6, personality: 'Aggressive' },
      { name: 'Crossbow 1', unitClass: 'Archer', level: 3, gridX: 11, gridY: 3, personality: 'Patient' },
      { name: 'Crossbow 2', unitClass: 'Archer', level: 3, gridX: 11, gridY: 7, personality: 'Patient' },
      { name: 'Ash Mage', unitClass: 'Mage', level: 3, gridX: 11, gridY: 5, personality: 'Controller' }
    ],
    objectiveType: 'escort',
    objectiveTarget: 'Galen',
    starCriteria: { turns: 12, unitsLost: 0 }
  },
  {
    id: 4,
    name: 'Crimson Dusk',
    description: 'A ruined village erupts into a two-sided assault with reinforcements.',
    mapGetter: getMap4,
    playerUnits: [
      { name: 'Aldric', unitClass: 'Knight', level: 4, gridX: 1, gridY: 4, personality: 'Leader' },
      { name: 'Lyra', unitClass: 'Archer', level: 4, gridX: 0, gridY: 2, personality: 'Calm' },
      { name: 'Seren', unitClass: 'Mage', level: 4, gridX: 0, gridY: 6, personality: 'Analytical' },
      { name: 'Mira', unitClass: 'Healer', level: 4, gridX: 1, gridY: 7, personality: 'Supportive' },
      { name: 'Shade', unitClass: 'Thief', level: 4, gridX: 2, gridY: 5, personality: 'Flanker' }
    ],
    enemyUnits: [
      { name: 'Marauder', unitClass: 'Knight', level: 4, gridX: 12, gridY: 4, personality: 'Aggressive' },
      { name: 'Longbow', unitClass: 'Archer', level: 4, gridX: 13, gridY: 3, personality: 'Patient' },
      { name: 'Hexer', unitClass: 'Mage', level: 4, gridX: 12, gridY: 7, personality: 'Controller' },
      { name: 'Knifewind', unitClass: 'Thief', level: 4, gridX: 13, gridY: 6, personality: 'Flanker' }
    ],
    reinforcements: {
      turn: 3,
      units: [
        { name: 'Reaver East', unitClass: 'Knight', level: 4, gridX: 14, gridY: 1, personality: 'Aggressive' },
        { name: 'Reaver South', unitClass: 'Archer', level: 4, gridX: 14, gridY: 8, personality: 'Patient' },
        { name: 'Reaver West', unitClass: 'Thief', level: 4, gridX: 0, gridY: 9, personality: 'Flanker' },
        { name: 'Reaver Center', unitClass: 'Mage', level: 4, gridX: 7, gridY: 9, personality: 'Controller' }
      ]
    },
    objectiveType: 'defeat_all',
    starCriteria: { turns: 14, unitsLost: 1 }
  },
  {
    id: 5,
    name: 'The Ember King',
    description: 'Storm the throne room and defeat the Ember King before he overwhelms the squad.',
    mapGetter: getMap5,
    playerUnits: [
      { name: 'Aldric', unitClass: 'Knight', level: 5, gridX: 3, gridY: 8, personality: 'Leader' },
      { name: 'Lyra', unitClass: 'Archer', level: 5, gridX: 4, gridY: 7, personality: 'Calm' },
      { name: 'Seren', unitClass: 'Mage', level: 5, gridX: 5, gridY: 8, personality: 'Analytical' },
      { name: 'Mira', unitClass: 'Healer', level: 5, gridX: 4, gridY: 9, personality: 'Supportive' },
      { name: 'Rowan', unitClass: 'Cavalier', level: 5, gridX: 2, gridY: 8, personality: 'Bold' },
      { name: 'Shade', unitClass: 'Thief', level: 5, gridX: 6, gridY: 9, personality: 'Flanker' }
    ],
    enemyUnits: [
      {
        name: 'Ember King',
        unitClass: 'Mage',
        level: 8,
        gridX: 7,
        gridY: 1,
        personality: 'Boss',
        isBoss: true
      },
      { name: 'Royal Guard 1', unitClass: 'Knight', level: 5, gridX: 6, gridY: 2, personality: 'Guard' },
      { name: 'Royal Guard 2', unitClass: 'Knight', level: 5, gridX: 8, gridY: 2, personality: 'Guard' },
      { name: 'Royal Guard 3', unitClass: 'Knight', level: 5, gridX: 7, gridY: 3, personality: 'Guard' },
      { name: 'Royal Priest 1', unitClass: 'Healer', level: 5, gridX: 5, gridY: 2, personality: 'Supportive' },
      { name: 'Royal Priest 2', unitClass: 'Healer', level: 5, gridX: 9, gridY: 2, personality: 'Supportive' }
    ],
    objectiveType: 'defeat_boss',
    objectiveTarget: 'Ember King',
    starCriteria: { turns: 16, unitsLost: 0 }
  },
  LEVEL_6_DEF as LevelDef,
  LEVEL_7_DEF as LevelDef,
  LEVEL_8_DEF as LevelDef,
  LEVEL_9_DEF as LevelDef,
  LEVEL_10_DEF as LevelDef,
  LEVEL_11_DEF as LevelDef,
  LEVEL_12_DEF as LevelDef,
  LEVEL_13_DEF as LevelDef,
  LEVEL_14_DEF as LevelDef,
  LEVEL_15_DEF as LevelDef
];
