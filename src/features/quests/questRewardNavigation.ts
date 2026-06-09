import {
  DEFAULT_PROFILE_ID,
  getNextQuest,
  type Quest,
  type QuestProgress,
} from './questProgress';

interface NextQuestAfterRewardInput {
  completedQuestId: string;
  profileId?: string;
  progress: QuestProgress[];
  quests: Quest[];
}

export function getNextQuestAfterReward({
  completedQuestId,
  profileId = DEFAULT_PROFILE_ID,
  progress,
  quests,
}: NextQuestAfterRewardInput) {
  const completedQuest = quests.find((quest) => quest.id === completedQuestId);

  if (!completedQuest) {
    return null;
  }

  const completedCategoryQuestIds = quests
    .filter((quest) => quest.categoryId === completedQuest.categoryId)
    .sort((a, b) => a.order - b.order || a.level - b.level)
    .filter(
      (quest) =>
        quest.order < completedQuest.order ||
        (quest.order === completedQuest.order && quest.level <= completedQuest.level),
    )
    .map((quest) => quest.id);
  const completedQuestIdSet = new Set(completedCategoryQuestIds);
  const forcedCompletedProgress = completedCategoryQuestIds.map((questId) => {
    const existingProgress = progress.find(
      (item) => item.profileId === profileId && item.questId === questId,
    );

    return {
      ...existingProgress,
      attempts: existingProgress?.attempts ?? 0,
      profileId,
      questId,
      status: 'completed' as const,
    };
  });
  const effectiveProgress = [
    ...progress.filter(
      (item) => item.profileId !== profileId || !completedQuestIdSet.has(item.questId),
    ),
    ...forcedCompletedProgress,
  ];

  return getNextQuest({
    categoryId: completedQuest.categoryId,
    profileId,
    quests,
    progress: effectiveProgress,
  });
}
