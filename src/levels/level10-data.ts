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

// Level 10: "The Last Ember" — Ruined throne room, all terrain types, fire ring, forts in corners
export function getMap10(): TerrainType[][] {
  return decodeMap([
    'TMMMPPPPPPPMMMT',
    'MHPPPRRRRPPPHPM',
    'MPPPRPPPPPRPPPM',
    'PPPRPPFFPPPRHPP',
    'PPRPPPFFPPPRPWP',
    'PWPRPPPPPPRPPPW',
    'PPHRHPPPPPPRPPP',
    'MPPPRPPPPPRPPPM',
    'MPHPPPRRRPPPHPM',
    'TMMMPPPPPPPMMMT'
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

export const LEVEL_10_DEF = {
  id: 10,
  name: 'The Last Ember',
  description: 'Storm the ruined throne room and end the Ember Lord\'s reign once and for all.',
  mapGetter: getMap10,
  playerUnits: [
    { name: 'Aldric', unitClass: 'Knight' as UnitClass, level: 10, gridX: 3, gridY: 8, personality: 'Leader' },
    { name: 'Lyra', unitClass: 'Archer' as UnitClass, level: 10, gridX: 4, gridY: 9, personality: 'Calm' },
    { name: 'Seren', unitClass: 'Mage' as UnitClass, level: 10, gridX: 5, gridY: 8, personality: 'Analytical' },
    { name: 'Mira', unitClass: 'Healer' as UnitClass, level: 10, gridX: 6, gridY: 9, personality: 'Supportive' },
    { name: 'Rowan', unitClass: 'Cavalier' as UnitClass, level: 10, gridX: 2, gridY: 9, personality: 'Bold' },
    { name: 'Shade', unitClass: 'Thief' as UnitClass, level: 10, gridX: 7, gridY: 8, personality: 'Flanker' }
  ] as LevelUnitDef[],
  enemyUnits: [
    { name: 'Ember Lord', unitClass: 'Mage' as UnitClass, level: 10, gridX: 7, gridY: 1, personality: 'Boss', isBoss: true },
    { name: 'Ember Healer 1', unitClass: 'Healer' as UnitClass, level: 9, gridX: 5, gridY: 1, personality: 'Supportive' },
    { name: 'Ember Healer 2', unitClass: 'Healer' as UnitClass, level: 9, gridX: 9, gridY: 1, personality: 'Supportive' },
    { name: 'Ember Mage 1', unitClass: 'Mage' as UnitClass, level: 9, gridX: 6, gridY: 2, personality: 'Controller' },
    { name: 'Ember Mage 2', unitClass: 'Mage' as UnitClass, level: 9, gridX: 8, gridY: 2, personality: 'Controller' },
    { name: 'Ember Knight 1', unitClass: 'Knight' as UnitClass, level: 9, gridX: 5, gridY: 3, personality: 'Guard' },
    { name: 'Ember Knight 2', unitClass: 'Knight' as UnitClass, level: 9, gridX: 9, gridY: 3, personality: 'Guard' }
  ] as LevelUnitDef[],
  reinforcements: {
    turn: 3,
    units: [
      { name: 'Ember Cavalier', unitClass: 'Cavalier' as UnitClass, level: 9, gridX: 14, gridY: 4, personality: 'Bold' },
      { name: 'Ember Thief', unitClass: 'Thief' as UnitClass, level: 9, gridX: 0, gridY: 5, personality: 'Flanker' }
    ] as LevelUnitDef[]
  },
  objectiveType: 'defeat_boss' as const,
  objectiveTarget: 'Ember Lord',
  starCriteria: { turns: 15, unitsLost: 1 }
};

// Extra reinforcement wave for turn 6 — integration step will wire this into LevelManager
export const LEVEL_10_EXTRA_WAVES = [
  {
    turn: 6,
    units: [
      { name: 'Ember Elite 1', unitClass: 'Knight' as UnitClass, level: 10, gridX: 0, gridY: 2, personality: 'Aggressive' },
      { name: 'Ember Elite 2', unitClass: 'Mage' as UnitClass, level: 10, gridX: 14, gridY: 7, personality: 'Controller' },
      { name: 'Ember Elite 3', unitClass: 'Archer' as UnitClass, level: 10, gridX: 7, gridY: 0, personality: 'Patient' }
    ] as LevelUnitDef[]
  }
];

export const LEVEL_10_DIALOGUE = {
  pre: [
    { speaker: 'Ember Lord', portrait: 'ember_lord', text: 'You defeated my Dragon. Impressive. But I am no beast to be slain so easily.' },
    { speaker: 'Commander Aldric', portrait: 'aldric', text: 'This ends now. Every life you burned, every city you razed — it ends here.' },
    { speaker: 'Ember Lord', portrait: 'ember_lord', text: 'Brave words from a man standing in my throne room.' },
    { speaker: 'Lyra', portrait: 'lyra', text: 'Full squad. Full strength. We finish this together.' },
    { speaker: 'Commander Aldric', portrait: 'aldric', text: 'Ember Tactics, one last time. For everyone we lost.' }
  ],
  midTriggerTurn: 5,
  mid: [
    { speaker: 'Ember Lord', portrait: 'ember_lord', text: 'Enough! I will reduce this entire throne room to ash!' },
    { speaker: 'Seren', portrait: 'seren', text: 'His power is surging! He is drawing from the fire itself!' },
    { speaker: 'Commander Aldric', portrait: 'aldric', text: 'Stay focused! Hit him with everything we have!' }
  ],
  post: [
    { speaker: 'Ember Lord', portrait: 'ember_lord', text: 'Impossible... the flame... fades...' },
    { speaker: 'Commander Aldric', portrait: 'aldric', text: 'It is done. The Ember Lord falls.' },
    { speaker: 'Mira', portrait: 'mira', text: 'The fires across the land are dying. I can feel it.' },
    { speaker: 'Lyra', portrait: 'lyra', text: 'We actually did it. All of us, together.' },
    { speaker: 'Shade', portrait: 'shade', text: 'So what do soldiers do when the war is over?' },
    { speaker: 'Commander Aldric', portrait: 'aldric', text: 'We rebuild. And we remember. Ember Tactics stands victorious.' }
  ]
};
