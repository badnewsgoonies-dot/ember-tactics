import { UNIT_STATS } from '../config';

export type UnitClass = 'Knight' | 'Archer' | 'Mage' | 'Healer' | 'Cavalier' | 'Thief';

export interface UnitClassDef {
  name: UnitClass;
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
  canCounter: (attackerRange: number) => boolean;
  description: string;
}

export const ALL_CLASSES: UnitClass[] = ['Knight', 'Archer', 'Mage', 'Healer', 'Cavalier', 'Thief'];

const CLASS_DESCRIPTIONS: Record<UnitClass, string> = {
  Knight: 'Armored frontline defender with high durability and taunting presence.',
  Archer: 'Long-range physical attacker that excels from a safe distance.',
  Mage: 'Ranged spellcaster with high attack and tactical burst damage.',
  Healer: 'Support specialist focused on healing and sustain over direct combat.',
  Cavalier: 'Highly mobile striker that can quickly reposition and pressure flanks.',
  Thief: 'Fast evasive skirmisher that relies on speed and precision.'
};

function canCounterWithRange(range: [number, number], attackerRange: number): boolean {
  return attackerRange >= range[0] && attackerRange <= range[1];
}

export function getClassDef(cls: UnitClass): UnitClassDef {
  const base = UNIT_STATS[cls];

  const canCounter = (attackerRange: number): boolean => {
    if (cls === 'Healer') {
      return false;
    }

    if (cls === 'Archer' && attackerRange === 1) {
      return false;
    }

    return canCounterWithRange(base.range, attackerRange);
  };

  return {
    name: cls,
    hp: base.hp,
    atk: base.atk,
    def: base.def,
    spd: base.spd,
    eva: base.eva,
    mov: base.mov,
    range: base.range,
    ability: base.ability,
    growthHp: base.growthHp,
    growthAtk: base.growthAtk,
    growthDef: base.growthDef,
    growthSpd: base.growthSpd,
    canCounter,
    description: CLASS_DESCRIPTIONS[cls]
  };
}

export function getStatsAtLevel(
  cls: UnitClass,
  level: number
): { hp: number; atk: number; def: number; spd: number; eva: number } {
  const classDef = getClassDef(cls);
  const effectiveLevel = Math.max(1, Math.floor(level));
  const growthSteps = effectiveLevel - 1;

  return {
    hp: classDef.hp + classDef.growthHp * growthSteps,
    atk: classDef.atk + classDef.growthAtk * growthSteps,
    def: classDef.def + classDef.growthDef * growthSteps,
    spd: classDef.spd + classDef.growthSpd * growthSteps,
    eva: classDef.eva
  };
}
