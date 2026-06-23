import { useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  DEFAULT_PROFILE_ID,
  recordQuestCompletion,
  recordQuestAttempt,
  type QuestProgress,
} from './questProgress';
import { getQuestProgressStorage, loadQuestProgress, saveQuestProgress } from './questProgressStore';

export function useQuestProgress(profileId = DEFAULT_PROFILE_ID) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [progress, setProgress] = useState<QuestProgress[]>([]);
  const storage = useMemo(() => getQuestProgressStorage(() => AsyncStorage), []);

  useEffect(() => {
    let isMounted = true;

    loadQuestProgress(storage).then((storedProgress) => {
      if (!isMounted) {
        return;
      }

      setProgress(storedProgress);
      setIsLoaded(true);
    });

    return () => {
      isMounted = false;
    };
  }, [storage]);

  const profileProgress = useMemo(
    () => progress.filter((item) => item.profileId === profileId),
    [profileId, progress],
  );

  const recordAttempt = useCallback(
    async (questId: string, answeredCorrectly: boolean) => {
      const now = new Date().toISOString();
      const nextProgress = recordQuestAttempt(progress, {
        answeredCorrectly,
        now,
        profileId,
        questId,
      });

      setProgress(nextProgress);
      await saveQuestProgress(storage, nextProgress);

      return nextProgress.find(
        (item) => item.profileId === profileId && item.questId === questId,
      );
    },
    [profileId, progress, storage],
  );

  const completeQuest = useCallback(
    async (questId: string) => {
      const now = new Date().toISOString();
      const nextProgress = recordQuestCompletion(progress, {
        now,
        profileId,
        questId,
      });

      setProgress(nextProgress);
      await saveQuestProgress(storage, nextProgress);

      return nextProgress.find(
        (item) => item.profileId === profileId && item.questId === questId,
      );
    },
    [profileId, progress, storage],
  );

  return {
    completeQuest,
    isLoaded,
    progress,
    profileId,
    profileProgress,
    recordAttempt,
  };
}
