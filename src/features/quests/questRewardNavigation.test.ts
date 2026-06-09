import { describe, expect, it } from 'vitest';

import {
  DEFAULT_PROFILE_ID,
  type Quest,
  type QuestProgress,
} from './questProgress';
import { getNextQuestAfterReward } from './questRewardNavigation';

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
        ],
        correctChoiceId: 'triangle',
        hintText: 'Look for three corners.',
        successMessage: 'You found the triangle.',
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
        ],
        correctChoiceId: 'apple',
        hintText: 'Check the repeating picture.',
        successMessage: 'Pattern complete.',
      },
    ],
  },
];

describe('quest reward navigation', () => {
  it('returns the next quest in the completed quest category', () => {
    const progress: QuestProgress[] = [
      { profileId: DEFAULT_PROFILE_ID, questId: 'math-1', status: 'completed', attempts: 1 },
    ];

    const nextQuest = getNextQuestAfterReward({
      completedQuestId: 'math-1',
      quests,
      progress,
    });

    expect(nextQuest?.id).toBe('math-2');
  });

  it('treats the reward quest as complete while stored progress is still loading', () => {
    const nextQuest = getNextQuestAfterReward({
      completedQuestId: 'math-1',
      quests,
      progress: [],
    });

    expect(nextQuest?.id).toBe('math-2');
  });

  it('keeps moving forward from a later quest while stored progress is still loading', () => {
    const nextQuest = getNextQuestAfterReward({
      completedQuestId: 'math-2',
      quests,
      progress: [],
    });

    expect(nextQuest?.id).toBe('math-3');
  });

  it('returns null when there is no next quest for the completed category', () => {
    const progress: QuestProgress[] = [
      { profileId: DEFAULT_PROFILE_ID, questId: 'math-1', status: 'completed', attempts: 1 },
      { profileId: DEFAULT_PROFILE_ID, questId: 'math-2', status: 'completed', attempts: 1 },
      { profileId: DEFAULT_PROFILE_ID, questId: 'math-3', status: 'completed', attempts: 1 },
    ];

    const nextQuest = getNextQuestAfterReward({
      completedQuestId: 'math-3',
      quests,
      progress,
    });

    expect(nextQuest).toBeNull();
  });

  it('returns null for an unknown reward quest', () => {
    const nextQuest = getNextQuestAfterReward({
      completedQuestId: 'unknown',
      quests,
      progress: [],
    });

    expect(nextQuest).toBeNull();
  });
});
