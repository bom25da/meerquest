import { describe, expect, it } from 'vitest';

import { getAppleCountFillLayout, getAppleCountHitRect } from './appleCountQuest';

describe('apple count quest layout', () => {
  it('fills the matching 16:9 viewport without scaling distortion', () => {
    expect(getAppleCountFillLayout({ height: 768, width: 1365 })).toEqual({
      scaleX: 1,
      scaleY: 1,
      stageHeight: 768,
      stageWidth: 1365,
    });
  });

  it('fills a 4:3 tablet viewport without cropping the source sides', () => {
    const layout = getAppleCountFillLayout({ height: 768, width: 1024 });

    expect(layout.stageWidth).toBe(1024);
    expect(layout.stageHeight).toBe(768);
    expect(layout.scaleX).toBeCloseTo(1024 / 1365);
    expect(layout.scaleY).toBe(1);
  });

  it('maps source touch rectangles with independent width and height scaling', () => {
    const layout = getAppleCountFillLayout({ height: 768, width: 1024 });
    const rect = getAppleCountHitRect(layout, { height: 125, left: 470, top: 488, width: 367 });

    expect(rect.top).toBe(488);
    expect(rect.height).toBe(125);
    expect(rect.left).toBeCloseTo(470 * (1024 / 1365));
    expect(rect.width).toBeCloseTo(367 * (1024 / 1365));
  });
});
