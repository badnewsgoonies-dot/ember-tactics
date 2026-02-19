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

// Level 13: "The Phantom General" — Misty battlefield, open plains, ridge line, strategic forts
export function getMap13(): TerrainType[][] {
  return decodeMap([
    'PPFFTPPPPPTFFPP',
    'PPFPPPPPPPPPFPP',
    'PPPPPHHHHPPPPPP',
    'PPPPHHHHHHPPPPP',
    'TPPPHPPPPHTPPPP',
    'PPPPPPPPPPPPPPF',
    'PPFPPPPPPPPPPFP',
    'FPPPPPPPPPPPPPF',
    'PFPPTPPPPPPTPPP',
    'PPPPPPFFPPPPPPP'
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

export const LEVEL_13_DEF = {
  id: 13,
  name: 'The Phantom General',
  description: 'Confront the legendary Phantom General on a misty battlefield and shatter his elite guard.',
  mapGetter: getMap13,
  playerUnits: [
    { name: 'Aldric', unitClass: 'Knight' as UnitClass, level: 12, gridX: 2, gridY: 8, personality: 'Leader' },
    { name: 'Lyra', unitClass: 'Archer' as UnitClass, level: 12, gridX: 4, gridY: 8, personality: 'Calm' },
    { name: 'Seren', unitClass: 'Mage' as UnitClass, level: 12, gridX: 3, gridY: 9, personality: 'Analytical' },
    { name: 'Mira', unitClass: 'Healer' as UnitClass, level: 12, gridX: 1, gridY: 9, personality: 'Supportive' },
    { name: 'Rowan', unitClass: 'Cavalier' as UnitClass, level: 12, gridX: 5, gridY: 9, personality: 'Bold' }
  ] as LevelUnitDef[],
  enemyUnits: [
    { name: 'Phantom General', unitClass: 'Knight' as UnitClass, level: 13, gridX: 7, gridY: 0, personality: 'Boss', isBoss: true },
    { name: 'Phantom Elite 1', unitClass: 'Knight' as UnitClass, level: 11, gridX: 5, gridY: 1, personality: 'Aggressive' },
    { name: 'Phantom Elite 2', unitClass: 'Cavalier' as UnitClass, level: 11, gridX: 9, gridY: 1, personality: 'Bold' },
    { name: 'Phantom Archer 1', unitClass: 'Archer' as UnitClass, level: 11, gridX: 6, gridY: 2, personality: 'Patient' },
    { name: 'Phantom Archer 2', unitClass: 'Archer' as UnitClass, level: 11, gridX: 8, gridY: 2, personality: 'Patient' },
    { name: 'Phantom Healer', unitClass: 'Healer' as UnitClass, level: 11, gridX: 7, gridY: 1, personality: 'Supportive' }
  ] as LevelUnitDef[],
  reinforcements: {
    turn: 3,
    units: [
      { name: 'Phantom Flanker 1', unitClass: 'Thief' as UnitClass, level: 11, gridX: 0, gridY: 3, personality: 'Flanker' },
      { name: 'Phantom Flanker 2', unitClass: 'Thief' as UnitClass, level: 11, gridX: 14, gridY: 3, personality: 'Flanker' }
    ] as LevelUnitDef[]
  },
  objectiveType: 'defeat_boss' as const,
  objectiveTarget: 'Phantom General',
  starCriteria: { turns: 16, unitsLost: 1 }
};

// Extra reinforcement wave for turn 6
export const LEVEL_13_EXTRA_WAVES = [
  {
    turn: 6,
    units: [
      { name: 'Phantom Mage', unitClass: 'Mage' as UnitClass, level: 12, gridX: 0, gridY: 0, personality: 'Controller' },
      { name: 'Phantom Cavalier', unitClass: 'Cavalier' as UnitClass, level: 12, gridX: 14, gridY: 0, personality: 'Aggressive' }
    ] as LevelUnitDef[]
  }
];

export const LEVEL_13_DIALOGUE = {
  pre: [
    { speaker: 'Phantom General', portrait: 'phantom_general', text: 'Aldric. Son of the man who failed to kill me thirty years ago.' },
    { speaker: 'Commander Aldric', portrait: 'aldric', text: 'You know my father.' },
    { speaker: 'Phantom General', portrait: 'phantom_general', text: 'I trained him. Before the Ember Lord twisted everything we built.' },
    { speaker: 'Commander Aldric', portrait: 'aldric', text: 'Then you know I cannot let you stand. Not after what you have become.' },
    { speaker: 'Phantom General', portrait: 'phantom_general', text: 'Good. A soldier who hesitates is already dead. Show me what his son learned.' }
  ],
  midTriggerTurn: 4,
  mid: [
    { speaker: 'Phantom General', portrait: 'phantom_general', text: 'Impressive. You fight like he did. But you are not alone. That makes you stronger.' },
    { speaker: 'Commander Aldric', portrait: 'aldric', text: 'Hold the ridge! Do not let them surround us!' },
    { speaker: 'Lyra', portrait: 'lyra', text: 'More coming from the flanks. He planned for this.' }
  ],
  post: [
    { speaker: 'Phantom General', portrait: 'phantom_general', text: 'Well struck. Your father would be proud, boy.' },
    { speaker: 'Commander Aldric', portrait: 'aldric', text: 'Rest now, General. The war is over.' },
    { speaker: 'Phantom General', portrait: 'phantom_general', text: 'For me, yes. But not for you. The Ember does not die. It echoes.' },
    { speaker: 'Seren', portrait: 'seren', text: 'What does he mean by that? Echoes?' },
    { speaker: 'Commander Aldric', portrait: 'aldric', text: 'We will find out soon enough. Bury him with honors.' }
  ]
};
