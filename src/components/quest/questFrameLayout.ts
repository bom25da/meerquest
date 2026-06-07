import type { QuestStageSourceRect } from '@/src/content/questStageLayout';

export const questFrameSafeAreaEdges = [] as const;

export const questTopButtonRects = {
  back: { height: 82, left: 22, top: 22, width: 82 },
  sound: { height: 74, left: 1276, top: 26, width: 74 },
} satisfies Record<string, QuestStageSourceRect>;

export const questTopTitleRect = {
  height: 66,
  left: 437.5,
  top: 30,
  width: 490,
} satisfies QuestStageSourceRect;

export const questTopHudRects = {
  score: { height: 60, left: 1130, top: 33, width: 123 },
} satisfies Record<string, QuestStageSourceRect>;

export const questBottomButtonRects = {
  home: { height: 96, left: 28, top: 650, width: 96 },
  previous: { height: 96, left: 146, top: 650, width: 96 },
  next: { height: 96, left: 264, top: 650, width: 96 },
  reward: { height: 96, left: 1232, top: 650, width: 96 },
} satisfies Record<string, QuestStageSourceRect>;
