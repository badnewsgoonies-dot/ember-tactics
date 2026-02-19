import { applyStatusModifiers, type StatusEffect } from './StatusEffects';
import { getClassDef, getStatsAtLevel, type UnitClass } from './UnitClasses';

export type Team = 'player' | 'enemy' | 'ally';

export interface UnitData {
  id: string;
  name: string;
  unitClass: UnitClass;
  team: Team;
  level: number;
  xp: number;
  gridX: number;
  gridY: number;
  currentHp: number;
  maxHp: number;
  atk: number;
  def: number;
  spd: number;
  eva: number;
  mov: number;
  range: [number, number];
  ability: string;
  abilityCD: number;
  maxAbilityCD: number;
  mp: number;
  maxMp: number;
  statusEffects: StatusEffect[];
  hasMoved: boolean;
  hasActed: boolean;
  isAlive: boolean;
  items: string[];
  facing: 'left' | 'right';
}

export function createUnit(
  id: string,
  name: string,
  unitClass: UnitClass,
  team: Team,
  level: number,
  gridX: number,
  gridY: number
): UnitData {
  const classDef = getClassDef(unitClass);
  const scaledStats = getStatsAtLevel(unitClass, level);
  const maxHp = scaledStats.hp;
  const maxMp = 10;

  return {
    id,
    name,
    unitClass,
    team,
    level: Math.max(1, Math.floor(level)),
    xp: 0,
    gridX,
    gridY,
    currentHp: maxHp,
    maxHp,
    atk: scaledStats.atk,
    def: scaledStats.def,
    spd: scaledStats.spd,
    eva: scaledStats.eva,
    mov: classDef.mov,
    range: classDef.range,
    ability: classDef.ability,
    abilityCD: 0,
    maxAbilityCD: 3,
    mp: maxMp,
    maxMp,
    statusEffects: [],
    hasMoved: false,
    hasActed: false,
    isAlive: true,
    items: [],
    facing: team === 'enemy' ? 'left' : 'right'
  };
}

export function resetTurnState(unit: UnitData): UnitData {
  return {
    ...unit,
    hasMoved: false,
    hasActed: false
  };
}

export function damageUnit(unit: UnitData, damage: number): UnitData {
  const appliedDamage = Math.max(0, damage);
  const nextHp = Math.max(0, unit.currentHp - appliedDamage);

  return {
    ...unit,
    currentHp: nextHp,
    isAlive: nextHp > 0
  };
}

export function healUnit(unit: UnitData, amount: number): UnitData {
  if (!unit.isAlive || amount <= 0) {
    return unit;
  }

  return {
    ...unit,
    currentHp: Math.min(unit.maxHp, unit.currentHp + amount)
  };
}

export function getEffectiveStats(unit: UnitData): { atk: number; def: number; spd: number; eva: number } {
  return applyStatusModifiers(
    {
      atk: unit.atk,
      def: unit.def,
      spd: unit.spd,
      eva: unit.eva
    },
    unit.statusEffects
  );
}
