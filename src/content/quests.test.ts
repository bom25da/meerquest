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

  it('uses the Meero apple discovery story prompt for the first math quest', () => {
    const mathQuest = quests.find((quest) => quest.id === 'math-1');

    expect(mathQuest?.introduction).toBe('미어로가 사과를 발견했어요.');
    expect(mathQuest?.steps[0].instructionText).toBe(
      '미어로가 사과를 발견했어. 사과는 몇개일까?',
    );
    expect(mathQuest?.steps[0].correctChoiceId).toBe('three');
  });

  it('uses the Meero circle-button door story prompt for the second math quest', () => {
    const mathQuest = quests.find((quest) => quest.id === 'math-2');

    expect(mathQuest?.backgroundAsset).toBe('math-cave-background');
    expect(mathQuest?.visualLayout).toBe('shape-find');
    expect(mathQuest?.title).toBe('동그라미 버튼을 찾아요');
    expect(mathQuest?.introduction).toBe('미어로가 문을 통과할 버튼을 찾아봐요.');
    expect(mathQuest?.steps[0].instructionText).toBe(
      '미어로가 문을 통과하기 위하여 동그라미 버튼을 눌러야해요. 동그라미 버튼은 무엇인가요?',
    );
    expect(mathQuest?.steps[0].choices.map((choice) => choice.id)).toEqual([
      'button-1',
      'button-2',
    ]);
    expect(mathQuest?.steps[0].choices.map((choice) => choice.label)).toEqual(['1번', '2번']);
    expect(mathQuest?.steps[0].correctChoiceId).toBe('button-1');
  });

  it('uses a dedicated size comparison layout for the fourth math quest', () => {
    const mathQuest = quests.find((quest) => quest.id === 'math-4');

    expect(mathQuest?.backgroundAsset).toBe('math-cave-background');
    expect(mathQuest?.visualLayout).toBe('size-compare');
    expect(mathQuest?.title).toBe('큰 잠자리 구멍을 골라요');
    expect(mathQuest?.introduction).toBe(
      '졸린 미어로가 잠을 잘 큰 구멍을 찾고 있어요.',
    );
    expect(mathQuest?.steps[0].instructionText).toBe(
      '졸린 미어로가 잠을 잘 큰 구멍을 찾고 있어요. 어떤 구멍이 클까요?',
    );
    expect(mathQuest?.steps[0].choices.map((choice) => choice.id)).toEqual([
      'hole-1',
      'hole-2',
    ]);
    expect(mathQuest?.steps[0].choices.map((choice) => choice.label)).toEqual(['1번', '2번']);
    expect(mathQuest?.steps[0].correctChoiceId).toBe('hole-2');
    expect(mathQuest?.steps[0].hintText).toBe('미어로가 몸을 편하게 넣을 수 있는 큰 구멍을 찾아봐요.');
    expect(mathQuest?.steps[0].successMessage).toBe(
      '좋아, 미어로가 큰 구멍에서 편히 잘 수 있겠어!',
    );
  });

  it('uses the Meero and Fena carrot addition story prompt for the fifth math quest', () => {
    const mathQuest = quests.find((quest) => quest.id === 'math-5');

    expect(mathQuest?.backgroundAsset).toBe('math-cave-background');
    expect(mathQuest?.visualLayout).toBe('carrot-addition');
    expect(mathQuest?.title).toBe('당근을 더해요');
    expect(mathQuest?.introduction).toBe('미어로와 페나가 당근을 함께 세어봐요.');
    expect(mathQuest?.steps[0].instructionText).toBe(
      '미어로가 당근 2개를 갖고 있었어요. 페나가 당근 1개를 주면 모두 몇 개일까요?',
    );
    expect(mathQuest?.steps[0].choices.map((choice) => choice.label)).toEqual([
      '2개',
      '3개',
      '4개',
    ]);
    expect(mathQuest?.steps[0].correctChoiceId).toBe('three');
    expect(mathQuest?.steps[0].hintText).toBe(
      '미어로가 가진 당근 2개에 페나가 준 당근 1개를 더해봐요.',
    );
  });
});
