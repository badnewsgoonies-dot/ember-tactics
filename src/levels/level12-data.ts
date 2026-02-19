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

// Level 12: "Wildfire" — Burning grasslands with fire spreading across center, forests on edges
export function getMap12(): TerrainType[][] {
  return decodeMap([
    'FFPPPPRRRPPPPPF',
    'FPPPRRRRRRPPPFF',
    'PPPRRRRRRRRPPFP',
    'PPHRRRRRRRRPHPP',
    'PPPPRRPPRRRPPPP',
    'PPPPRRPPRRRPPPP',
    'PPHRRRRRRRRPHPP',
    'PPPRRRRRRRRPPFP',
    'FPPPRRRRRRPPPFF',
    'FFPPPPRRRPPPPPF'
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

export const LEVEL_12_DEF = {
  id: 12,
  name: 'Wildfire',
  description: 'Race through burning grasslands to stop the mages fueling the inferno.',
  mapGetter: getMap12,
  playerUnits: [
    { name: 'Aldric', unitClass: 'Knight' as UnitClass, level: 11, gridX: 0, gridY: 4, personality: 'Leader' },
    { name: 'Lyra', unitClass: 'Archer' as UnitClass, level: 11, gridX: 0, gridY: 5, personality: 'Calm' },
    { name: 'Seren', unitClass: 'Mage' as UnitClass, level: 11, gridX: 1, gridY: 3, personality: 'Analytical' },
    { name: 'Mira', unitClass: 'Healer' as UnitClass, level: 11, gridX: 1, gridY: 6, personality: 'Supportive' },
    { name: 'Rowan', unitClass: 'Cavalier' as UnitClass, level: 11, gridX: 0, gridY: 8, personality: 'Bold' }
  ] as LevelUnitDef[],
  enemyUnits: [
    { name: 'Pyromancer 1', unitClass: 'Mage' as UnitClass, level: 11, gridX: 7, gridY: 4, personality: 'Controller' },
    { name: 'Pyromancer 2', unitClass: 'Mage' as UnitClass, level: 11, gridX: 7, gridY: 5, personality: 'Controller' },
    { name: 'Flame Knight 1', unitClass: 'Knight' as UnitClass, level: 10, gridX: 13, gridY: 3, personality: 'Aggressive' },
    { name: 'Flame Knight 2', unitClass: 'Knight' as UnitClass, level: 10, gridX: 13, gridY: 6, personality: 'Aggressive' },
    { name: 'Ash Archer 1', unitClass: 'Archer' as UnitClass, level: 10, gridX: 14, gridY: 0, personality: 'Patient' },
    { name: 'Ash Archer 2', unitClass: 'Archer' as UnitClass, level: 10, gridX: 14, gridY: 9, personality: 'Patient' },
    { name: 'Cinder Thief', unitClass: 'Thief' as UnitClass, level: 11, gridX: 11, gridY: 4, personality: 'Flanker' }
  ] as LevelUnitDef[],
  objectiveType: 'defeat_all' as const,
  starCriteria: { turns: 14, unitsLost: 1 }
};

export const LEVEL_12_DIALOGUE = {
  pre: [
    { speaker: 'Rowan', portrait: 'rowan', text: 'The whole valley is burning. We cannot ride through that.' },
    { speaker: 'Seren', portrait: 'seren', text: 'This fire is not natural. There are mages at the center feeding it.' },
    { speaker: 'Commander Aldric', portrait: 'aldric', text: 'Then we kill the mages and the fire dies. Move along the flanks.' },
    { speaker: 'Lyra', portrait: 'lyra', text: 'Smoke is everywhere. Visibility is terrible past twenty paces.' }
  ],
  midTriggerTurn: 3,
  mid: [
    { speaker: 'Mira', portrait: 'mira', text: 'The heat is unbearable. We need to end this quickly.' },
    { speaker: 'Seren', portrait: 'seren', text: 'The pyromancers are drawing power from the flames themselves. Break their concentration!' }
  ],
  post: [
    { speaker: 'Rowan', portrait: 'rowan', text: 'The fires are dying down. We can breathe again.' },
    { speaker: 'Mira', portrait: 'mira', text: 'Burns everywhere. I will do what I can but we all need rest.' },
    { speaker: 'Commander Aldric', portrait: 'aldric', text: 'No rest yet. Scout reports say a general is marshaling forces to the north.' },
    { speaker: 'Lyra', portrait: 'lyra', text: 'A general? From the old war?' }
  ]
};
