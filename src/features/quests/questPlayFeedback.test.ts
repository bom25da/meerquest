import { describe, expect, it } from 'vitest';

import {
  getChoiceFeedback,
  getNextIncorrectChoiceIds,
  getQuestContinueAction,
  getQuestFeedbackMessage,
  getQuestResultOverlay,
  isQuestRewardAvailable,
} from './questPlayFeedback';

describe('quest play feedback', () => {
  it('celebrates a correct choice and marks the quest complete', () => {
    expect(
      getChoiceFeedback({
        answeredCorrectly: true,
        attempts: 1,
        hintText: '손가락으로 사과를 하나씩 짚어봐요.',
        successMessage: '좋아, 하나씩 잘 세었어!',
      }),
    ).toEqual({
      feedbackMessage: '정답이에요! 좋아, 하나씩 잘 세었어!',
      isCompleted: true,
      mascotMood: 'clap',
    });
  });

  it('keeps a first incorrect choice encouraging and retryable', () => {
    expect(
      getChoiceFeedback({
        answeredCorrectly: false,
        attempts: 1,
        hintText: '손가락으로 사과를 하나씩 짚어봐요.',
        successMessage: '좋아, 하나씩 잘 세었어!',
      }),
    ).toEqual({
      feedbackMessage: '괜찮아, 다시 해보자. 손가락으로 사과를 하나씩 짚어봐요.',
      isCompleted: false,
      mascotMood: 'hint',
    });
  });

  it('switches to a thinking hint after repeated incorrect choices', () => {
    expect(
      getChoiceFeedback({
        answeredCorrectly: false,
        attempts: 2,
        hintText: '손가락으로 사과를 하나씩 짚어봐요.',
        successMessage: '좋아, 하나씩 잘 세었어!',
      }),
    ).toEqual({
      feedbackMessage: '우리 같이 생각해보자. 손가락으로 사과를 하나씩 짚어봐요.',
      isCompleted: false,
      mascotMood: 'thinking',
    });
  });

  it('keeps incorrect choices disabled without duplicating them', () => {
    expect(
      getNextIncorrectChoiceIds({
        answeredCorrectly: false,
        choiceId: 'two',
        incorrectChoiceIds: [],
      }),
    ).toEqual(['two']);

    expect(
      getNextIncorrectChoiceIds({
        answeredCorrectly: false,
        choiceId: 'two',
        incorrectChoiceIds: ['two'],
      }),
    ).toEqual(['two']);
  });

  it('does not add a correct choice to the disabled incorrect choices', () => {
    expect(
      getNextIncorrectChoiceIds({
        answeredCorrectly: true,
        choiceId: 'three',
        incorrectChoiceIds: ['two'],
      }),
    ).toEqual(['two']);
  });

  it('locks reward navigation until the quest is completed', () => {
    expect(isQuestRewardAvailable(false)).toBe(false);
    expect(isQuestRewardAvailable(true)).toBe(true);
  });

  it('moves to the next step only after a correct answer when more steps remain', () => {
    expect(
      getQuestContinueAction({
        currentStepIndex: 0,
        isStepComplete: false,
        totalSteps: 2,
      }),
    ).toBe('blocked');

    expect(
      getQuestContinueAction({
        currentStepIndex: 0,
        isStepComplete: true,
        totalSteps: 2,
      }),
    ).toBe('next-step');
  });

  it('moves to reward after the final step is complete', () => {
    expect(
      getQuestContinueAction({
        currentStepIndex: 1,
        isStepComplete: true,
        totalSteps: 2,
      }),
    ).toBe('reward');
  });

  it('tells the child to use the next arrow after a completed non-final step', () => {
    expect(
      getQuestFeedbackMessage({
        continueAction: 'next-step',
        feedbackMessage: '정답이에요! 좋아, 하나씩 잘 세었어!',
      }),
    ).toBe('정답이에요! 좋아, 하나씩 잘 세었어! 아래의 오른쪽 화살표를 눌러 다음 문제로 가요.');
  });

  it('tells the child to use the reward star after the final completed step', () => {
    expect(
      getQuestFeedbackMessage({
        continueAction: 'reward',
        feedbackMessage: '정답이에요! 좋아, 하나씩 잘 세었어!',
      }),
    ).toBe('정답이에요! 좋아, 하나씩 잘 세었어! 오른쪽 아래 별을 눌러 보상을 받아요.');
  });

  it('does not add a navigation prompt before a step is complete', () => {
    expect(
      getQuestFeedbackMessage({
        continueAction: 'blocked',
        feedbackMessage: '괜찮아, 다시 해보자. 손가락으로 사과를 하나씩 짚어봐요.',
      }),
    ).toBe('괜찮아, 다시 해보자. 손가락으로 사과를 하나씩 짚어봐요.');
  });

  it('shows a retry overlay after an incorrect selection', () => {
    expect(
      getQuestResultOverlay({
        continueAction: 'blocked',
        feedbackMessage: '괜찮아, 다시 해보자. 손가락으로 사과를 하나씩 짚어봐요.',
        isStepComplete: false,
        selectedChoiceId: 'two',
      }),
    ).toEqual({
      actionLabel: '다시 시도하기',
      message: '괜찮아, 다시 해보자. 손가락으로 사과를 하나씩 짚어봐요.',
      title: '다시 해볼까요?',
      tone: 'retry',
    });
  });

  it('shows a next-step overlay after a correct non-final selection', () => {
    expect(
      getQuestResultOverlay({
        continueAction: 'next-step',
        feedbackMessage: '정답이에요! 좋아, 하나씩 잘 세었어!',
        isStepComplete: true,
        selectedChoiceId: 'three',
      }),
    ).toEqual({
      actionLabel: '다음 문제로 이동하기',
      message: '정답이에요! 좋아, 하나씩 잘 세었어!',
      title: '정답이에요!',
      tone: 'correct',
    });
  });

  it('shows a reward overlay after a correct final selection', () => {
    expect(
      getQuestResultOverlay({
        continueAction: 'reward',
        feedbackMessage: '정답이에요! 좋아, 하나씩 잘 세었어!',
        isStepComplete: true,
        selectedChoiceId: 'three',
      }),
    ).toEqual({
      actionLabel: '보상 받기',
      message: '정답이에요! 좋아, 하나씩 잘 세었어!',
      title: '정답이에요!',
      tone: 'correct',
    });
  });

  it('does not show a result overlay before any choice is selected', () => {
    expect(
      getQuestResultOverlay({
        continueAction: 'blocked',
        feedbackMessage: '미어루가 땅굴에서 빼꼼 나와 기다려요.',
        isStepComplete: false,
        selectedChoiceId: null,
      }),
    ).toBeNull();
  });
});
