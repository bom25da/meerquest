import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

describe('useQuestProgress', () => {
  it('uses native AsyncStorage in the app and exposes idempotent quest completion', () => {
    const hookSource = readFileSync(
      resolve(process.cwd(), 'src/features/quests/useQuestProgress.ts'),
      'utf8',
    );

    expect(hookSource).toContain("@react-native-async-storage/async-storage");
    expect(hookSource).toContain('getQuestProgressStorage(() => AsyncStorage)');
    expect(hookSource).toContain('recordQuestCompletion');
    expect(hookSource).toContain('completeQuest');
  });
});
