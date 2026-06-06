import type { QuestProgress } from './questProgress';

export const QUEST_PROGRESS_STORAGE_KEY = 'meerquest:quest-progress:v1';

export interface QuestProgressStorageAdapter {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
}

type NativeStorageLoader = () => QuestProgressStorageAdapter;

let memoryStorageValue: string | null = null;

export function createMemoryQuestProgressStorage(): QuestProgressStorageAdapter {
  return {
    getItem: async (key) => (key === QUEST_PROGRESS_STORAGE_KEY ? memoryStorageValue : null),
    setItem: async (key, value) => {
      if (key === QUEST_PROGRESS_STORAGE_KEY) {
        memoryStorageValue = value;
      }
    },
  };
}

export function getQuestProgressStorage(loadNativeStorage?: NativeStorageLoader) {
  if (!loadNativeStorage) {
    return createMemoryQuestProgressStorage();
  }

  try {
    return loadNativeStorage();
  } catch {
    return createMemoryQuestProgressStorage();
  }
}

function isQuestProgress(value: unknown): value is QuestProgress {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const item = value as Partial<QuestProgress>;

  return (
    typeof item.profileId === 'string' &&
    typeof item.questId === 'string' &&
    typeof item.attempts === 'number' &&
    (item.status === 'notStarted' || item.status === 'inProgress' || item.status === 'completed')
  );
}

export async function loadQuestProgress(storage: QuestProgressStorageAdapter) {
  const storedValue = await storage.getItem(QUEST_PROGRESS_STORAGE_KEY);

  if (!storedValue) {
    return [];
  }

  try {
    const parsedValue: unknown = JSON.parse(storedValue);

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue.filter(isQuestProgress);
  } catch {
    return [];
  }
}

export async function saveQuestProgress(
  storage: QuestProgressStorageAdapter,
  progress: QuestProgress[],
) {
  await storage.setItem(QUEST_PROGRESS_STORAGE_KEY, JSON.stringify(progress));
}
