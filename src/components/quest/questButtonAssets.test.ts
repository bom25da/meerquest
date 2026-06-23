import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { questButtonAssetFiles } from './questButtonAssetFiles';

interface DecodedPng {
  data: Buffer;
  height: number;
  width: number;
}

const require = createRequire(import.meta.url);
const { PNG } = require('pngjs') as {
  PNG: { sync: { read: (buffer: Buffer) => DecodedPng } };
};

function readPng(path: string): DecodedPng {
  return PNG.sync.read(readFileSync(resolve(process.cwd(), path)));
}

describe('quest button assets', () => {
  it('keeps the back button in the shared quest buttons asset folder', () => {
    expect(questButtonAssetFiles.back).toBe('assets/images/quests/buttons/quest-button-back.png');
    expect(existsSync(resolve(process.cwd(), questButtonAssetFiles.back))).toBe(true);
  });

  it('renders the shared back button instead of the apple-count specific back asset', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/components/quest/QuestScreenFrame.tsx'), 'utf8');

    expect(source).toContain("assets/images/quests/buttons/quest-button-back.png");
    expect(source).not.toContain("assets/images/quests/apple-count/ui-back.png");
  });

  it('renders a title plaque instead of the star progress dot HUD', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/components/quest/QuestScreenFrame.tsx'), 'utf8');

    expect(existsSync(resolve(process.cwd(), 'assets/images/quests/ui/quest-title-plaque.png'))).toBe(
      true,
    );
    expect(source).toContain("assets/images/quests/ui/quest-title-plaque.png");
    expect(source).toContain('questTitle');
    expect(source).not.toContain('adjustsFontSizeToFit');
    expect(source).not.toContain("assets/images/quests/apple-count/ui-progress.png");
  });

  it('renders the quest score count as live text instead of a baked-in score image', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/components/quest/QuestScreenFrame.tsx'), 'utf8');

    expect(source).toContain('function QuestScoreHud');
    expect(source).toContain('styles.scoreValue');
    expect(source).toContain('{stars}');
    expect(source).not.toContain("assets/images/quests/apple-count/ui-score.png");
  });

  it('can visually highlight available next and reward navigation buttons', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/components/quest/QuestScreenFrame.tsx'), 'utf8');

    expect(source).toContain('highlighted={isNextAvailable && !isRewardAvailable}');
    expect(source).toContain('highlighted={isRewardAvailable}');
    expect(source).toContain('styles.assetButtonHighlighted');
  });

  it('keeps the home button perimeter free of light background remnants', () => {
    const homeButton = readPng(questButtonAssetFiles.home);
    const perimeter = 16;

    const backgroundRemnantPixels = [];

    for (let y = 0; y < homeButton.height; y += 1) {
      for (let x = 0; x < homeButton.width; x += 1) {
        const isPerimeter =
          x < perimeter ||
          y < perimeter ||
          x >= homeButton.width - perimeter ||
          y >= homeButton.height - perimeter;

        if (!isPerimeter) {
          continue;
        }

        const channel = (homeButton.width * y + x) * 4;
        const red = homeButton.data[channel];
        const green = homeButton.data[channel + 1];
        const blue = homeButton.data[channel + 2];
        const alpha = homeButton.data[channel + 3];
        const maxChannel = Math.max(red, green, blue);
        const minChannel = Math.min(red, green, blue);
        const brightness = (red + green + blue) / 3;
        const isWhiteMatte = red > 235 && green > 235 && blue > 235;
        const isLowAlphaGrayMatte =
          alpha <= 64 && brightness >= 190 && maxChannel - minChannel <= 15;

        if (alpha > 0 && (isWhiteMatte || isLowAlphaGrayMatte)) {
          backgroundRemnantPixels.push({ alpha, blue, green, red, x, y });
        }
      }
    }

    expect({
      count: backgroundRemnantPixels.length,
      examples: backgroundRemnantPixels.slice(0, 10),
    }).toEqual({
      count: 0,
      examples: [],
    });
  });

  it('removes the bright matte under the home button', () => {
    const homeButton = readPng(questButtonAssetFiles.home);
    const mattePixels = [];

    for (let y = homeButton.height - 32; y < homeButton.height; y += 1) {
      for (let x = 0; x < homeButton.width; x += 1) {
        const channel = (homeButton.width * y + x) * 4;
        const red = homeButton.data[channel];
        const green = homeButton.data[channel + 1];
        const blue = homeButton.data[channel + 2];
        const alpha = homeButton.data[channel + 3];
        const maxChannel = Math.max(red, green, blue);
        const minChannel = Math.min(red, green, blue);
        const brightness = (red + green + blue) / 3;

        if (alpha > 0 && brightness >= 170 && maxChannel - minChannel <= 45) {
          mattePixels.push({ alpha, blue, green, red, x, y });
        }
      }
    }

    expect({
      count: mattePixels.length,
      examples: mattePixels.slice(0, 10),
    }).toEqual({
      count: 0,
      examples: [],
    });
  });
});
