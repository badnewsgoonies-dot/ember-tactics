import type { TerrainType } from '../grid/TileTypes';

type TerrainCode = 'P' | 'F' | 'H' | 'W' | 'M' | 'B' | 'T' | 'R';

const CODE_TO_TERRAIN: Record<TerrainCode, TerrainType> = {
  P: 'Plains',
  F: 'Forest',
  H: 'Hill',
  W: 'Water',
  M: 'Mountain',
  B: 'Bridge',
  T: 'Fort',
  R: 'Fire'
};

function decodeRow(row: string): TerrainType[] {
  if (row.length !== 15) {
    throw new Error(`Map row must have 15 columns, got ${row.length}`);
  }

  return row.split('').map((code) => {
    const terrain = CODE_TO_TERRAIN[code as TerrainCode];
    if (!terrain) {
      throw new Error(`Invalid terrain code: ${code}`);
    }

    return terrain;
  });
}

function decodeMap(rows: string[]): TerrainType[][] {
  if (rows.length !== 10) {
    throw new Error(`Map must have 10 rows, got ${rows.length}`);
  }

  return rows.map((row) => decodeRow(row));
}

export function getMap1(): TerrainType[][] {
  return decodeMap([
    'PPPPPPPPPPPPPPP',
    'PHPPPPPPPPPPHPP',
    'PPPPPPPPPPPPPPP',
    'PPPPPPFPFPPPPPP',
    'HPPPPPPFPPPPPPH',
    'PPPPPPFPFPPPPPP',
    'PPPPPPPPPPPPPPP',
    'PPHPPPPPPPPPHPP',
    'PPPPPPPPPPPPPPP',
    'PPPPPPPPPPPPPPP'
  ]);
}

export function getMap2(): TerrainType[][] {
  return decodeMap([
    'HFFFFFFWWFFFFFH',
    'FFPFFFFWWFFFFPF',
    'FFFFPFFWWFFPFFF',
    'FPFFFFFWWFFFFPF',
    'FFFPFFFWWFFFPFF',
    'FFFFFFFBBFFFFFF',
    'FFFPFFFWWFFFPFF',
    'FPFFFFFWWFFFFPF',
    'FFFFPFFWWFFPFFF',
    'HFFFFFFWWFFFFFH'
  ]);
}

export function getMap3(): TerrainType[][] {
  return decodeMap([
    'HPPPPPWWWHPPPPH',
    'PPFPPPWWWPPPFPP',
    'PPPPFPWWWHFPPPP',
    'PFPPPPWWWFPPPPF',
    'PPPPPHWWWHPPPPP',
    'PPPPTPBBBPTPPPP',
    'PPPPPHWWWHPPPPP',
    'PFPPPPWWWFPPPPF',
    'PPPPFPWWWHFPPPP',
    'HPPPPPWWWHPPPPH'
  ]);
}

export function getMap4(): TerrainType[][] {
  return decodeMap([
    'MMMMMMMMMMMMMMM',
    'PPPPFPPPPPFPPPP',
    'PFPPPPPHPPPPFPP',
    'PPPHPPPPFPPPPPP',
    'PPPPPPTRPPPPFPP',
    'PPFPPHPPPPPPPPP',
    'PPTPPPPFPPPTPPP',
    'PPPPFPPPPHPPPPP',
    'PPFPPPPTRPPPPPP',
    'PPPPPPPPPPPPPPP'
  ]);
}

export function getMap5(): TerrainType[][] {
  return decodeMap([
    'MMMMMPPPPPMMMMM',
    'MPPPPPPPPPPPPPM',
    'MPPPTPPPPPTPPPM',
    'MPPPPPPRPPPPPPM',
    'MPPPPPPRPPPPPPM',
    'MPPPTPPRPPTPPPM',
    'MPPPPPPRPPPPPPM',
    'MPPPPPPRPPPPPPM',
    'MPPPPPPPPPPPPPM',
    'MMMMMMMMMMMMMMM'
  ]);
}
