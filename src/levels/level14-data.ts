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

// Level 14: "No Man's Land" — Trench warfare, parallel fort rows, open kill zones, water craters
export function getMap14(): TerrainType[][] {
  return decodeMap([
    'TTTPPPPWPPPTTTP',
    'TTPPPPPPPPPPTTP',
    'PPPPWPPPPPWPPPP',
    'PPPPPPPPPPPPPPP',
    'PPWPPPPPPPPPWPP',
    'PPWPPPPPPPPPWPP',
    'PPPPPPPPPPPPPPP',
    'PPPPWPPPPPWPPPP',
    'TTPPPPPPPPPPPTT',
    'TTTPPPWPPPPTTTP'
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

export const LEVEL_14_DEF = {
  id: 14,
  name: 'No Man\'s Land',
  description: 'Cross the killing field between entrenched positions and break through the enemy line.',
  mapGetter: getMap14,
  playerUnits: [
    { name: 'Aldric', unitClass: 'Knight' as UnitClass, level: 13, gridX: 1, gridY: 8, personality: 'Leader' },
    { name: 'Lyra', unitClass: 'Archer' as UnitClass, level: 13, gridX: 0, gridY: 9, personality: 'Calm' },
    { name: 'Seren', unitClass: 'Mage' as UnitClass, level: 13, gridX: 2, gridY: 9, personality: 'Analytical' },
    { name: 'Mira', unitClass: 'Healer' as UnitClass, level: 13, gridX: 1, gridY: 9, personality: 'Supportive' },
    { name: 'Rowan', unitClass: 'Cavalier' as UnitClass, level: 13, gridX: 3, gridY: 8, personality: 'Bold' },
    { name: 'Shade', unitClass: 'Thief' as UnitClass, level: 13, gridX: 12, gridY: 9, personality: 'Flanker' }
  ] as LevelUnitDef[],
  enemyUnits: [
    { name: 'Trench Knight 1', unitClass: 'Knight' as UnitClass, level: 12, gridX: 0, gridY: 0, personality: 'Guard' },
    { name: 'Trench Knight 2', unitClass: 'Knight' as UnitClass, level: 12, gridX: 1, gridY: 1, personality: 'Guard' },
    { name: 'Trench Archer 1', unitClass: 'Archer' as UnitClass, level: 12, gridX: 3, gridY: 0, personality: 'Patient' },
    { name: 'Trench Archer 2', unitClass: 'Archer' as UnitClass, level: 12, gridX: 11, gridY: 0, personality: 'Patient' },
    { name: 'Trench Mage 1', unitClass: 'Mage' as UnitClass, level: 12, gridX: 12, gridY: 1, personality: 'Controller' },
    { name: 'Trench Mage 2', unitClass: 'Mage' as UnitClass, level: 12, gridX: 13, gridY: 0, personality: 'Controller' },
    { name: 'Trench Cavalier', unitClass: 'Cavalier' as UnitClass, level: 12, gridX: 7, gridY: 3, personality: 'Aggressive' },
    { name: 'Trench Thief', unitClass: 'Thief' as UnitClass, level: 12, gridX: 5, gridY: 2, personality: 'Flanker' }
  ] as LevelUnitDef[],
  objectiveType: 'defeat_all' as const,
  starCriteria: { turns: 16, unitsLost: 2 }
};

export const LEVEL_14_DIALOGUE = {
  pre: [
    { speaker: 'Rowan', portrait: 'rowan', text: 'Open ground between the trenches. This is a death trap.' },
    { speaker: 'Shade', portrait: 'shade', text: 'I can move through the craters if you draw their fire.' },
    { speaker: 'Commander Aldric', portrait: 'aldric', text: 'One more push. One more battle. Then we end this war.' },
    { speaker: 'Mira', portrait: 'mira', text: 'How many more pushes do we have left in us?' },
    { speaker: 'Commander Aldric', portrait: 'aldric', text: 'As many as it takes. We did not come this far to stop.' }
  ],
  midTriggerTurn: 4,
  mid: [
    { speaker: 'Lyra', portrait: 'lyra', text: 'We are halfway across. Keep moving, do not stop in the open!' },
    { speaker: 'Rowan', portrait: 'rowan', text: 'Their cavalry is coming. I will meet them head on.' },
    { speaker: 'Commander Aldric', portrait: 'aldric', text: 'Together. We break through together.' }
  ],
  post: [
    { speaker: 'Shade', portrait: 'shade', text: 'We made it. Barely.' },
    { speaker: 'Mira', portrait: 'mira', text: 'Is this what we have been fighting for? Craters and ash?' },
    { speaker: 'Commander Aldric', portrait: 'aldric', text: 'We fight so no one else has to cross a field like this.' },
    { speaker: 'Seren', portrait: 'seren', text: 'Commander. The Ember readings are off the scale ahead. Something immense is waiting.' },
    { speaker: 'Commander Aldric', portrait: 'aldric', text: 'The echo the General spoke of. It is time to face it.' }
  ]
};
