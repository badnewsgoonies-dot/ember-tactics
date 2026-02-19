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

// Level 9: "Dragon's Maw" — Volcanic terrain, fire tiles, mountain maze, narrow safe paths
export function getMap9(): TerrainType[][] {
  return decodeMap([
    'MMRRRMPPPPMRRRM',
    'MRPPPMPPPPPMRRM',
    'RPPPPPPRPPPPPPR',
    'MPPPRPPPPPRPPPM',
    'RPPPMPPPPPMPRRR',
    'RRRMPPPPPPMPPPR',
    'MPPPRPPPPPRPPPM',
    'RPPPPPPRPPPPPPR',
    'MRPPPMPPPPPMRRM',
    'MMRRRMPPPPMRRRM'
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

export const LEVEL_9_DEF = {
  id: 9,
  name: 'Dragon\'s Maw',
  description: 'Navigate a volcanic labyrinth to slay the Dragon terrorizing the realm.',
  mapGetter: getMap9,
  playerUnits: [
    { name: 'Aldric', unitClass: 'Knight' as UnitClass, level: 9, gridX: 7, gridY: 8, personality: 'Leader' },
    { name: 'Lyra', unitClass: 'Archer' as UnitClass, level: 9, gridX: 6, gridY: 9, personality: 'Calm' },
    { name: 'Seren', unitClass: 'Mage' as UnitClass, level: 9, gridX: 8, gridY: 9, personality: 'Analytical' },
    { name: 'Mira', unitClass: 'Healer' as UnitClass, level: 9, gridX: 7, gridY: 9, personality: 'Supportive' },
    { name: 'Shade', unitClass: 'Thief' as UnitClass, level: 9, gridX: 5, gridY: 8, personality: 'Flanker' }
  ] as LevelUnitDef[],
  enemyUnits: [
    { name: 'Dragon', unitClass: 'Knight' as UnitClass, level: 8, gridX: 7, gridY: 1, personality: 'Boss', isBoss: true },
    { name: 'Dragonguard 1', unitClass: 'Knight' as UnitClass, level: 8, gridX: 5, gridY: 2, personality: 'Guard' },
    { name: 'Dragonguard 2', unitClass: 'Knight' as UnitClass, level: 8, gridX: 9, gridY: 2, personality: 'Guard' },
    { name: 'Flamecaster 1', unitClass: 'Mage' as UnitClass, level: 8, gridX: 6, gridY: 3, personality: 'Controller' },
    { name: 'Flamecaster 2', unitClass: 'Mage' as UnitClass, level: 8, gridX: 8, gridY: 3, personality: 'Controller' }
  ] as LevelUnitDef[],
  reinforcements: {
    turn: 3,
    units: [
      { name: 'Lava Stalker 1', unitClass: 'Thief' as UnitClass, level: 8, gridX: 1, gridY: 4, personality: 'Flanker' },
      { name: 'Lava Stalker 2', unitClass: 'Thief' as UnitClass, level: 8, gridX: 13, gridY: 5, personality: 'Flanker' }
    ] as LevelUnitDef[]
  },
  objectiveType: 'defeat_boss' as const,
  objectiveTarget: 'Dragon',
  starCriteria: { turns: 14, unitsLost: 1 }
};

export const LEVEL_9_DIALOGUE = {
  pre: [
    { speaker: 'Seren', portrait: 'seren', text: 'The heat is unbearable. Lava flows beneath the rock.' },
    { speaker: 'Commander Aldric', portrait: 'aldric', text: 'There. The Dragon sits at the heart of the maw.' },
    { speaker: 'Dragon', portrait: 'dragon', text: 'Mortals dare enter my domain? You will burn like all the rest.' },
    { speaker: 'Commander Aldric', portrait: 'aldric', text: 'Stay on the safe paths. One wrong step into fire and it is over.' }
  ],
  midTriggerTurn: 4,
  mid: [
    { speaker: 'Shade', portrait: 'shade', text: 'It is weakening! The scales are cracking!' },
    { speaker: 'Commander Aldric', portrait: 'aldric', text: 'Press the attack! Do not let it recover!' },
    { speaker: 'Dragon', portrait: 'dragon', text: 'You will regret every step you took into my lair!' }
  ],
  post: [
    { speaker: 'Lyra', portrait: 'lyra', text: 'The Dragon falls! The fire is dying with it.' },
    { speaker: 'Seren', portrait: 'seren', text: 'Incredible. I did not think we could actually slay it.' },
    { speaker: 'Commander Aldric', portrait: 'aldric', text: 'One great beast down. But the true enemy still waits.' },
    { speaker: 'Mira', portrait: 'mira', text: 'Let us leave this place before the lava claims it.' }
  ]
};
