export const TILE_SIZE = 64;
export const GRID_COLS = 15;
export const GRID_ROWS = 10;
export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 640;

export type TerrainName =
  | 'Plains'
  | 'Forest'
  | 'Hill'
  | 'Water'
  | 'Mountain'
  | 'Fort'
  | 'Bridge'
  | 'Fire';

export interface TerrainData {
  moveCost: number;
  defBonus: number;
  evaBonus: number;
  passable: boolean;
  special?: string;
}

export const TERRAIN_TABLE: Record<TerrainName, TerrainData> = {
  Plains: { moveCost: 1, defBonus: 0, evaBonus: 0, passable: true },
  Forest: {
    moveCost: 2,
    defBonus: 5,
    evaBonus: 0.2,
    passable: true,
    special: 'archers_lose_1_range'
  },
  Hill: {
    moveCost: 2,
    defBonus: 10,
    evaBonus: 0.05,
    passable: true,
    special: 'ranged_plus_1_range'
  },
  Water: { moveCost: Number.POSITIVE_INFINITY, defBonus: 0, evaBonus: 0, passable: false },
  Mountain: { moveCost: Number.POSITIVE_INFINITY, defBonus: 0, evaBonus: 0, passable: false },
  Fort: { moveCost: 1, defBonus: 15, evaBonus: 0.1, passable: true },
  Bridge: { moveCost: 1, defBonus: 0, evaBonus: 0, passable: true },
  Fire: { moveCost: 1, defBonus: 0, evaBonus: 0, passable: true, special: '5_dmg_per_turn' }
};

export type UnitClassName = 'Knight' | 'Archer' | 'Mage' | 'Healer' | 'Cavalier' | 'Thief';

export interface UnitStats {
  hp: number;
  atk: number;
  def: number;
  spd: number;
  eva: number;
  mov: number;
  range: [number, number];
  ability: string;
  growthHp: number;
  growthAtk: number;
  growthDef: number;
  growthSpd: number;
}

export const UNIT_STATS: Record<UnitClassName, UnitStats> = {
  Knight: {
    hp: 30,
    atk: 8,
    def: 10,
    spd: 3,
    eva: 0.05,
    mov: 3,
    range: [1, 1],
    ability: 'Taunt',
    growthHp: 4,
    growthAtk: 2,
    growthDef: 2,
    growthSpd: 1
  },
  Archer: {
    hp: 22,
    atk: 10,
    def: 4,
    spd: 6,
    eva: 0.1,
    mov: 4,
    range: [2, 3],
    ability: 'RainOfArrows',
    growthHp: 3,
    growthAtk: 2,
    growthDef: 1,
    growthSpd: 2
  },
  Mage: {
    hp: 18,
    atk: 12,
    def: 3,
    spd: 5,
    eva: 0.05,
    mov: 3,
    range: [2, 2],
    ability: 'Fireball',
    growthHp: 2,
    growthAtk: 2,
    growthDef: 1,
    growthSpd: 1
  },
  Healer: {
    hp: 20,
    atk: 0,
    def: 4,
    spd: 4,
    eva: 0.05,
    mov: 3,
    range: [1, 2],
    ability: 'MassHeal',
    growthHp: 3,
    growthAtk: 0,
    growthDef: 1,
    growthSpd: 1
  },
  Cavalier: {
    hp: 24,
    atk: 9,
    def: 5,
    spd: 7,
    eva: 0.05,
    mov: 5,
    range: [1, 1],
    ability: 'Charge',
    growthHp: 3,
    growthAtk: 2,
    growthDef: 1,
    growthSpd: 2
  },
  Thief: {
    hp: 18,
    atk: 7,
    def: 3,
    spd: 8,
    eva: 0.25,
    mov: 4,
    range: [1, 1],
    ability: 'Steal',
    growthHp: 2,
    growthAtk: 1,
    growthDef: 1,
    growthSpd: 2
  }
};

export const COMBAT_CONFIG = {
  baseHitChance: 0.8,
  spdHitMod: 0.03,
  critSpdMod: 0.02,
  critMultiplier: 1.5,
  counterAttackDamageMod: 1
};

export const TEAM_COLORS = {
  player: 0x3366cc,
  enemy: 0xcc3333,
  ally: 0x33cc66
} as const;

export const TERRAIN_COLORS: Record<TerrainName, number> = {
  Plains: 0x88cc55,
  Forest: 0x2d6a1e,
  Hill: 0x997744,
  Water: 0x3377cc,
  Mountain: 0x777777,
  Fort: 0xccaa66,
  Bridge: 0x996633,
  Fire: 0xff4400
};
