import { describe, expect, it } from 'vitest';

import {
  questBottomButtonRects,
  questFrameSafeAreaEdges,
  questTopButtonRects,
  questTopHudRects,
  questTopTitleRect,
} from './questFrameLayout';
import { questStageSourceSize } from '@/src/content/questStageLayout';

function expectInsideStage(rect: { height: number; left: number; top: number; width: number }) {
  expect(rect.left).toBeGreaterThanOrEqual(0);
  expect(rect.top).toBeGreaterThanOrEqual(0);
  expect(rect.left + rect.width).toBeLessThanOrEqual(questStageSourceSize.width);
  expect(rect.top + rect.height).toBeLessThanOrEqual(questStageSourceSize.height);
}

function verticalCenter(rect: { height: number; top: number }) {
  return rect.top + rect.height / 2;
}

describe('quest frame layout', () => {
  it('does not inset the stage away from the screen edges', () => {
    expect(questFrameSafeAreaEdges).toEqual([]);
  });

  it('places reusable top controls inside the shared quest stage', () => {
    Object.values(questTopButtonRects).forEach(expectInsideStage);
    Object.values(questTopHudRects).forEach(expectInsideStage);
    expectInsideStage(questTopTitleRect);
  });

  it('replaces the top progress dots with a centered quest title area', () => {
    expect('progress' in questTopHudRects).toBe(false);
    expect(questTopTitleRect.left + questTopTitleRect.width / 2).toBe(questStageSourceSize.width / 2);
    expect(questTopTitleRect.top).toBeLessThan(questBottomButtonRects.home.top);
    expect(questTopTitleRect.width).toBe(490);
    expect(questTopTitleRect.height).toBe(66);
  });

  it('aligns top quest controls on the same vertical center line', () => {
    const topControlCenter = verticalCenter(questTopButtonRects.back);

    expect(verticalCenter(questTopTitleRect)).toBe(topControlCenter);
    expect(verticalCenter(questTopHudRects.score)).toBe(topControlCenter);
    expect(verticalCenter(questTopButtonRects.sound)).toBe(topControlCenter);
  });

  it('uses consistent square touch targets for bottom quest controls', () => {
    Object.values(questBottomButtonRects).forEach((rect) => {
      expectInsideStage(rect);
      expect(rect.height).toBe(96);
      expect(rect.width).toBe(96);
    });
  });

  it('keeps bottom navigation controls evenly grouped near the lower left and reward at lower right', () => {
    expect(questBottomButtonRects.previous.left - questBottomButtonRects.home.left).toBe(118);
    expect(questBottomButtonRects.next.left - questBottomButtonRects.previous.left).toBe(118);
    expect(questBottomButtonRects.reward.left + questBottomButtonRects.reward.width).toBe(1328);
    expect(questBottomButtonRects.home.top).toBe(650);
    expect(questBottomButtonRects.reward.top).toBe(650);
  });

  it('does not define extra bottom dock backgrounds behind quest controls', async () => {
    const layoutModule = await import('./questFrameLayout');

    expect('questBottomDockRects' in layoutModule).toBe(false);
  });
});
