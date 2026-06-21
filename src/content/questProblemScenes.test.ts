import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import { questProblemSceneAssetFiles } from '@/src/content/questProblemSceneAssetFiles';
import { getQuestProblemScene } from '@/src/content/questProblemScenes';
import { quests } from '@/src/content/quests';

describe('quest problem scenes', () => {
  it('provides a problem-specific scene for every quest without a dedicated visual layout', () => {
    const fallbackQuests = quests.filter((quest) => !quest.visualLayout);

    expect(fallbackQuests.length).toBeGreaterThan(0);

    for (const quest of fallbackQuests) {
      const scene = getQuestProblemScene(quest.id, quest.categoryId);

      expect(scene.summary.length).toBeGreaterThan(0);
      expect(scene.items.length).toBeGreaterThanOrEqual(2);
      expect(scene.summary).not.toBe(`${quest.categoryId} 대표 이미지`);
    }
  });

  it('provides a generated PNG asset file for every quest without a dedicated visual layout', () => {
    const fallbackQuests = quests.filter((quest) => !quest.visualLayout);
    const assetFiles: Record<string, string> = questProblemSceneAssetFiles;

    for (const quest of fallbackQuests) {
      const assetFile = assetFiles[quest.id];

      expect(assetFile).toBe(`assets/images/quests/problem-scenes/${quest.id}.png`);
      expect(existsSync(resolve(process.cwd(), assetFile))).toBe(true);
    }
  });
});
