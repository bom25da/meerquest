import { categories } from './categories';
import type { QuestCategory, QuestCategoryId } from './categories';
import {
  DEFAULT_PROFILE_ID,
  getUnlockedQuests,
  type Quest,
  type QuestProgress,
} from '@/src/features/quests/questProgress';

export interface QuestMapCopy {
  title: string;
  subtitle: string;
}

export type QuestMapStepStatus = 'completed' | 'current' | 'locked';

export interface QuestMapRegionStep {
  quest: Quest;
  questId: string;
  status: QuestMapStepStatus;
}

export interface QuestMapRegionSummary {
  categoryId: QuestCategoryId;
  completedCount: number;
  currentQuest: Quest | null;
  steps: QuestMapRegionStep[];
  totalCount: number;
}

export type QuestMapTrailDirection = 'forward' | 'reverse';

export interface QuestMapTrailRow {
  direction: QuestMapTrailDirection;
  rowIndex: number;
  steps: QuestMapRegionStep[];
}

export interface QuestMapVisibleStepWindow {
  focusIndex: number;
  focusStep: QuestMapRegionStep | null;
  startIndex: number;
  steps: QuestMapRegionStep[];
}

interface QuestMapRegionSummaryInput {
  categoryId: QuestCategoryId;
  profileId?: string;
  progress: QuestProgress[];
  quests: Quest[];
}

interface QuestMapTrailRowsOptions {
  maxStepsPerRow: number;
}

interface QuestMapVisibleStepWindowOptions {
  focusQuestId?: string | null;
  visibleCount: number;
}

const categoryIds = new Set<QuestCategoryId>(categories.map((category) => category.id));

function getCategoryIdParam(categoryId?: string | string[]): string | undefined {
  return Array.isArray(categoryId) ? categoryId[0] : categoryId;
}

export function getQuestMapCategories(categoryId?: string | string[]): QuestCategory[] {
  const selectedCategoryId = getCategoryIdParam(categoryId);

  if (!selectedCategoryId || !categoryIds.has(selectedCategoryId as QuestCategoryId)) {
    return categories;
  }

  return categories.filter((category) => category.id === selectedCategoryId);
}

export function getQuestMapCopy(categoryId?: string | string[]): QuestMapCopy {
  const selectedCategories = getQuestMapCategories(categoryId);

  if (selectedCategories.length === 1) {
    return {
      title: selectedCategories[0].title,
      subtitle: '선택한 탐험 지역의 퀘스트를 한 단계씩 깨봐요.',
    };
  }

  return {
    title: '퀘스트 맵',
    subtitle: '완료한 퀘스트 다음에는 조금 더 깊은 땅굴이 열려요.',
  };
}

export function getQuestMapRegionSummary({
  categoryId,
  profileId = DEFAULT_PROFILE_ID,
  progress,
  quests,
}: QuestMapRegionSummaryInput): QuestMapRegionSummary {
  const categoryQuests = quests
    .filter((quest) => quest.categoryId === categoryId)
    .sort((a, b) => a.order - b.order || a.level - b.level);
  const unlockedIds = new Set(
    getUnlockedQuests({
      categoryId,
      profileId,
      progress,
      quests,
    }).map((quest) => quest.id),
  );
  const completedIds = new Set(
    progress
      .filter((item) => item.profileId === profileId && item.status === 'completed')
      .map((item) => item.questId),
  );

  const steps = categoryQuests.map((quest) => {
    const status: QuestMapStepStatus = completedIds.has(quest.id)
      ? 'completed'
      : unlockedIds.has(quest.id)
        ? 'current'
        : 'locked';

    return {
      quest,
      questId: quest.id,
      status,
    };
  });

  return {
    categoryId,
    completedCount: steps.filter((step) => step.status === 'completed').length,
    currentQuest: steps.find((step) => step.status === 'current')?.quest ?? null,
    steps,
    totalCount: categoryQuests.length,
  };
}

export function getQuestMapTrailRows(
  steps: QuestMapRegionStep[],
  { maxStepsPerRow }: QuestMapTrailRowsOptions,
): QuestMapTrailRow[] {
  const rowCapacity = Math.max(1, Math.floor(maxStepsPerRow));
  const rows: QuestMapTrailRow[] = [];

  for (let startIndex = 0; startIndex < steps.length; startIndex += rowCapacity) {
    const rowIndex = rows.length;

    rows.push({
      direction: rowIndex % 2 === 0 ? 'forward' : 'reverse',
      rowIndex,
      steps: steps.slice(startIndex, startIndex + rowCapacity),
    });
  }

  return rows;
}

export function getQuestMapVisibleStepWindow(
  steps: QuestMapRegionStep[],
  { focusQuestId, visibleCount }: QuestMapVisibleStepWindowOptions,
): QuestMapVisibleStepWindow {
  if (steps.length === 0) {
    return {
      focusIndex: -1,
      focusStep: null,
      startIndex: 0,
      steps: [],
    };
  }

  const windowSize = Math.max(1, Math.floor(visibleCount));
  const requestedFocusIndex =
    focusQuestId === undefined || focusQuestId === null
      ? -1
      : steps.findIndex((step) => step.questId === focusQuestId);
  const currentIndex = steps.findIndex((step) => step.status === 'current');
  const lastCompletedIndex = findLastIndex(steps, (step) => step.status === 'completed');
  const focusIndex =
    requestedFocusIndex >= 0
      ? requestedFocusIndex
      : currentIndex >= 0
        ? currentIndex
        : Math.max(lastCompletedIndex, 0);
  const maxStartIndex = Math.max(0, steps.length - windowSize);
  const startIndex = Math.min(Math.max(0, focusIndex - windowSize + 1), maxStartIndex);

  return {
    focusIndex,
    focusStep: steps[focusIndex] ?? null,
    startIndex,
    steps: steps.slice(startIndex, startIndex + windowSize),
  };
}

function findLastIndex<T>(items: T[], predicate: (item: T) => boolean) {
  for (let index = items.length - 1; index >= 0; index -= 1) {
    if (predicate(items[index])) {
      return index;
    }
  }

  return -1;
}
