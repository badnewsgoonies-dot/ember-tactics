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

// Level 7: "The Betrayal" — Castle courtyard with forts, open center, water moat edges
export function getMap7(): TerrainType[][] {
  return decodeMap([
    'WWWWWPPPPPWWWWW',
    'WTPPPPPPPPPPPTW',
    'WPPPPPPPPPPPPPW',
    'PPPPPHPPPPHPPPP',
    'PPPPPPPPPPPPPPW',
    'WPPPPPPPPPPPPPP',
    'PPPPPHPPPPHPPPP',
    'WPPPPPPPPPPPPPW',
    'WTPPPPPPPPPPPTW',
    'WWWWWPPPPPWWWWW'
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

export const LEVEL_7_DEF = {
  id: 7,
  name: 'The Betrayal',
  description: 'Former allies reveal their true allegiance in a castle courtyard ambush.',
  mapGetter: getMap7,
  playerUnits: [
    { name: 'Aldric', unitClass: 'Knight' as UnitClass, level: 7, gridX: 3, gridY: 4, personality: 'Leader' },
    { name: 'Lyra', unitClass: 'Archer' as UnitClass, level: 7, gridX: 2, gridY: 3, personality: 'Calm' },
    { name: 'Mira', unitClass: 'Healer' as UnitClass, level: 7, gridX: 2, gridY: 6, personality: 'Supportive' },
    { name: 'Shade', unitClass: 'Thief' as UnitClass, level: 7, gridX: 3, gridY: 5, personality: 'Flanker' }
  ] as LevelUnitDef[],
  enemyUnits: [
    { name: 'Traitor Captain', unitClass: 'Knight' as UnitClass, level: 7, gridX: 11, gridY: 4, personality: 'Aggressive' },
    { name: 'Traitor Archer', unitClass: 'Archer' as UnitClass, level: 7, gridX: 12, gridY: 2, personality: 'Patient' },
    { name: 'Traitor Mage', unitClass: 'Mage' as UnitClass, level: 7, gridX: 12, gridY: 7, personality: 'Controller' },
    { name: 'Traitor Guard 1', unitClass: 'Knight' as UnitClass, level: 7, gridX: 10, gridY: 5, personality: 'Guard' },
    { name: 'Traitor Guard 2', unitClass: 'Cavalier' as UnitClass, level: 7, gridX: 11, gridY: 6, personality: 'Bold' }
  ] as LevelUnitDef[],
  reinforcements: {
    turn: 4,
    units: [
      { name: 'Turncloak 1', unitClass: 'Knight' as UnitClass, level: 7, gridX: 7, gridY: 0, personality: 'Aggressive' },
      { name: 'Turncloak 2', unitClass: 'Archer' as UnitClass, level: 7, gridX: 7, gridY: 9, personality: 'Patient' },
      { name: 'Turncloak 3', unitClass: 'Thief' as UnitClass, level: 7, gridX: 14, gridY: 5, personality: 'Flanker' }
    ] as LevelUnitDef[]
  },
  objectiveType: 'defeat_all' as const,
  starCriteria: { turns: 14, unitsLost: 1 }
};

export const LEVEL_7_DIALOGUE = {
  pre: [
    { speaker: 'Commander Aldric', portrait: 'aldric', text: 'The castle gates are open. Lord Haren said he would meet us here.' },
    { speaker: 'Shade', portrait: 'shade', text: 'Something is wrong. The courtyard feels staged.' },
    { speaker: 'Lyra', portrait: 'lyra', text: 'Aldric, look! Those are Haren\'s men — with weapons drawn against us!' },
    { speaker: 'Commander Aldric', portrait: 'aldric', text: 'Haren sold us out. Defensive positions, now!' }
  ],
  midTriggerTurn: 4,
  mid: [
    { speaker: 'Shade', portrait: 'shade', text: 'More of them from the walls! They planned this from the start!' },
    { speaker: 'Commander Aldric', portrait: 'aldric', text: 'No retreat. We fight through every last traitor.' }
  ],
  post: [
    { speaker: 'Mira', portrait: 'mira', text: 'I trusted Haren. We all did.' },
    { speaker: 'Commander Aldric', portrait: 'aldric', text: 'Trust is earned on the battlefield, not in courts. Remember that.' },
    { speaker: 'Shade', portrait: 'shade', text: 'Haren escaped. But we will find him.' },
    { speaker: 'Commander Aldric', portrait: 'aldric', text: 'That is a promise, not a threat. We move.' }
  ]
};
