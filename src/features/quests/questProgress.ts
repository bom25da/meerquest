export interface Quest {
  id: string;
  categoryId: string;
  title: string;
  level: number;
  order: number;
}

export type QuestProgressStatus = 'notStarted' | 'inProgress' | 'completed';

export interface QuestProgress {
  questId: string;
  status: QuestProgressStatus;
  attempts: number;
}

interface QuestProgressInput {
  categoryId: string;
  quests: Quest[];
  progress: QuestProgress[];
}

interface ReviewRecommendationInput extends QuestProgressInput {
  attemptThreshold?: number;
}

const byOrder = (a: Quest, b: Quest) => a.order - b.order || a.level - b.level;

const getCategoryQuests = (categoryId: string, quests: Quest[]) =>
  quests.filter((quest) => quest.categoryId === categoryId).sort(byOrder);

const getProgress = (questId: string, progress: QuestProgress[]) =>
  progress.find((item) => item.questId === questId);

const isCompleted = (questId: string, progress: QuestProgress[]) =>
  getProgress(questId, progress)?.status === 'completed';

export function getUnlockedQuests({ categoryId, quests, progress }: QuestProgressInput) {
  const categoryQuests = getCategoryQuests(categoryId, quests);

  if (categoryQuests.length === 0) {
    return [];
  }

  return categoryQuests.filter((quest, index) => {
    if (index === 0) {
      return true;
    }

    const previousQuest = categoryQuests[index - 1];
    return isCompleted(previousQuest.id, progress);
  });
}

export function getNextQuest(input: QuestProgressInput) {
  const unlockedQuests = getUnlockedQuests(input);

  return unlockedQuests.find((quest) => !isCompleted(quest.id, input.progress)) ?? null;
}

export function getHighestCompletedLevel({ categoryId, quests, progress }: QuestProgressInput) {
  return getCategoryQuests(categoryId, quests).reduce((highestLevel, quest) => {
    if (!isCompleted(quest.id, progress)) {
      return highestLevel;
    }

    return Math.max(highestLevel, quest.level);
  }, 0);
}

export function getReviewRecommendation({
  categoryId,
  quests,
  progress,
  attemptThreshold = 3,
}: ReviewRecommendationInput) {
  const unlockedQuests = getUnlockedQuests({ categoryId, quests, progress });

  return (
    unlockedQuests
      .filter((quest) => (getProgress(quest.id, progress)?.attempts ?? 0) >= attemptThreshold)
      .sort((a, b) => {
        const aAttempts = getProgress(a.id, progress)?.attempts ?? 0;
        const bAttempts = getProgress(b.id, progress)?.attempts ?? 0;

        return bAttempts - aAttempts || a.order - b.order;
      })[0] ?? null
  );
}
