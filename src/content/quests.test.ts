import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { categories } from './categories';
import { quests } from './quests';

const twentyLevels = Array.from({ length: 20 }, (_, index) => index + 1);

describe('quest content', () => {
  it('provides twenty ordered quests for every learning category', () => {
    for (const category of categories) {
      const categoryQuests = quests.filter((quest) => quest.categoryId === category.id);

      expect(categoryQuests).toHaveLength(twentyLevels.length);
      expect(categoryQuests.map((quest) => quest.level)).toEqual(twentyLevels);
      expect(categoryQuests.map((quest) => quest.order)).toEqual(twentyLevels);
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

  it('matches the quest-questions markdown source of truth', () => {
    const expectedQuestions = parseQuestQuestionsMarkdown();

    expect(expectedQuestions).toHaveLength(80);

    for (const expectedQuestion of expectedQuestions) {
      const quest = quests.find((candidate) => candidate.id === expectedQuestion.id);

      expect(quest, expectedQuestion.id).toBeDefined();
      expect(quest?.title).toBe(expectedQuestion.title);
      expect(quest?.steps[0].instructionText).toBe(expectedQuestion.question);
      expect(quest?.steps[0].choices.map((choice) => choice.label)).toEqual(
        expectedQuestion.choices,
      );
      expect(
        quest?.steps[0].choices.find((choice) => choice.id === quest.steps[0].correctChoiceId)
          ?.label,
      ).toBe(expectedQuestion.answer);
    }
  });

  it('frames every quest prompt as a Meero story', () => {
    for (const quest of quests) {
      for (const step of quest.steps) {
        expect(step.instructionText).toContain('미어로');
      }
    }
  });

  it('uses the answer choice as the story target in the opposite-word prompt', () => {
    const languageQuest = quests.find((quest) => quest.id === 'language-6');

    expect(languageQuest?.steps[0].instructionText).toBe(
      '미어로가 큰 바위와 작은 조약돌을 보았어요. 작은 조약돌을 보고 뭐라고 말할까요?',
    );
    expect(languageQuest?.steps[0].correctChoiceId).toBe('small');
  });

  it('keeps fallback illustrated quest candidates for each category', () => {
    const fallbackQuests = quests.filter((quest) => !quest.visualLayout);

    expect(fallbackQuests.length).toBeGreaterThan(0);
    expect(new Set(fallbackQuests.map((quest) => quest.categoryId))).toEqual(
      new Set(['language', 'math', 'safety', 'social']),
    );
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
      '미어로가 사과나무 아래에서 사과 3개를 찾았어요. 미어로가 찾은 사과는 몇 개일까요?',
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
      '미어로가 문 앞에서 1번 동그라미 버튼과 2번 네모 버튼을 보았어요. 문을 열 동그라미 버튼은 몇 번인가요?',
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
      '졸린 미어로가 작은 구멍과 큰 구멍을 보았어요. 잠을 편하게 잘 큰 구멍은 몇 번인가요?',
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
      '미어로가 당근 2개를 들고 있는데 페나가 당근 1개를 건네줬어요. 미어로의 당근은 모두 몇 개가 되었나요?',
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

  it('uses a sparkling gem counting story prompt for the sixth math quest', () => {
    const mathQuest = quests.find((quest) => quest.id === 'math-6');

    expect(mathQuest?.backgroundAsset).toBe('math-cave-background');
    expect(mathQuest?.visualLayout).toBe('gem-count');
    expect(mathQuest?.title).toBe('반짝이는 보석을 세요');
    expect(mathQuest?.introduction).toBe('미어로가 동굴 바닥에서 반짝이는 보석을 찾았어요.');
    expect(mathQuest?.steps[0].instructionText).toBe(
      '미어로가 동굴에서 반짝이는 보석을 발견했어요. 미어로가 찾은 보석은 몇 개일까요?',
    );
    expect(mathQuest?.steps[0].choices.map((choice) => choice.label)).toEqual([
      '3개',
      '4개',
      '5개',
    ]);
    expect(mathQuest?.steps[0].correctChoiceId).toBe('four');
    expect(mathQuest?.steps[0].hintText).toBe('보석을 하나씩 천천히 세어봐요.');
  });

  it('uses a small-number door button prompt for the seventh math quest', () => {
    const mathQuest = quests.find((quest) => quest.id === 'math-7');

    expect(mathQuest?.backgroundAsset).toBe('math-cave-background');
    expect(mathQuest?.visualLayout).toBe('small-number');
    expect(mathQuest?.title).toBe('작은 수를 찾아요');
    expect(mathQuest?.introduction).toBe('미어로가 숫자 버튼이 달린 동굴 문을 발견했어요.');
    expect(mathQuest?.steps[0].instructionText).toBe(
      '미어로가 2와 5가 적힌 문 버튼을 보았어요. 더 작은 수의 버튼은 무엇인가요?',
    );
    expect(mathQuest?.steps[0].choices.map((choice) => choice.label)).toEqual(['2', '5']);
    expect(mathQuest?.steps[0].correctChoiceId).toBe('two');
    expect(mathQuest?.steps[0].hintText).toBe('수를 셀 때 더 먼저 나오는 숫자를 찾아봐요.');
  });

  it('uses a stone stack addition prompt for the eighth math quest', () => {
    const mathQuest = quests.find((quest) => quest.id === 'math-8');

    expect(mathQuest?.backgroundAsset).toBe('math-cave-background');
    expect(mathQuest?.visualLayout).toBe('stone-stack-addition');
    expect(mathQuest?.title).toBe('하나 더하면 몇 개일까');
    expect(mathQuest?.introduction).toBe('미어로가 조약돌을 하나 더 쌓으려고 해요.');
    expect(mathQuest?.steps[0].instructionText).toBe(
      '미어로가 조약돌 4개를 쌓고 하나를 더 올렸어요. 조약돌은 모두 몇 개가 되었나요?',
    );
    expect(mathQuest?.steps[0].choices.map((choice) => choice.label)).toEqual([
      '4개',
      '5개',
      '6개',
    ]);
    expect(mathQuest?.steps[0].correctChoiceId).toBe('five');
    expect(mathQuest?.steps[0].hintText).toBe('쌓여 있는 조약돌 4개에 하나를 더 세어봐요.');
  });

  it('uses a shape matching cave door prompt for the ninth math quest', () => {
    const mathQuest = quests.find((quest) => quest.id === 'math-9');

    expect(mathQuest?.backgroundAsset).toBe('math-cave-background');
    expect(mathQuest?.visualLayout).toBe('shape-match');
    expect(mathQuest?.title).toBe('같은 모양을 골라요');
    expect(mathQuest?.introduction).toBe('동굴 문에 같은 모양을 맞추는 홈이 있어요.');
    expect(mathQuest?.steps[0].instructionText).toBe(
      '미어로가 도형 조각을 들고 동굴 문 앞에 섰어요. 미어로가 들고 있는 도형은 무엇인가요?',
    );
    expect(mathQuest?.steps[0].choices.map((choice) => choice.label)).toEqual([
      '동그라미',
      '세모',
      '네모',
    ]);
    expect(mathQuest?.steps[0].correctChoiceId).toBe('circle');
    expect(mathQuest?.steps[0].hintText).toBe('둥글게 이어진 모양을 찾아봐요.');
  });

  it('uses a footprint sequence prompt for the tenth math quest', () => {
    const mathQuest = quests.find((quest) => quest.id === 'math-10');

    expect(mathQuest?.backgroundAsset).toBe('math-cave-background');
    expect(mathQuest?.visualLayout).toBe('footprint-sequence');
    expect(mathQuest?.title).toBe('열 번째 발자국');
    expect(mathQuest?.introduction).toBe('미어로가 숫자가 이어진 발자국 길을 발견했어요.');
    expect(mathQuest?.steps[0].instructionText).toBe(
      '미어로가 1, 2, 3, 4가 적힌 발자국을 따라갔어요. 빈 발자국에 이어질 숫자는 무엇인가요?',
    );
    expect(mathQuest?.steps[0].choices.map((choice) => choice.label)).toEqual(['3', '4', '5']);
    expect(mathQuest?.steps[0].correctChoiceId).toBe('five');
    expect(mathQuest?.steps[0].hintText).toBe('4 다음 숫자를 떠올려봐요.');
  });

  it('uses twelve as the answer for the twentieth math quest two-step count', () => {
    const mathQuest = quests.find((quest) => quest.id === 'math-20');

    expect(mathQuest?.steps[0].instructionText).toBe(
      '미어로가 숫자 10에서 두 걸음을 더 세어 도착했어요. 도착한 숫자는 무엇인가요?',
    );
    expect(mathQuest?.steps[0].choices.map((choice) => choice.label)).toEqual([
      '15',
      '20',
      '12',
    ]);
    expect(mathQuest?.steps[0].correctChoiceId).toBe('twelve');
    expect(mathQuest?.steps[0].hintText).toBe('10 다음에 11, 12처럼 두 번 더 세어봐요.');
    expect(mathQuest?.steps[0].successMessage).toBe('맞아, 10에서 두 걸음 더 가면 12야!');
  });

  it('uses an animal sound story prompt for the first language hill quest', () => {
    const languageQuest = quests.find((quest) => quest.id === 'language-1');

    expect(languageQuest?.backgroundAsset).toBe('language-hill-background');
    expect(languageQuest?.visualLayout).toBe('animal-sound');
    expect(languageQuest?.title).toBe('언덕 뒤 동물 소리');
    expect(languageQuest?.introduction).toBe('언덕 뒤에서 나는 동물 소리를 들어봐요.');
    expect(languageQuest?.steps[0].instructionText).toBe(
      '미어로가 언덕 뒤에서 멍멍 소리를 들었어요. 어떤 동물 소리일까요?',
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
      '미어로가 노랗고 길쭉한 과일을 먹고 있어요. 미어로가 먹는 것은 무엇인가요?',
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
      '미어로가 씨앗을 심고 물뿌리개를 들었어요. 미어로는 무엇을 하고 있나요?',
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
      '미어로가 활짝 웃고 있어요. 미어로의 기분은 어떨까요?',
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
      '페나가 미어로에게 선물을 건네줬어요. 미어로는 어떤 말을 하면 좋을까요?',
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
      '페나가 미어로의 장난감을 빌리고 싶어 해요. 미어로는 어떻게 말하면 좋을까요?',
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
      '미어로가 페나의 짐을 들어줬어요. 페나는 미어로에게 어떤 말을 하면 좋을까요?',
    );
    expect(socialQuest?.steps[0].choices.map((choice) => choice.label)).toEqual([
      '고마워',
      '화났어',
      '숨을래',
    ]);
    expect(socialQuest?.steps[0].correctChoiceId).toBe('thanks');
    expect(socialQuest?.steps[0].hintText).toBe('도움을 받았을 때 따뜻하게 하는 말이에요.');
  });

  it('uses a slide turn-taking story for the third social playground quest', () => {
    const socialQuest = quests.find((quest) => quest.id === 'social-3');

    expect(socialQuest?.backgroundAsset).toBe('social-playground-background');
    expect(socialQuest?.visualLayout).toBe('slide-wait');
    expect(socialQuest?.title).toBe('차례를 기다려요');
    expect(socialQuest?.introduction).toBe('놀이터에서 차례를 기다리는 방법을 골라요.');
    expect(socialQuest?.steps[0].instructionText).toBe(
      '페나가 미끄럼틀을 타려고 하고 미어로가 뒤에서 기다리고 있어요. 미어로는 어떻게 하면 좋을까요?',
    );
    expect(socialQuest?.steps[0].choices.map((choice) => choice.label)).toEqual([
      '기다려요',
      '밀어요',
      '앞으로 가요',
    ]);
    expect(socialQuest?.steps[0].correctChoiceId).toBe('wait');
    expect(socialQuest?.steps[0].hintText).toBe('페나가 먼저 탈 수 있도록 차례를 지켜요.');
  });
});

function parseQuestQuestionsMarkdown() {
  const markdown = readFileSync(resolve(process.cwd(), 'docs/quest-questions.md'), 'utf8');

  return markdown
    .split('\n')
    .filter((line) => /^\|\s*\d+/.test(line))
    .map((line) => {
      const columns = line
        .split('|')
        .slice(1, -1)
        .map((column) => column.trim());

      const [, id, title, question, choicesText, answer] = columns;

      return {
        answer,
        choices: choicesText.split('<br>').map((choice) => choice.replace(/^\d+\.\s*/, '')),
        id: id.replace(/`/g, ''),
        question,
        title,
      };
    });
}
