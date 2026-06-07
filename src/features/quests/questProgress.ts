import type { QuestCategoryId } from '@/src/content/categories';

export const DEFAULT_PROFILE_ID = 'default-child';

export type QuestRewardType = 'star' | 'badge' | 'sticker';
export type QuestVisualLayout = 'apple-count';
export type QuestBackgroundAsset = 'math-cave-background';

export interface QuestReward {
  id: string;
  title: string;
  type: QuestRewardType;
}

export interface QuestChoice {
  id: string;
  label: string;
}

export interface QuestStep {
  id: string;
  type: 'choice';
  instructionText: string;
  choices: QuestChoice[];
  correctChoiceId: string;
  hintText: string;
  successMessage: string;
}

export interface Quest {
  id: string;
  categoryId: QuestCategoryId;
  title: string;
  level: number;
  order: number;
  introduction: string;
  reward: QuestReward;
  steps: QuestStep[];
  backgroundAsset?: QuestBackgroundAsset;
  visualLayout?: QuestVisualLayout;
}

export type QuestProgressStatus = 'notStarted' | 'inProgress' | 'completed';

export interface QuestProgress {
  profileId: string;
  questId: string;
  status: QuestProgressStatus;
  attempts: number;
  completedAt?: string;
  lastPlayedAt?: string;
}

interface QuestProgressInput {
  categoryId: QuestCategoryId;
  profileId?: string;
  quests: Quest[];
  progress: QuestProgress[];
}

interface ReviewRecommendationInput extends QuestProgressInput {
  attemptThreshold?: number;
}

interface RecordQuestAttemptInput {
  answeredCorrectly: boolean;
  now: string;
  profileId?: string;
  questId: string;
}

const byOrder = (a: Quest, b: Quest) => a.order - b.order || a.level - b.level;

const getCategoryQuests = (categoryId: QuestCategoryId, quests: Quest[]) =>
  quests.filter((quest) => quest.categoryId === categoryId).sort(byOrder);

const getProgress = (
  questId: string,
  progress: QuestProgress[],
  profileId = DEFAULT_PROFILE_ID,
) => progress.find((item) => item.profileId === profileId && item.questId === questId);

const isCompleted = (questId: string, progress: QuestProgress[], profileId = DEFAULT_PROFILE_ID) =>
  getProgress(questId, progress, profileId)?.status === 'completed';

export function getUnlockedQuests({
  categoryId,
  profileId = DEFAULT_PROFILE_ID,
  quests,
  progress,
}: QuestProgressInput) {
  const categoryQuests = getCategoryQuests(categoryId, quests);

  if (categoryQuests.length === 0) {
    return [];
  }

  return categoryQuests.filter((quest, index) => {
    if (index === 0) {
      return true;
    }

    const previousQuest = categoryQuests[index - 1];
    return isCompleted(previousQuest.id, progress, profileId);
  });
}

export function getNextQuest(input: QuestProgressInput) {
  const unlockedQuests = getUnlockedQuests(input);
  const profileId = input.profileId ?? DEFAULT_PROFILE_ID;

  return unlockedQuests.find((quest) => !isCompleted(quest.id, input.progress, profileId)) ?? null;
}

export function getHighestCompletedLevel({
  categoryId,
  profileId = DEFAULT_PROFILE_ID,
  quests,
  progress,
}: QuestProgressInput) {
  return getCategoryQuests(categoryId, quests).reduce((highestLevel, quest) => {
    if (!isCompleted(quest.id, progress, profileId)) {
      return highestLevel;
    }

    return Math.max(highestLevel, quest.level);
  }, 0);
}

export function getEarnedStarCount({
  profileId = DEFAULT_PROFILE_ID,
  quests,
  progress,
}: Pick<QuestProgressInput, 'profileId' | 'quests' | 'progress'>) {
  return quests.reduce((count, quest) => {
    if (quest.reward.type !== 'star') {
      return count;
    }

    return isCompleted(quest.id, progress, profileId) ? count + 1 : count;
  }, 0);
}

export function getReviewRecommendation({
  categoryId,
  profileId = DEFAULT_PROFILE_ID,
  quests,
  progress,
  attemptThreshold = 3,
}: ReviewRecommendationInput) {
  const unlockedQuests = getUnlockedQuests({ categoryId, profileId, quests, progress });

  return (
    unlockedQuests
      .filter(
        (quest) => (getProgress(quest.id, progress, profileId)?.attempts ?? 0) >= attemptThreshold,
      )
      .sort((a, b) => {
        const aAttempts = getProgress(a.id, progress, profileId)?.attempts ?? 0;
        const bAttempts = getProgress(b.id, progress, profileId)?.attempts ?? 0;

        return bAttempts - aAttempts || a.order - b.order;
      })[0] ?? null
  );
}

export function recordQuestAttempt(
  progress: QuestProgress[],
  {
    answeredCorrectly,
    now,
    profileId = DEFAULT_PROFILE_ID,
    questId,
  }: RecordQuestAttemptInput,
) {
  const existing = getProgress(questId, progress, profileId);
  const nextRecord: QuestProgress = {
    ...existing,
    attempts: (existing?.attempts ?? 0) + 1,
    lastPlayedAt: now,
    profileId,
    questId,
    status: answeredCorrectly ? 'completed' : 'inProgress',
    ...(answeredCorrectly ? { completedAt: now } : {}),
  };

  const otherProgress = progress.filter(
    (item) => item.profileId !== profileId || item.questId !== questId,
  );

  return [...otherProgress, nextRecord];
}
