import { LEVELS } from './LevelDefs';

export interface LevelProgress {
  levelId: number;
  unlocked: boolean;
  completed: boolean;
  stars: number;
  bestTurns: number;
}

export function createInitialProgression(): LevelProgress[] {
  return LEVELS.map((level) => ({
    levelId: level.id,
    unlocked: level.id === 1,
    completed: false,
    stars: 0,
    bestTurns: 999
  }));
}

export function unlockNextLevel(progression: LevelProgress[], completedLevelId: number): LevelProgress[] {
  const nextLevelId = completedLevelId + 1;

  return progression.map((entry) => {
    if (entry.levelId === completedLevelId) {
      return {
        ...entry,
        completed: true,
        unlocked: true
      };
    }

    if (entry.levelId === nextLevelId) {
      return {
        ...entry,
        unlocked: true
      };
    }

    return entry;
  });
}

export function calculateStars(levelId: number, turnsTaken: number, unitsLost: number): number {
  const level = LEVELS.find((entry) => entry.id === levelId);
  if (!level) {
    return 1;
  }

  const meetsTurnGoal = turnsTaken <= level.starCriteria.turns;
  const meetsLossGoal = unitsLost <= level.starCriteria.unitsLost;

  if (meetsTurnGoal && meetsLossGoal) {
    return 3;
  }

  const closeTurnGoal = turnsTaken <= level.starCriteria.turns + 2;
  const closeLossGoal = unitsLost <= level.starCriteria.unitsLost + 1;

  if (closeTurnGoal && closeLossGoal) {
    return 2;
  }

  return 1;
}
