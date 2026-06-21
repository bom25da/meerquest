import { describe, expect, it } from 'vitest';

import {
  DEFAULT_PROFILE_ID,
  type Quest,
  type QuestProgress,
} from '@/src/features/quests/questProgress';

import { quests } from './quests';
import {
  getQuestMapCategories,
  getQuestMapCopy,
  getQuestMapRegionSummary,
  getQuestMapTrailRows,
  getQuestMapVisibleStepWindow,
} from './questMap';

describe('quest map content helpers', () => {
  it('shows every category when opened from the quest map button', () => {
    expect(getQuestMapCategories().map((category) => category.id)).toEqual([
      'math',
      'language',
      'social',
      'safety',
    ]);
    expect(getQuestMapCopy().title).toBe('퀘스트 맵');
  });

  it('shows only the selected category when opened from a home region card', () => {
    expect(getQuestMapCategories('language').map((category) => category.id)).toEqual([
      'language',
    ]);
    expect(getQuestMapCopy('language')).toEqual({
      title: '언어 언덕',
      subtitle: '선택한 탐험 지역의 퀘스트를 한 단계씩 깨봐요.',
    });
  });

  it('falls back to every category for unknown category parameters', () => {
    expect(getQuestMapCategories('unknown').map((category) => category.id)).toEqual([
      'math',
      'language',
      'social',
      'safety',
    ]);
  });

  it('summarizes completed, current, and locked quest steps for a region card', () => {
    const progress: QuestProgress[] = [
      { profileId: DEFAULT_PROFILE_ID, questId: 'math-1', status: 'completed', attempts: 1 },
    ];

    const summary = getQuestMapRegionSummary({
      categoryId: 'math',
      progress,
      quests,
    });

    expect(summary.completedCount).toBe(1);
    expect(summary.totalCount).toBe(20);
    expect(summary.currentQuest?.id).toBe('math-2');
    expect(summary.steps.map((step) => [step.questId, step.status])).toEqual([
      ['math-1', 'completed'],
      ['math-2', 'current'],
      ['math-3', 'locked'],
      ['math-4', 'locked'],
      ['math-5', 'locked'],
      ['math-6', 'locked'],
      ['math-7', 'locked'],
      ['math-8', 'locked'],
      ['math-9', 'locked'],
      ['math-10', 'locked'],
      ['math-11', 'locked'],
      ['math-12', 'locked'],
      ['math-13', 'locked'],
      ['math-14', 'locked'],
      ['math-15', 'locked'],
      ['math-16', 'locked'],
      ['math-17', 'locked'],
      ['math-18', 'locked'],
      ['math-19', 'locked'],
      ['math-20', 'locked'],
    ]);
  });

  it('has no current quest when every quest in the region is completed', () => {
    const progress: QuestProgress[] = quests
      .filter((quest) => quest.categoryId === 'math')
      .map((quest) => ({
        attempts: 1,
        profileId: DEFAULT_PROFILE_ID,
        questId: quest.id,
        status: 'completed' as const,
      }));

    const summary = getQuestMapRegionSummary({
      categoryId: 'math',
      progress,
      quests,
    });

    expect(summary.completedCount).toBe(20);
    expect(summary.currentQuest).toBeNull();
    expect(summary.steps.map((step) => step.status)).toEqual([
      'completed',
      'completed',
      'completed',
      'completed',
      'completed',
      'completed',
      'completed',
      'completed',
      'completed',
      'completed',
      'completed',
      'completed',
      'completed',
      'completed',
      'completed',
      'completed',
      'completed',
      'completed',
      'completed',
      'completed',
    ]);
  });

  it('keeps every step when a region grows beyond the first five quests', () => {
    const growingQuests: Quest[] = Array.from({ length: 8 }, (_, index) => ({
      categoryId: 'math',
      id: `math-${index + 1}`,
      introduction: '탐험을 시작해요.',
      level: index + 1,
      order: index + 1,
      reward: { id: `math-star-${index + 1}`, title: '탐험 별', type: 'star' },
      steps: [
        {
          choices: [
            { id: 'a', label: 'A' },
            { id: 'b', label: 'B' },
          ],
          correctChoiceId: 'a',
          hintText: '천천히 살펴봐요.',
          id: `math-${index + 1}-step-1`,
          instructionText: '맞는 것을 골라요.',
          successMessage: '좋아요.',
          type: 'choice',
        },
      ],
      title: `수학 탐험 ${index + 1}`,
    }));
    const progress: QuestProgress[] = growingQuests.slice(0, 6).map((quest) => ({
      attempts: 1,
      profileId: DEFAULT_PROFILE_ID,
      questId: quest.id,
      status: 'completed' as const,
    }));

    const summary = getQuestMapRegionSummary({
      categoryId: 'math',
      progress,
      quests: growingQuests,
    });

    expect(summary.totalCount).toBe(8);
    expect(summary.completedCount).toBe(6);
    expect(summary.currentQuest?.id).toBe('math-7');
    expect(summary.steps.map((step) => step.questId)).toEqual([
      'math-1',
      'math-2',
      'math-3',
      'math-4',
      'math-5',
      'math-6',
      'math-7',
      'math-8',
    ]);
  });

  it('lays out long quest trails into alternating rows without dropping steps', () => {
    const summary = getQuestMapRegionSummary({
      categoryId: 'math',
      progress: [],
      quests,
    });

    const rows = getQuestMapTrailRows(summary.steps, { maxStepsPerRow: 3 });

    expect(rows.map((row) => row.direction)).toEqual([
      'forward',
      'reverse',
      'forward',
      'reverse',
      'forward',
      'reverse',
      'forward',
    ]);
    expect(rows.map((row) => row.steps.map((step) => step.questId))).toEqual([
      ['math-1', 'math-2', 'math-3'],
      ['math-4', 'math-5', 'math-6'],
      ['math-7', 'math-8', 'math-9'],
      ['math-10', 'math-11', 'math-12'],
      ['math-13', 'math-14', 'math-15'],
      ['math-16', 'math-17', 'math-18'],
      ['math-19', 'math-20'],
    ]);
    expect(rows.flatMap((row) => row.steps.map((step) => step.questId))).toEqual([
      'math-1',
      'math-2',
      'math-3',
      'math-4',
      'math-5',
      'math-6',
      'math-7',
      'math-8',
      'math-9',
      'math-10',
      'math-11',
      'math-12',
      'math-13',
      'math-14',
      'math-15',
      'math-16',
      'math-17',
      'math-18',
      'math-19',
      'math-20',
    ]);
  });

  it('shows only the consecutive window ending at the focused far step', () => {
    const longQuests = createMathQuests(100);
    const progress: QuestProgress[] = longQuests.slice(0, 99).map((quest) => ({
      attempts: 1,
      profileId: DEFAULT_PROFILE_ID,
      questId: quest.id,
      status: 'completed' as const,
    }));
    const summary = getQuestMapRegionSummary({
      categoryId: 'math',
      progress,
      quests: longQuests,
    });

    const window = getQuestMapVisibleStepWindow(summary.steps, {
      focusQuestId: summary.currentQuest?.id,
      visibleCount: 5,
    });

    expect(window.focusStep?.questId).toBe('math-100');
    expect(window.startIndex).toBe(95);
    expect(window.steps.map((step) => step.quest.level)).toEqual([96, 97, 98, 99, 100]);
    expect(window.steps.map((step) => step.questId)).not.toContain('math-1');
    expect(window.steps.map((step) => step.questId)).not.toContain('math-2');
  });

  it('keeps five consecutive visible steps near the beginning when possible', () => {
    const longQuests = createMathQuests(100);
    const summary = getQuestMapRegionSummary({
      categoryId: 'math',
      progress: [],
      quests: longQuests,
    });

    const window = getQuestMapVisibleStepWindow(summary.steps, {
      focusQuestId: summary.currentQuest?.id,
      visibleCount: 5,
    });

    expect(window.focusStep?.questId).toBe('math-1');
    expect(window.startIndex).toBe(0);
    expect(window.steps.map((step) => step.quest.level)).toEqual([1, 2, 3, 4, 5]);
  });
});

function createMathQuests(count: number): Quest[] {
  return Array.from({ length: count }, (_, index) => ({
    categoryId: 'math',
    id: `math-${index + 1}`,
    introduction: '탐험을 시작해요.',
    level: index + 1,
    order: index + 1,
    reward: { id: `math-star-${index + 1}`, title: '탐험 별', type: 'star' },
    steps: [
      {
        choices: [
          { id: 'a', label: 'A' },
          { id: 'b', label: 'B' },
        ],
        correctChoiceId: 'a',
        hintText: '천천히 살펴봐요.',
        id: `math-${index + 1}-step-1`,
        instructionText: '맞는 것을 골라요.',
        successMessage: '좋아요.',
        type: 'choice',
      },
    ],
    title: `수학 탐험 ${index + 1}`,
  }));
}
