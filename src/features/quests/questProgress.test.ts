import { describe, expect, it } from 'vitest';

import {
  DEFAULT_PROFILE_ID,
  getHighestCompletedLevel,
  getNextQuest,
  getReviewRecommendation,
  getUnlockedQuests,
  recordQuestAttempt,
  type Quest,
  type QuestProgress,
} from './questProgress';

const quests: Quest[] = [
  {
    id: 'math-1',
    categoryId: 'math',
    title: 'Count the apples',
    level: 1,
    order: 1,
    introduction: 'Count together.',
    reward: { id: 'math-star-1', title: 'Apple Star', type: 'star' },
    steps: [
      {
        id: 'math-1-step-1',
        type: 'choice',
        instructionText: 'How many apples?',
        choices: [
          { id: 'two', label: '2' },
          { id: 'three', label: '3' },
        ],
        correctChoiceId: 'three',
        hintText: 'Count one by one.',
        successMessage: 'Great counting.',
      },
    ],
  },
  {
    id: 'math-2',
    categoryId: 'math',
    title: 'Find the triangle',
    level: 2,
    order: 2,
    introduction: 'Find the shape.',
    reward: { id: 'math-star-2', title: 'Shape Star', type: 'star' },
    steps: [
      {
        id: 'math-2-step-1',
        type: 'choice',
        instructionText: 'Which one is a triangle?',
        choices: [
          { id: 'circle', label: 'Circle' },
          { id: 'triangle', label: 'Triangle' },
          { id: 'square', label: 'Square' },
        ],
        correctChoiceId: 'triangle',
        hintText: 'Look for three corners.',
        successMessage: 'You found the triangle.',
      },
    ],
  },
  {
    id: 'math-3',
    categoryId: 'math',
    title: 'Match the pattern',
    level: 3,
    order: 3,
    introduction: 'Continue the pattern.',
    reward: { id: 'math-star-3', title: 'Pattern Star', type: 'star' },
    steps: [
      {
        id: 'math-3-step-1',
        type: 'choice',
        instructionText: 'What comes next?',
        choices: [
          { id: 'apple', label: 'Apple' },
          { id: 'banana', label: 'Banana' },
          { id: 'pear', label: 'Pear' },
        ],
        correctChoiceId: 'apple',
        hintText: 'Check the repeating picture.',
        successMessage: 'Pattern complete.',
      },
    ],
  },
  {
    id: 'language-1',
    categoryId: 'language',
    title: 'Pick the word',
    level: 1,
    order: 1,
    introduction: 'Listen and choose.',
    reward: { id: 'language-star-1', title: 'Sound Star', type: 'star' },
    steps: [
      {
        id: 'language-1-step-1',
        type: 'choice',
        instructionText: 'Which word matches?',
        choices: [
          { id: 'cat', label: 'Cat' },
          { id: 'dog', label: 'Dog' },
        ],
        correctChoiceId: 'dog',
        hintText: 'Listen again.',
        successMessage: 'Nice listening.',
      },
    ],
  },
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
      { profileId: DEFAULT_PROFILE_ID, questId: 'math-1', status: 'completed', attempts: 1 },
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
      { profileId: DEFAULT_PROFILE_ID, questId: 'math-1', status: 'completed', attempts: 1 },
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
      { profileId: DEFAULT_PROFILE_ID, questId: 'math-1', status: 'completed', attempts: 1 },
      { profileId: DEFAULT_PROFILE_ID, questId: 'math-2', status: 'completed', attempts: 2 },
      { profileId: DEFAULT_PROFILE_ID, questId: 'language-1', status: 'completed', attempts: 1 },
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
      { profileId: DEFAULT_PROFILE_ID, questId: 'math-1', status: 'completed', attempts: 1 },
      { profileId: DEFAULT_PROFILE_ID, questId: 'math-2', status: 'inProgress', attempts: 4 },
      { profileId: DEFAULT_PROFILE_ID, questId: 'math-3', status: 'notStarted', attempts: 0 },
    ];

    const recommendation = getReviewRecommendation({
      categoryId: 'math',
      quests,
      progress,
      attemptThreshold: 3,
    });

    expect(recommendation?.id).toBe('math-2');
  });

  it('records a missed choice as an in-progress attempt for the current profile', () => {
    const nextProgress = recordQuestAttempt([], {
      answeredCorrectly: false,
      now: '2026-06-06T00:00:00.000Z',
      profileId: DEFAULT_PROFILE_ID,
      questId: 'math-1',
    });

    expect(nextProgress).toEqual([
      {
        attempts: 1,
        lastPlayedAt: '2026-06-06T00:00:00.000Z',
        profileId: DEFAULT_PROFILE_ID,
        questId: 'math-1',
        status: 'inProgress',
      },
    ]);
  });

  it('records a correct choice as completed and preserves previous attempts', () => {
    const progress: QuestProgress[] = [
      {
        attempts: 2,
        lastPlayedAt: '2026-06-06T00:00:00.000Z',
        profileId: DEFAULT_PROFILE_ID,
        questId: 'math-1',
        status: 'inProgress',
      },
    ];

    const nextProgress = recordQuestAttempt(progress, {
      answeredCorrectly: true,
      now: '2026-06-06T00:05:00.000Z',
      profileId: DEFAULT_PROFILE_ID,
      questId: 'math-1',
    });

    expect(nextProgress).toEqual([
      {
        attempts: 3,
        completedAt: '2026-06-06T00:05:00.000Z',
        lastPlayedAt: '2026-06-06T00:05:00.000Z',
        profileId: DEFAULT_PROFILE_ID,
        questId: 'math-1',
        status: 'completed',
      },
    ]);
  });
});
