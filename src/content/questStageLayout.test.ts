import { describe, expect, it } from 'vitest';

import {
  getQuestStageFillLayout,
  getQuestStageRect,
  questStageSourceSize,
} from './questStageLayout';

describe('quest stage layout', () => {
  it('uses the authored quest screen size as the shared coordinate system', () => {
    expect(questStageSourceSize).toEqual({
      height: 768,
      width: 1365,
    });
  });

  it('fills an iPad viewport without cropping shared overlay positions', () => {
    const layout = getQuestStageFillLayout({ height: 768, width: 1024 });

    expect(layout).toEqual({
      scaleX: 1024 / 1365,
      scaleY: 1,
      stageHeight: 768,
      stageWidth: 1024,
    });
  });

  it('maps shared HUD rectangles with independent x and y scales', () => {
    const layout = getQuestStageFillLayout({ height: 768, width: 1024 });
    const topProgress = getQuestStageRect(layout, { height: 60, left: 565, top: 20, width: 270 });
    const nextButton = getQuestStageRect(layout, { height: 88, left: 250, top: 662, width: 87 });

    expect(topProgress.left).toBeCloseTo(565 * (1024 / 1365));
    expect(topProgress.width).toBeCloseTo(270 * (1024 / 1365));
    expect(topProgress.top).toBe(20);
    expect(topProgress.height).toBe(60);
    expect(nextButton.left).toBeCloseTo(250 * (1024 / 1365));
    expect(nextButton.width).toBeCloseTo(87 * (1024 / 1365));
  });
});
