import type { AbilityDef } from './AbilitySystem';

export const ABILITIES: Record<string, AbilityDef> = {
  Fireball: {
    name: 'Fireball',
    mpCost: 3,
    cooldown: 2,
    range: 2,
    aoeShape: 'diamond',
    aoeSize: 1,
    damageMultiplier: 1.3,
    healAmount: 0,
    ignoreTerrainDef: true,
    description: 'Launch a fiery burst that scorches nearby enemies and ignores terrain defense.',
    targetType: 'enemy'
  },
  RainOfArrows: {
    name: 'RainOfArrows',
    mpCost: 3,
    cooldown: 3,
    range: 3,
    aoeShape: 'cross',
    aoeSize: 1,
    damageMultiplier: 0.8,
    healAmount: 0,
    ignoreTerrainDef: false,
    description: 'Loose a volley in a cross pattern, trading per-target damage for area coverage.',
    targetType: 'enemy'
  },
  MassHeal: {
    name: 'MassHeal',
    mpCost: 5,
    cooldown: 4,
    range: 0,
    aoeShape: 'diamond',
    aoeSize: 2,
    damageMultiplier: 1,
    healAmount: 15,
    ignoreTerrainDef: false,
    description: 'Restore health to nearby allies around the caster.',
    targetType: 'ally'
  },
  Heal: {
    name: 'Heal',
    mpCost: 2,
    cooldown: 0,
    range: 2,
    aoeShape: 'single',
    aoeSize: 0,
    damageMultiplier: 1,
    healAmount: 10,
    ignoreTerrainDef: false,
    description: 'A quick restorative spell for a single ally.',
    targetType: 'ally'
  },
  Charge: {
    name: 'Charge',
    mpCost: 2,
    cooldown: 2,
    range: 1,
    aoeShape: 'single',
    aoeSize: 0,
    damageMultiplier: 1.5,
    healAmount: 0,
    ignoreTerrainDef: false,
    description: 'Rush into melee for heavy damage; gains bonus power after moving 3+ tiles.',
    targetType: 'enemy'
  },
  Taunt: {
    name: 'Taunt',
    mpCost: 2,
    cooldown: 3,
    range: 0,
    aoeShape: 'single',
    aoeSize: 0,
    damageMultiplier: 1,
    healAmount: 0,
    statusApplied: 'Taunt',
    statusDuration: 2,
    ignoreTerrainDef: false,
    description: 'Force enemies to focus on the user for a short time.',
    targetType: 'self'
  },
  Steal: {
    name: 'Steal',
    mpCost: 0,
    cooldown: 1,
    range: 1,
    aoeShape: 'single',
    aoeSize: 0,
    damageMultiplier: 1,
    healAmount: 0,
    ignoreTerrainDef: false,
    description: 'Attempt to snatch a random item from an adjacent enemy.',
    targetType: 'enemy'
  },
  Backstab: {
    name: 'Backstab',
    mpCost: 2,
    cooldown: 2,
    range: 1,
    aoeShape: 'single',
    aoeSize: 0,
    damageMultiplier: 1.5,
    healAmount: 0,
    ignoreTerrainDef: false,
    description: 'Strike from behind for increased burst damage.',
    targetType: 'enemy'
  }
};

export function getAbility(name: string): AbilityDef | undefined {
  return ABILITIES[name];
}
