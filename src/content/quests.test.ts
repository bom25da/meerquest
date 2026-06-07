import { describe, expect, it } from 'vitest';

import { categories } from './categories';
import { quests } from './quests';

describe('quest content', () => {
  it('provides five ordered quests for every learning category', () => {
    for (const category of categories) {
      const categoryQuests = quests.filter((quest) => quest.categoryId === category.id);

      expect(categoryQuests).toHaveLength(5);
      expect(categoryQuests.map((quest) => quest.level)).toEqual([1, 2, 3, 4, 5]);
      expect(categoryQuests.map((quest) => quest.order)).toEqual([1, 2, 3, 4, 5]);
    }
  });

  it('defines a playable choice step and reward for every quest', () => {
    for (const quest of quests) {
      expect(quest.reward.title.length).toBeGreaterThan(0);
      expect(quest.steps).toHaveLength(1);
      expect(quest.steps[0].type).toBe('choice');
      expect(quest.steps[0].choices.map((choice) => choice.id)).toContain(
        quest.steps[0].correctChoiceId,
      );
      expect(quest.steps[0].hintText.length).toBeGreaterThan(0);
      expect(quest.steps[0].successMessage.length).toBeGreaterThan(0);
    }
  });

  it('uses a dedicated visual layout for the first apple counting quest', () => {
    expect(quests.find((quest) => quest.id === 'math-1')?.visualLayout).toBe('apple-count');
  });

  it('uses the math cave background for the first math quest', () => {
    expect(quests.find((quest) => quest.id === 'math-1')?.backgroundAsset).toBe(
      'math-cave-background',
    );
  });
});
