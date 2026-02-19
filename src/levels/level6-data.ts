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

// Level 6: "The Frozen Pass" — Mountain pass with hills, frozen lakes (Water), narrow corridors
export function getMap6(): TerrainType[][] {
  return decodeMap([
    'MMMWWPPPPPWWMMM',
    'MHPPWPPPPPWPPHM',
    'MPPPPPHHHPPPPPM',
    'MPPHPPPPPPPHPPM',
    'WPPPPPHPHPPPPWW',
    'WWPPPPPHPPPPWWM',
    'MPPHPPPPPPPHPPM',
    'MPPPPPHHHPPPPPM',
    'MHPPWPPPPPWPPHM',
    'MMMWWPPPPPWWMMM'
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

export const LEVEL_6_DEF = {
  id: 6,
  name: 'The Frozen Pass',
  description: 'A treacherous mountain pass where frozen lakes and narrow corridors force careful positioning.',
  mapGetter: getMap6,
  playerUnits: [
    { name: 'Aldric', unitClass: 'Knight' as UnitClass, level: 6, gridX: 1, gridY: 4, personality: 'Leader' },
    { name: 'Lyra', unitClass: 'Archer' as UnitClass, level: 6, gridX: 2, gridY: 3, personality: 'Calm' },
    { name: 'Seren', unitClass: 'Mage' as UnitClass, level: 6, gridX: 2, gridY: 6, personality: 'Analytical' },
    { name: 'Mira', unitClass: 'Healer' as UnitClass, level: 6, gridX: 1, gridY: 5, personality: 'Supportive' },
    { name: 'Rowan', unitClass: 'Cavalier' as UnitClass, level: 6, gridX: 2, gridY: 5, personality: 'Bold' }
  ] as LevelUnitDef[],
  enemyUnits: [
    { name: 'Frostbow 1', unitClass: 'Archer' as UnitClass, level: 6, gridX: 10, gridY: 2, personality: 'Patient' },
    { name: 'Frostbow 2', unitClass: 'Archer' as UnitClass, level: 6, gridX: 10, gridY: 7, personality: 'Patient' },
    { name: 'Icewall 1', unitClass: 'Knight' as UnitClass, level: 6, gridX: 8, gridY: 4, personality: 'Guard' },
    { name: 'Icewall 2', unitClass: 'Knight' as UnitClass, level: 6, gridX: 8, gridY: 5, personality: 'Guard' },
    { name: 'Blizzard Mage', unitClass: 'Mage' as UnitClass, level: 6, gridX: 11, gridY: 5, personality: 'Controller' },
    { name: 'Frostblade', unitClass: 'Thief' as UnitClass, level: 7, gridX: 12, gridY: 3, personality: 'Flanker' }
  ] as LevelUnitDef[],
  objectiveType: 'defeat_all' as const,
  starCriteria: { turns: 12, unitsLost: 1 }
};

export const LEVEL_6_DIALOGUE = {
  pre: [
    { speaker: 'Lyra', portrait: 'lyra', text: 'The pass is barely wide enough for two abreast. Ice everywhere.' },
    { speaker: 'Commander Aldric', portrait: 'aldric', text: 'Frozen lakes on both flanks. One wrong step and you sink.' },
    { speaker: 'Seren', portrait: 'seren', text: 'I sense hostile magic ahead. They are using the terrain against us.' },
    { speaker: 'Commander Aldric', portrait: 'aldric', text: 'Single file through the narrows. Rowan, hold the rear.' }
  ],
  midTriggerTurn: 3,
  mid: [
    { speaker: 'Rowan', portrait: 'rowan', text: 'Contact from the flank! A thief slipped past the ice!' },
    { speaker: 'Commander Aldric', portrait: 'aldric', text: 'Ambush! Mira, stay close to Seren. Everyone pivot!' }
  ],
  post: [
    { speaker: 'Mira', portrait: 'mira', text: 'We cleared the pass. I never want to see ice again.' },
    { speaker: 'Lyra', portrait: 'lyra', text: 'Those archers had perfect vantage on the hills. Smart positioning.' },
    { speaker: 'Commander Aldric', portrait: 'aldric', text: 'The mountain is behind us. Whatever lies ahead cannot be worse.' }
  ]
};
