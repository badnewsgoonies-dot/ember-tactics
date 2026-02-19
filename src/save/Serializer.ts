import type { LevelProgress } from '../levels/LevelProgression';

export interface SaveData {
  version: number;
  levelProgress: LevelProgress[];
  unitRoster: Array<{ name: string; unitClass: string; level: number; xp: number }>;
  timestamp: number;
}

export function serializeGameState(
  levelProgress: LevelProgress[],
  unitRoster: Array<{ name: string; unitClass: string; level: number; xp: number }>
): SaveData {
  return {
    version: 1,
    levelProgress: levelProgress.map((entry) => ({ ...entry })),
    unitRoster: unitRoster.map((unit) => ({ ...unit })),
    timestamp: Date.now()
  };
}
