import type { Quest, QuestProgress } from '@/src/features/quests/questProgress';

export const quests: Quest[] = [
  { id: 'math-1', categoryId: 'math', title: '사과를 세어보자', level: 1, order: 1 },
  { id: 'math-2', categoryId: 'math', title: '동그라미를 찾아요', level: 2, order: 2 },
  { id: 'math-3', categoryId: 'math', title: '패턴 길을 이어요', level: 3, order: 3 },
  { id: 'language-1', categoryId: 'language', title: '어떤 소리가 났을까', level: 1, order: 1 },
  { id: 'language-2', categoryId: 'language', title: '그림 단어를 골라요', level: 2, order: 2 },
  { id: 'social-1', categoryId: 'social', title: '친구가 빌리고 싶대', level: 1, order: 1 },
  { id: 'social-2', categoryId: 'social', title: '고마워를 말해요', level: 2, order: 2 },
  { id: 'safety-1', categoryId: 'safety', title: '횡단보도에서 멈춰요', level: 1, order: 1 },
  { id: 'safety-2', categoryId: 'safety', title: '뜨거운 물건을 피해요', level: 2, order: 2 },
];

export const sampleProgress: QuestProgress[] = [
  { questId: 'math-1', status: 'completed', attempts: 1 },
  { questId: 'language-1', status: 'inProgress', attempts: 3 },
  { questId: 'social-1', status: 'notStarted', attempts: 0 },
  { questId: 'safety-1', status: 'notStarted', attempts: 0 },
];
