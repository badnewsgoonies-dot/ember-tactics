import type { TerrainType } from '../grid/TileTypes';
import type { UnitClass } from '../units/UnitClasses';

type TerrainCode = 'P' | 'F' | 'H' | 'W' | 'M' | 'B' | 'T' | 'R';

const CODE_TO_TERRAIN: Record<TerrainCode, TerrainType> = {
  P: 'Plains', F: 'Forest', H: 'Hill', W: 'Water',
  M: 'Mountain', B: 'Bridge', T: 'Fort', R: 'Fire'
};

function decodeRow(row: string): TerrainType[] {
  return row.split('').map((c) => CODE_TO_TERRAIN[c as TerrainCode]);
}

function decodeMap(rows: string[]): TerrainType[][] {
  return rows.map((r) => decodeRow(r));
}

// Level 8: "Siege of Ironhold" — Fortress defense with forts on west, open approach, hills
export function getMap8(): TerrainType[][] {
  return decodeMap([
    'MMTTPPPPPPPPPHH',
    'MTPPPPPPPPPPPPH',
    'TPPPPHPPPPPPPHP',
    'TPPPPPPPPPPPPPP',
    'TPPPHPPPPPHHPPP',
    'TPPPHPPPPPHHPPP',
    'TPPPPPPPPPPPPPP',
    'TPPPPHPPPPPPPHP',
    'MTPPPPPPPPPPPPH',
    'MMTTPPPPPPPPPHH'
  ]);
}

interface LevelUnitDef {
  name: string;
  unitClass: UnitClass;
  level: number;
  gridX: number;
  gridY: number;
  personality?: string;
  isBoss?: boolean;
}

export const LEVEL_8_DEF = {
  id: 8,
  name: 'Siege of Ironhold',
  description: 'Defend the fortress of Ironhold against waves of attackers for eight turns.',
  mapGetter: getMap8,
  playerUnits: [
    { name: 'Aldric', unitClass: 'Knight' as UnitClass, level: 8, gridX: 1, gridY: 3, personality: 'Leader' },
    { name: 'Lyra', unitClass: 'Archer' as UnitClass, level: 8, gridX: 0, gridY: 2, personality: 'Calm' },
    { name: 'Seren', unitClass: 'Mage' as UnitClass, level: 8, gridX: 0, gridY: 7, personality: 'Analytical' },
    { name: 'Mira', unitClass: 'Healer' as UnitClass, level: 8, gridX: 1, gridY: 5, personality: 'Supportive' },
    { name: 'Rowan', unitClass: 'Cavalier' as UnitClass, level: 8, gridX: 1, gridY: 6, personality: 'Bold' }
  ] as LevelUnitDef[],
  enemyUnits: [
    { name: 'Siege Knight 1', unitClass: 'Knight' as UnitClass, level: 7, gridX: 12, gridY: 3, personality: 'Aggressive' },
    { name: 'Siege Knight 2', unitClass: 'Knight' as UnitClass, level: 7, gridX: 12, gridY: 6, personality: 'Aggressive' },
    { name: 'Siege Archer 1', unitClass: 'Archer' as UnitClass, level: 7, gridX: 13, gridY: 2, personality: 'Patient' },
    { name: 'Siege Archer 2', unitClass: 'Archer' as UnitClass, level: 7, gridX: 13, gridY: 7, personality: 'Patient' },
    { name: 'Siege Mage', unitClass: 'Mage' as UnitClass, level: 7, gridX: 14, gridY: 4, personality: 'Controller' },
    { name: 'Siege Cavalier 1', unitClass: 'Cavalier' as UnitClass, level: 7, gridX: 14, gridY: 1, personality: 'Bold' },
    { name: 'Siege Cavalier 2', unitClass: 'Cavalier' as UnitClass, level: 7, gridX: 14, gridY: 8, personality: 'Bold' },
    { name: 'Siege Thief', unitClass: 'Thief' as UnitClass, level: 7, gridX: 13, gridY: 5, personality: 'Flanker' }
  ] as LevelUnitDef[],
  reinforcements: {
    turn: 2,
    units: [
      { name: 'Wave 2 Knight', unitClass: 'Knight' as UnitClass, level: 7, gridX: 14, gridY: 3, personality: 'Aggressive' },
      { name: 'Wave 2 Archer', unitClass: 'Archer' as UnitClass, level: 7, gridX: 14, gridY: 6, personality: 'Patient' }
    ] as LevelUnitDef[]
  },
  objectiveType: 'survive' as const,
  objectiveTarget: '8',
  starCriteria: { turns: 8, unitsLost: 1 }
};

// Extra reinforcement wave for turn 5 — integration step will wire this into LevelManager
export const LEVEL_8_EXTRA_WAVES = [
  {
    turn: 5,
    units: [
      { name: 'Wave 3 Cavalier', unitClass: 'Cavalier' as UnitClass, level: 8, gridX: 14, gridY: 2, personality: 'Bold' },
      { name: 'Wave 3 Mage', unitClass: 'Mage' as UnitClass, level: 8, gridX: 14, gridY: 5, personality: 'Controller' },
      { name: 'Wave 3 Knight', unitClass: 'Knight' as UnitClass, level: 8, gridX: 14, gridY: 7, personality: 'Aggressive' }
    ] as LevelUnitDef[]
  }
];

export const LEVEL_8_DIALOGUE = {
  pre: [
    { speaker: 'Commander Aldric', portrait: 'aldric', text: 'Ironhold is all that stands between them and the heartland. We hold here.' },
    { speaker: 'Rowan', portrait: 'rowan', text: 'Walls are strong, but there are too many of them out there.' },
    { speaker: 'Lyra', portrait: 'lyra', text: 'I count at least eight. More behind the ridge.' },
    { speaker: 'Commander Aldric', portrait: 'aldric', text: 'Eight turns. That is all the garrison needs to reinforce. Hold the line.' }
  ],
  midTriggerTurn: 5,
  mid: [
    { speaker: 'Seren', portrait: 'seren', text: 'Another wave! They are throwing everything at us!' },
    { speaker: 'Commander Aldric', portrait: 'aldric', text: 'Three more turns! Nobody falls back, nobody breaks!' },
    { speaker: 'Mira', portrait: 'mira', text: 'I will keep you all standing. Just hold your ground!' }
  ],
  post: [
    { speaker: 'Rowan', portrait: 'rowan', text: 'The horns! The garrison is here!' },
    { speaker: 'Commander Aldric', portrait: 'aldric', text: 'Ironhold stands. Every one of you earned this victory.' },
    { speaker: 'Lyra', portrait: 'lyra', text: 'I never want to count that many enemies again.' },
    { speaker: 'Mira', portrait: 'mira', text: 'Rest now. We survived.' }
  ]
};
