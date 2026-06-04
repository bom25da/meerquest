import { describe, expect, it } from 'vitest';

import {
  getHighestCompletedLevel,
  getNextQuest,
  getReviewRecommendation,
  getUnlockedQuests,
  type Quest,
  type QuestProgress,
} from './questProgress';

const quests: Quest[] = [
  { id: 'math-1', categoryId: 'math', title: 'Count the apples', level: 1, order: 1 },
  { id: 'math-2', categoryId: 'math', title: 'Find the triangle', level: 2, order: 2 },
  { id: 'math-3', categoryId: 'math', title: 'Match the pattern', level: 3, order: 3 },
  { id: 'language-1', categoryId: 'language', title: 'Pick the word', level: 1, order: 1 },
];

describe('quest progression', () => {
  it('unlocks the first quest in a category by default', () => {
    const unlocked = getUnlockedQuests({
      categoryId: 'math',
      quests,
      progress: [],
    });

    expect(unlocked.map((quest) => quest.id)).toEqual(['math-1']);
  });

  it('unlocks the next quest after the previous quest is completed', () => {
    const progress: QuestProgress[] = [
      { questId: 'math-1', status: 'completed', attempts: 1 },
    ];

    const unlocked = getUnlockedQuests({
      categoryId: 'math',
      quests,
      progress,
    });

    expect(unlocked.map((quest) => quest.id)).toEqual(['math-1', 'math-2']);
  });

  it('returns the first unlocked quest that has not been completed', () => {
    const progress: QuestProgress[] = [
      { questId: 'math-1', status: 'completed', attempts: 1 },
    ];

    const nextQuest = getNextQuest({
      categoryId: 'math',
      quests,
      progress,
    });

    expect(nextQuest?.id).toBe('math-2');
  });

  it('calculates the highest completed level per category', () => {
    const progress: QuestProgress[] = [
      { questId: 'math-1', status: 'completed', attempts: 1 },
      { questId: 'math-2', status: 'completed', attempts: 2 },
      { questId: 'language-1', status: 'completed', attempts: 1 },
    ];

    const highestLevel = getHighestCompletedLevel({
      categoryId: 'math',
      quests,
      progress,
    });

    expect(highestLevel).toBe(2);
  });

  it('recommends review for the unlocked quest with the most attempts', () => {
    const progress: QuestProgress[] = [
      { questId: 'math-1', status: 'completed', attempts: 1 },
      { questId: 'math-2', status: 'inProgress', attempts: 4 },
      { questId: 'math-3', status: 'notStarted', attempts: 0 },
    ];

    const recommendation = getReviewRecommendation({
      categoryId: 'math',
      quests,
      progress,
      attemptThreshold: 3,
    });

    expect(recommendation?.id).toBe('math-2');
  });
});
