import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  DEFAULT_PROFILE_ID,
  recordQuestAttempt,
  type QuestProgress,
} from './questProgress';
import { getQuestProgressStorage, loadQuestProgress, saveQuestProgress } from './questProgressStore';

export function useQuestProgress(profileId = DEFAULT_PROFILE_ID) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [progress, setProgress] = useState<QuestProgress[]>([]);
  const storage = useMemo(() => getQuestProgressStorage(), []);

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

  return {
    isLoaded,
    progress,
    profileId,
    profileProgress,
    recordAttempt,
  };
}
