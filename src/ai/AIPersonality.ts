import type { UnitClass } from '../units/UnitClasses';

export type Personality = 'Aggressive' | 'Defensive' | 'Support';

export interface AIConfig {
  personality: Personality;
  retreatThreshold: number;
  aggroRange: number;
  prefersTerrain: boolean;
}

export function getDefaultPersonality(unitClass: UnitClass): Personality {
  if (unitClass === 'Knight') {
    return 'Defensive';
  }

  if (unitClass === 'Healer') {
    return 'Support';
  }

  return 'Aggressive';
}

export function getAIConfig(personality: Personality): AIConfig {
  if (personality === 'Aggressive') {
    return {
      personality,
      retreatThreshold: 0.15,
      aggroRange: 99,
      prefersTerrain: false
    };
  }

  if (personality === 'Defensive') {
    return {
      personality,
      retreatThreshold: 0.3,
      aggroRange: 6,
      prefersTerrain: true
    };
  }

  return {
    personality,
    retreatThreshold: 0.4,
    aggroRange: 4,
    prefersTerrain: true
  };
}
