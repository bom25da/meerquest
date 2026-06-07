export const questStageSourceSize = {
  height: 768,
  width: 1365,
} as const;

export interface QuestStageViewport {
  height: number;
  width: number;
}

export interface QuestStageFillLayout {
  scaleX: number;
  scaleY: number;
  stageHeight: number;
  stageWidth: number;
}

export interface QuestStageSourceRect {
  height: number;
  left: number;
  top: number;
  width: number;
}

export function getQuestStageFillLayout({
  height,
  width,
}: QuestStageViewport): QuestStageFillLayout {
  return {
    scaleX: width / questStageSourceSize.width,
    scaleY: height / questStageSourceSize.height,
    stageHeight: height,
    stageWidth: width,
  };
}

export function getQuestStageRect(layout: QuestStageFillLayout, rect: QuestStageSourceRect) {
  return {
    height: rect.height * layout.scaleY,
    left: rect.left * layout.scaleX,
    top: rect.top * layout.scaleY,
    width: rect.width * layout.scaleX,
  };
}
