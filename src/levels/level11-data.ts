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

// Level 11: "The Sunken Cathedral" — Flooded ruins with bridge paths, fort islands, scattered hills
export function getMap11(): TerrainType[][] {
  return decodeMap([
    'WWWHBBBHWWWWWWW',
    'WWTBWWWBTWWWHWW',
    'WWWBWWWBWWWWBWW',
    'HBBBTWWBBBBBTWW',
    'WWWWWWWWWWWWBWW',
    'WWBBBBBBBHWWBWW',
    'WWBWWWWWTBWWBWH',
    'WWBWWHWWWBBBBTW',
    'WWTBWWWWWWWWWWW',
    'WWWHBBBBHWWWWWW'
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

export const LEVEL_11_DEF = {
  id: 11,
  name: 'The Sunken Cathedral',
  description: 'Navigate flooded ruins across crumbling bridges to clear the cathedral islands.',
  mapGetter: getMap11,
  playerUnits: [
    { name: 'Aldric', unitClass: 'Knight' as UnitClass, level: 11, gridX: 1, gridY: 8, personality: 'Leader' },
    { name: 'Lyra', unitClass: 'Archer' as UnitClass, level: 11, gridX: 3, gridY: 9, personality: 'Calm' },
    { name: 'Seren', unitClass: 'Mage' as UnitClass, level: 11, gridX: 2, gridY: 7, personality: 'Analytical' },
    { name: 'Mira', unitClass: 'Healer' as UnitClass, level: 11, gridX: 0, gridY: 6, personality: 'Supportive' },
    { name: 'Shade', unitClass: 'Thief' as UnitClass, level: 11, gridX: 2, gridY: 5, personality: 'Flanker' }
  ] as LevelUnitDef[],
  enemyUnits: [
    { name: 'Drowned Knight 1', unitClass: 'Knight' as UnitClass, level: 10, gridX: 3, gridY: 3, personality: 'Guard' },
    { name: 'Drowned Knight 2', unitClass: 'Knight' as UnitClass, level: 10, gridX: 11, gridY: 3, personality: 'Guard' },
    { name: 'Sunken Archer 1', unitClass: 'Archer' as UnitClass, level: 10, gridX: 8, gridY: 5, personality: 'Patient' },
    { name: 'Sunken Archer 2', unitClass: 'Archer' as UnitClass, level: 10, gridX: 13, gridY: 7, personality: 'Patient' },
    { name: 'Cathedral Mage', unitClass: 'Mage' as UnitClass, level: 11, gridX: 1, gridY: 1, personality: 'Controller' },
    { name: 'Ruin Thief', unitClass: 'Thief' as UnitClass, level: 10, gridX: 8, gridY: 6, personality: 'Flanker' }
  ] as LevelUnitDef[],
  objectiveType: 'defeat_all' as const,
  starCriteria: { turns: 16, unitsLost: 1 }
};

export const LEVEL_11_DIALOGUE = {
  pre: [
    { speaker: 'Seren', portrait: 'seren', text: 'These ruins predate the Ember Kingdom by centuries. The water level has risen dramatically.' },
    { speaker: 'Commander Aldric', portrait: 'aldric', text: 'Stay on the bridges and forts. One wrong step and the water takes you.' },
    { speaker: 'Lyra', portrait: 'lyra', text: 'Movement on the far islands. They have been waiting for us.' },
    { speaker: 'Shade', portrait: 'shade', text: 'Something sank this cathedral. I would rather not find out what.' }
  ],
  midTriggerTurn: 4,
  mid: [
    { speaker: 'Seren', portrait: 'seren', text: 'The stonework is carved with warnings. Something was sealed beneath this place.' },
    { speaker: 'Commander Aldric', portrait: 'aldric', text: 'Focus on the living enemies first. We can read carvings later.' }
  ],
  post: [
    { speaker: 'Mira', portrait: 'mira', text: 'The cathedral is cleared. But this place feels... unfinished.' },
    { speaker: 'Seren', portrait: 'seren', text: 'These inscriptions mention a phantom bound to the old war. A general who refused to die.' },
    { speaker: 'Commander Aldric', portrait: 'aldric', text: 'We will deal with ghosts when we must. Move out.' }
  ]
};
