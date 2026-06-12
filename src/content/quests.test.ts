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

  it('uses an animal sound story prompt for the first language hill quest', () => {
    const languageQuest = quests.find((quest) => quest.id === 'language-1');

    expect(languageQuest?.backgroundAsset).toBe('language-hill-background');
    expect(languageQuest?.visualLayout).toBe('animal-sound');
    expect(languageQuest?.title).toBe('언덕 뒤 동물 소리');
    expect(languageQuest?.introduction).toBe('언덕 뒤에서 나는 동물 소리를 들어봐요.');
    expect(languageQuest?.steps[0].instructionText).toBe(
      '언덕 뒤에서 동물 소리가 들려요. 어떤 동물 소리일까요?',
    );
    expect(languageQuest?.steps[0].choices.map((choice) => choice.label)).toEqual([
      '강아지',
      '고양이',
    ]);
    expect(languageQuest?.steps[0].correctChoiceId).toBe('dog');
    expect(languageQuest?.steps[0].soundAsset).toBe('dog-bark');
    expect(languageQuest?.steps[0].hintText).toBe('멍멍 하고 짖는 동물을 떠올려봐요.');
  });

  it('uses a banana eating story prompt for the second language hill quest', () => {
    const languageQuest = quests.find((quest) => quest.id === 'language-2');

    expect(languageQuest?.backgroundAsset).toBe('language-hill-background');
    expect(languageQuest?.visualLayout).toBe('food-name');
    expect(languageQuest?.title).toBe('무엇을 먹고 있을까요');
    expect(languageQuest?.introduction).toBe('미어로가 먹고 있는 것을 살펴봐요.');
    expect(languageQuest?.steps[0].instructionText).toBe(
      '미어로가 배가고파서 무언가를 먹고있어요. 무엇을 먹고 있을까요?',
    );
    expect(languageQuest?.steps[0].choices.map((choice) => choice.label)).toEqual([
      '바나나',
      '빵',
      '사과',
    ]);
    expect(languageQuest?.steps[0].correctChoiceId).toBe('banana');
    expect(languageQuest?.steps[0].hintText).toBe('노랗고 길쭉한 과일을 먹고 있어요.');
  });

  it('uses a seed planting two-panel story for the third language hill quest', () => {
    const languageQuest = quests.find((quest) => quest.id === 'language-3');

    expect(languageQuest?.backgroundAsset).toBe('language-hill-background');
    expect(languageQuest?.visualLayout).toBe('story-sequence');
    expect(languageQuest?.title).toBe('씨앗 이야기');
    expect(languageQuest?.introduction).toBe('두 그림을 보고 미어로가 한 일을 골라요.');
    expect(languageQuest?.steps[0].instructionText).toBe(
      '미어로가 씨앗을 심고 무엇을 하고 있나요?',
    );
    expect(languageQuest?.steps[0].choices.map((choice) => choice.label)).toEqual([
      '물을 줘요',
      '잠을 자요',
      '달려요',
    ]);
    expect(languageQuest?.steps[0].correctChoiceId).toBe('water');
    expect(languageQuest?.steps[0].hintText).toBe('두 번째 그림에서 물뿌리개를 살펴봐요.');
  });

  it('uses a happy Meero expression prompt for the fourth language hill quest', () => {
    const languageQuest = quests.find((quest) => quest.id === 'language-4');

    expect(languageQuest?.backgroundAsset).toBe('language-hill-background');
    expect(languageQuest?.visualLayout).toBe('emotion-face');
    expect(languageQuest?.title).toBe('감정을 말해요');
    expect(languageQuest?.introduction).toBe('표정을 보고 감정을 말로 표현해요.');
    expect(languageQuest?.steps[0].instructionText).toBe(
      '활짝 웃는 얼굴은 어떤 기분일까요?',
    );
    expect(languageQuest?.steps[0].choices.map((choice) => choice.label)).toEqual([
      '기뻐요',
      '화나요',
      '졸려요',
    ]);
    expect(languageQuest?.steps[0].correctChoiceId).toBe('happy');
    expect(languageQuest?.steps[0].hintText).toBe('입꼬리가 올라가고 눈이 반짝여요.');
  });

  it('uses a Fena gift-giving story for the fifth language hill quest', () => {
    const languageQuest = quests.find((quest) => quest.id === 'language-5');

    expect(languageQuest?.backgroundAsset).toBe('language-hill-background');
    expect(languageQuest?.visualLayout).toBe('gift-thanks');
    expect(languageQuest?.title).toBe('도전 말 찾기');
    expect(languageQuest?.introduction).toBe('상황에 어울리는 말을 스스로 골라요.');
    expect(languageQuest?.steps[0].instructionText).toBe(
      '친구가 선물을 주면 어떤 말을 하면 좋을까요?',
    );
    expect(languageQuest?.steps[0].choices.map((choice) => choice.label)).toEqual([
      '고마워',
      '싫어',
      '잘 가',
    ]);
    expect(languageQuest?.steps[0].correctChoiceId).toBe('thanks');
    expect(languageQuest?.steps[0].hintText).toBe('좋은 마음을 받았을 때 쓰는 말을 떠올려요.');
  });

  it('uses a Fena toy-sharing story for the first social playground quest', () => {
    const socialQuest = quests.find((quest) => quest.id === 'social-1');

    expect(socialQuest?.backgroundAsset).toBe('social-playground-background');
    expect(socialQuest?.visualLayout).toBe('toy-share');
    expect(socialQuest?.title).toBe('친구가 빌리고 싶대');
    expect(socialQuest?.introduction).toBe('친구와 장난감을 나누는 방법을 배워요.');
    expect(socialQuest?.steps[0].instructionText).toBe(
      '친구가 장난감을 빌리고 싶대요. 어떻게 말하면 좋을까요?',
    );
    expect(socialQuest?.steps[0].choices.map((choice) => choice.label)).toEqual([
      '같이 쓰자',
      '밀쳐요',
    ]);
    expect(socialQuest?.steps[0].correctChoiceId).toBe('share');
    expect(socialQuest?.steps[0].hintText).toBe('친구와 함께 즐겁게 노는 말을 찾아요.');
  });

  it('uses a Meero helping Fena story for the second social playground quest', () => {
    const socialQuest = quests.find((quest) => quest.id === 'social-2');

    expect(socialQuest?.backgroundAsset).toBe('social-playground-background');
    expect(socialQuest?.visualLayout).toBe('help-thanks');
    expect(socialQuest?.title).toBe('고마워를 말해요');
    expect(socialQuest?.introduction).toBe('도움을 받았을 때 하는 말을 배워요.');
    expect(socialQuest?.steps[0].instructionText).toBe(
      '미어로가 페나의 짐을 들어줬어요. 페나는 어떤 말을 하면 좋을까요?',
    );
    expect(socialQuest?.steps[0].choices.map((choice) => choice.label)).toEqual([
      '고마워',
      '화났어',
      '숨을래',
    ]);
    expect(socialQuest?.steps[0].correctChoiceId).toBe('thanks');
    expect(socialQuest?.steps[0].hintText).toBe('도움을 받았을 때 따뜻하게 하는 말이에요.');
  });
});
