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

// Level 15: "Ember's Echo" — Ethereal void, spiral of all terrain types, fire core, mountain walls, water moats
export function getMap15(): TerrainType[][] {
  return decodeMap([
    'MMMWWPPPPPWWMMM',
    'MWWPPFFFPPPPWWM',
    'WWPPPFHFPPPPPWW',
    'WPPPHHRHHPPPPBW',
    'PPPHHRRRRHPPBPP',
    'PPPHRRRRRRHBPPP',
    'WPPPHHRHHPPPPBW',
    'WWPPPFHFPPPPPWW',
    'MWWPPFFFPPPPWWM',
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

export const LEVEL_15_DEF = {
  id: 15,
  name: 'Ember\'s Echo',
  description: 'The Ember Lord\'s power lives on as a spectral echo. End it once and for all in this ethereal void.',
  mapGetter: getMap15,
  playerUnits: [
    { name: 'Aldric', unitClass: 'Knight' as UnitClass, level: 15, gridX: 3, gridY: 9, personality: 'Leader' },
    { name: 'Lyra', unitClass: 'Archer' as UnitClass, level: 15, gridX: 5, gridY: 8, personality: 'Calm' },
    { name: 'Seren', unitClass: 'Mage' as UnitClass, level: 15, gridX: 4, gridY: 9, personality: 'Analytical' },
    { name: 'Mira', unitClass: 'Healer' as UnitClass, level: 15, gridX: 2, gridY: 8, personality: 'Supportive' },
    { name: 'Rowan', unitClass: 'Cavalier' as UnitClass, level: 15, gridX: 6, gridY: 9, personality: 'Bold' },
    { name: 'Shade', unitClass: 'Thief' as UnitClass, level: 15, gridX: 13, gridY: 4, personality: 'Flanker' }
  ] as LevelUnitDef[],
  enemyUnits: [
    { name: 'Ember\'s Echo', unitClass: 'Mage' as UnitClass, level: 15, gridX: 7, gridY: 4, personality: 'Boss', isBoss: true },
    { name: 'Echo Mage 1', unitClass: 'Mage' as UnitClass, level: 13, gridX: 6, gridY: 3, personality: 'Controller' },
    { name: 'Echo Mage 2', unitClass: 'Mage' as UnitClass, level: 13, gridX: 8, gridY: 3, personality: 'Controller' },
    { name: 'Echo Mage 3', unitClass: 'Mage' as UnitClass, level: 13, gridX: 7, gridY: 5, personality: 'Controller' },
    { name: 'Echo Knight 1', unitClass: 'Knight' as UnitClass, level: 14, gridX: 5, gridY: 4, personality: 'Guard' },
    { name: 'Echo Knight 2', unitClass: 'Knight' as UnitClass, level: 14, gridX: 9, gridY: 4, personality: 'Guard' },
    { name: 'Echo Knight 3', unitClass: 'Knight' as UnitClass, level: 14, gridX: 7, gridY: 2, personality: 'Aggressive' }
  ] as LevelUnitDef[],
  reinforcements: {
    turn: 4,
    units: [
      { name: 'Echo Cavalier 1', unitClass: 'Cavalier' as UnitClass, level: 13, gridX: 0, gridY: 4, personality: 'Bold' },
      { name: 'Echo Cavalier 2', unitClass: 'Cavalier' as UnitClass, level: 13, gridX: 14, gridY: 5, personality: 'Bold' }
    ] as LevelUnitDef[]
  },
  objectiveType: 'defeat_boss' as const,
  objectiveTarget: 'Ember\'s Echo',
  starCriteria: { turns: 18, unitsLost: 0 }
};

// Extra reinforcement wave for turn 7
export const LEVEL_15_EXTRA_WAVES = [
  {
    turn: 7,
    units: [
      { name: 'Echo Healer', unitClass: 'Healer' as UnitClass, level: 14, gridX: 7, gridY: 0, personality: 'Supportive' },
      { name: 'Echo Thief 1', unitClass: 'Thief' as UnitClass, level: 13, gridX: 0, gridY: 7, personality: 'Flanker' },
      { name: 'Echo Thief 2', unitClass: 'Thief' as UnitClass, level: 13, gridX: 14, gridY: 2, personality: 'Flanker' }
    ] as LevelUnitDef[]
  }
];

export const LEVEL_15_DIALOGUE = {
  pre: [
    { speaker: 'Ember\'s Echo', portrait: 'embers_echo', text: 'Did you think killing me would end this? I am the flame itself. I echo through eternity.' },
    { speaker: 'Commander Aldric', portrait: 'aldric', text: 'We ended the Ember Lord. We ended the Phantom General. We will end you.' },
    { speaker: 'Ember\'s Echo', portrait: 'embers_echo', text: 'They were fragments. I am the source. Every ember that ever burned lives in me.' },
    { speaker: 'Seren', portrait: 'seren', text: 'This void... it is between worlds. If we destroy it here, the echo dies permanently.' },
    { speaker: 'Commander Aldric', portrait: 'aldric', text: 'Full squad. Maximum strength. This is our true final battle.' },
    { speaker: 'Lyra', portrait: 'lyra', text: 'Together. Like always.' }
  ],
  midTriggerTurn: 5,
  mid: [
    { speaker: 'Ember\'s Echo', portrait: 'embers_echo', text: 'You wound me? Impossible! I will consume this entire void!' },
    { speaker: 'Seren', portrait: 'seren', text: 'Its power is fracturing! Keep the pressure on!' },
    { speaker: 'Mira', portrait: 'mira', text: 'Stay together. I can keep us standing if we do not scatter.' },
    { speaker: 'Commander Aldric', portrait: 'aldric', text: 'Everything we have. Now!' }
  ],
  post: [
    { speaker: 'Ember\'s Echo', portrait: 'embers_echo', text: 'The flame... finally... goes out...' },
    { speaker: 'Seren', portrait: 'seren', text: 'The void is collapsing. The echo is gone. Truly gone.' },
    { speaker: 'Mira', portrait: 'mira', text: 'We did it. No more embers. No more echoes.' },
    { speaker: 'Shade', portrait: 'shade', text: 'So... now what? What do we do when the war is actually over?' },
    { speaker: 'Rowan', portrait: 'rowan', text: 'We ride home. Simple as that.' },
    { speaker: 'Lyra', portrait: 'lyra', text: 'It has been an honor fighting beside every one of you.' },
    { speaker: 'Commander Aldric', portrait: 'aldric', text: 'The ember fades. But what we built together — that endures. Ember Tactics, dismissed.' }
  ]
};
