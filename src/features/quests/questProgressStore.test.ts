import { describe, expect, it } from 'vitest';

import { DEFAULT_PROFILE_ID, type QuestProgress } from './questProgress';
import {
  getQuestProgressStorage,
  loadQuestProgress,
  QUEST_PROGRESS_STORAGE_KEY,
  saveQuestProgress,
  type QuestProgressStorageAdapter,
} from './questProgressStore';

function createMemoryStorage(initialValue?: string): QuestProgressStorageAdapter {
  let value = initialValue ?? null;

  return {
    getItem: async (key) => (key === QUEST_PROGRESS_STORAGE_KEY ? value : null),
    setItem: async (key, nextValue) => {
      if (key === QUEST_PROGRESS_STORAGE_KEY) {
        value = nextValue;
      }
    },
  };
}

describe('quest progress store', () => {
  it('loads an empty progress list when storage is empty', async () => {
    const storage = createMemoryStorage();

    await expect(loadQuestProgress(storage)).resolves.toEqual([]);
  });

  it('saves and loads quest progress records', async () => {
    const storage = createMemoryStorage();
    const progress: QuestProgress[] = [
      {
        attempts: 2,
        completedAt: '2026-06-06T00:10:00.000Z',
        lastPlayedAt: '2026-06-06T00:10:00.000Z',
        profileId: DEFAULT_PROFILE_ID,
        questId: 'math-1',
        status: 'completed',
      },
    ];

    await saveQuestProgress(storage, progress);

    await expect(loadQuestProgress(storage)).resolves.toEqual(progress);
  });

  it('ignores malformed stored values instead of crashing app startup', async () => {
    const storage = createMemoryStorage('{not-json');

    await expect(loadQuestProgress(storage)).resolves.toEqual([]);
  });

  it('falls back to memory storage when native AsyncStorage cannot be loaded', async () => {
    const storage = getQuestProgressStorage(() => {
      throw new Error('NativeModule: AsyncStorage is null');
    });
    const progress: QuestProgress[] = [
      {
        attempts: 1,
        lastPlayedAt: '2026-06-06T00:20:00.000Z',
        profileId: DEFAULT_PROFILE_ID,
        questId: 'language-1',
        status: 'inProgress',
      },
    ];

    await saveQuestProgress(storage, progress);

    await expect(loadQuestProgress(storage)).resolves.toEqual(progress);
  });

  it('uses memory storage by default until a rebuilt native app can provide AsyncStorage', async () => {
    const storage = getQuestProgressStorage();
    const progress: QuestProgress[] = [
      {
        attempts: 1,
        lastPlayedAt: '2026-06-06T00:30:00.000Z',
        profileId: DEFAULT_PROFILE_ID,
        questId: 'math-1',
        status: 'inProgress',
      },
    ];

    await saveQuestProgress(storage, progress);

    await expect(loadQuestProgress(storage)).resolves.toEqual(progress);
  });
});
