import type { MascotMood } from '@/src/components/MeerkatMascot';

interface ChoiceFeedbackInput {
  answeredCorrectly: boolean;
  attempts: number;
  hintText: string;
  successMessage: string;
}

interface ChoiceFeedback {
  feedbackMessage: string;
  isCompleted: boolean;
  mascotMood: MascotMood;
}

interface IncorrectChoiceInput {
  answeredCorrectly: boolean;
  choiceId: string;
  incorrectChoiceIds: string[];
}

interface QuestContinueInput {
  currentStepIndex: number;
  isStepComplete: boolean;
  totalSteps: number;
}

interface QuestFeedbackMessageInput {
  continueAction: QuestContinueAction;
  feedbackMessage: string;
}

interface QuestResultOverlayInput {
  continueAction: QuestContinueAction;
  feedbackMessage: string;
  isStepComplete: boolean;
  selectedChoiceId: string | null;
}

export type QuestContinueAction = 'blocked' | 'next-step' | 'reward';
export type QuestResultOverlayTone = 'correct' | 'retry';

export interface QuestResultOverlay {
  actionLabel: string;
  message: string;
  title: string;
  tone: QuestResultOverlayTone;
}

export function getChoiceFeedback({
  answeredCorrectly,
  attempts,
  hintText,
  successMessage,
}: ChoiceFeedbackInput): ChoiceFeedback {
  if (answeredCorrectly) {
    return {
      feedbackMessage: `정답이에요! ${successMessage}`,
      isCompleted: true,
      mascotMood: 'clap',
    };
  }

  return {
    feedbackMessage:
      attempts >= 2 ? `우리 같이 생각해보자. ${hintText}` : `괜찮아, 다시 해보자. ${hintText}`,
    isCompleted: false,
    mascotMood: attempts >= 2 ? 'thinking' : 'hint',
  };
}

export function getNextIncorrectChoiceIds({
  answeredCorrectly,
  choiceId,
  incorrectChoiceIds,
}: IncorrectChoiceInput) {
  if (answeredCorrectly || incorrectChoiceIds.includes(choiceId)) {
    return incorrectChoiceIds;
  }

  return [...incorrectChoiceIds, choiceId];
}

export function isQuestRewardAvailable(isCompleted: boolean) {
  return isCompleted;
}

export function getQuestContinueAction({
  currentStepIndex,
  isStepComplete,
  totalSteps,
}: QuestContinueInput): QuestContinueAction {
  if (!isStepComplete) {
    return 'blocked';
  }

  return currentStepIndex >= totalSteps - 1 ? 'reward' : 'next-step';
}

export function getQuestFeedbackMessage({
  continueAction,
  feedbackMessage,
}: QuestFeedbackMessageInput) {
  if (continueAction === 'next-step') {
    return `${feedbackMessage} 아래의 오른쪽 화살표를 눌러 다음 문제로 가요.`;
  }

  if (continueAction === 'reward') {
    return `${feedbackMessage} 오른쪽 아래 별을 눌러 보상을 받아요.`;
  }

  return feedbackMessage;
}

export function getQuestResultOverlay({
  continueAction,
  feedbackMessage,
  isStepComplete,
  selectedChoiceId,
}: QuestResultOverlayInput): QuestResultOverlay | null {
  if (!selectedChoiceId) {
    return null;
  }

  if (!isStepComplete) {
    return {
      actionLabel: '다시 시도하기',
      message: feedbackMessage,
      title: '다시 해볼까요?',
      tone: 'retry',
    };
  }

  return {
    actionLabel: continueAction === 'reward' ? '보상 받기' : '다음 문제로 이동하기',
    message: feedbackMessage,
    title: '정답이에요!',
    tone: 'correct',
  };
}
