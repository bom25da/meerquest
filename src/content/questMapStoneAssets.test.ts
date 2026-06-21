import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { questMapStoneAssetFiles } from './questMapStoneAssetFiles';

describe('quest map stone assets', () => {
  it('uses one reusable blank gray stone image for every quest map level', () => {
    const source = readFileSync(resolve(__dirname, './questMapStoneAssets.ts'), 'utf8');

    expect(source).toContain('questMapBlankStoneSource');
    expect(source).toContain('quest-map-gray-stone-blank-v1.png');
    expect(source).not.toContain('gray-numbered');
    expect(source).not.toContain('quest-map-gray-stone-001.png');
    expect(source).not.toContain('questMapStoneSources');

    expect(questMapStoneAssetFiles.blank).toContain('quest-map-gray-stone-blank-v1.png');
    expect('numbered' in questMapStoneAssetFiles).toBe(false);
    expect(existsInWorkspace(questMapStoneAssetFiles.blank)).toBe(true);
  });

  it('renders quest map steps as a blank stone image with an engraved live text number', () => {
    const source = readFileSync(resolve(__dirname, '../../app/quest-map.tsx'), 'utf8');

    expect(source).toContain('const visibleStepCount = 20');
    expect(source).toContain('questMapBlankStoneSource');
    expect(source).toContain('stepStoneImage');
    expect(source).toContain('stoneNumber');
    expect(source).toContain('stoneNumberInsetShadow');
    expect(source).toContain('stoneNumberHighlight');
    expect(source).toContain('getStoneNumberTextStyle');
    expect(source).not.toContain('getQuestMapStoneSource');
    expect(source).not.toContain('bottomCtaDock');
    expect(source).not.toContain('startButton');
    expect(source).not.toContain('stepButtonText');
    expect(source).not.toContain('stepConnector');
    expect(source).not.toContain('opacity: 0.68');
  });

  it('distinguishes playable stones from locked stones with visual state layers', () => {
    const source = readFileSync(resolve(__dirname, '../../app/quest-map.tsx'), 'utf8');

    expect(source).toContain('const isPressable = !isDisabled');
    expect(source).toContain('stoneActionGlow');
    expect(source).toContain('stoneActionGlowFocused');
    expect(source).toContain('stepStoneImageLocked');
    expect(source).toContain('stoneNumberLocked');
    expect(source).toContain('hitSlop={{ bottom: 10, left: 12, right: 12, top: 10 }}');
    expect(source).not.toContain('stoneActionHalo');
    expect(source).not.toContain('borderWidth: 4');
  });

  it('marks completed playable stones differently from the current unsolved stone', () => {
    const source = readFileSync(resolve(__dirname, '../../app/quest-map.tsx'), 'utf8');

    expect(source).toContain('stoneActionGlowCurrent');
    expect(source).toContain('stoneActionGlowCompleted');
    expect(source).toContain('stoneCompletedStamp');
    expect(source).toContain('stoneCompletedStampText');
    expect(source).toContain('stoneNumberCompleted');
    expect(source).toContain('isCompleted ?');
  });

  it('places Meero beside the current unsolved stone only', () => {
    const source = readFileSync(resolve(__dirname, '../../app/quest-map.tsx'), 'utf8');

    expect(source).toContain('isCurrent ?');
    expect(source).toContain('currentStepMeero');
    expect(source).toContain('source={meeroCharacter}');
    expect(source).toContain('accessible={false}');
  });

  it('keeps the current step Meero large enough to read as a guide character', () => {
    const source = readFileSync(resolve(__dirname, '../../app/quest-map.tsx'), 'utf8');
    const imageBlock = source.match(/currentStepMeeroImage: \{([\s\S]*?)\n  \},/)?.[1] ?? '';

    expect(Number(imageBlock.match(/\n    height: (\d+),/)?.[1])).toBeGreaterThanOrEqual(188);
    expect(Number(imageBlock.match(/\n    width: (\d+),/)?.[1])).toBeGreaterThanOrEqual(132);
  });

  it('shows a live speech bubble from Meero with the current quest title', () => {
    const source = readFileSync(resolve(__dirname, '../../app/quest-map.tsx'), 'utf8');
    const labelBlock = source.match(/currentStepSpeechLabel: \{([\s\S]*?)\n  \},/)?.[1] ?? '';
    const titleBlock = source.match(/currentStepSpeechTitle: \{([\s\S]*?)\n  \},/)?.[1] ?? '';

    expect(source).toContain('currentStepSpeechBubble');
    expect(source).toContain('currentStepSpeechLabel');
    expect(source).toContain('currentStepSpeechTitle');
    expect(source).toContain('currentStepSpeechTail');
    expect(source).toContain('{levelText}단계 문제');
    expect(source).toContain('{step.quest.title}');
    expect(Number(labelBlock.match(/fontSize: (\d+)/)?.[1])).toBeGreaterThanOrEqual(20);
    expect(Number(titleBlock.match(/fontSize: (\d+)/)?.[1])).toBeGreaterThanOrEqual(26);
  });

  it('adds a visible background button to start the current quest', () => {
    const source = readFileSync(resolve(__dirname, '../../app/quest-map.tsx'), 'utf8');

    expect(source).toContain('currentStepGuidePanel');
    expect(source).toContain('currentStepPlayButton');
    expect(source).toContain('currentStepPlayButtonText');
    expect(source).toContain('문제 풀기');
    expect(source).toContain('accessibilityLabel={`${levelText}단계 문제 풀기`}');
    expect(source).toContain('onPress={() => onOpenQuest(step.quest)}');
    expect(source).toContain('pointerEvents="box-none"');
  });

  it('keeps the current step and Meero above nearby stones', () => {
    const source = readFileSync(resolve(__dirname, '../../app/quest-map.tsx'), 'utf8');
    const currentButtonBlock = source.match(/stepButtonCurrent: \{([\s\S]*?)\n  \},/)?.[1] ?? '';

    expect(source).toContain('isCurrent && styles.stepButtonCurrent');
    expect(Number(currentButtonBlock.match(/zIndex: (\d+)/)?.[1])).toBeGreaterThanOrEqual(20);
    expect(Number(currentButtonBlock.match(/elevation: (\d+)/)?.[1])).toBeGreaterThanOrEqual(20);
  });

  it('shows completed progress against the actual category step count', () => {
    const source = readFileSync(resolve(__dirname, '../../app/quest-map.tsx'), 'utf8');

    expect(source).toContain('{summary.completedCount} / {summary.totalCount}');
    expect(source).not.toContain('{summary.completedCount} / ∞');
  });

  it('keeps stones large enough for children to recognize and tap', () => {
    const source = readFileSync(resolve(__dirname, '../../app/quest-map.tsx'), 'utf8');
    const stepButtonBlock = source.match(/stepButton: \{([\s\S]*?)\n  \},/)?.[1] ?? '';
    const focusedBlock = source.match(/stepButtonFocused: \{([\s\S]*?)\n  \},/)?.[1] ?? '';

    expect(Number(stepButtonBlock.match(/height: (\d+)/)?.[1])).toBeGreaterThanOrEqual(80);
    expect(Number(stepButtonBlock.match(/width: (\d+)/)?.[1])).toBeGreaterThanOrEqual(116);
    expect(Number(focusedBlock.match(/height: (\d+)/)?.[1])).toBeGreaterThanOrEqual(90);
    expect(Number(focusedBlock.match(/width: (\d+)/)?.[1])).toBeGreaterThanOrEqual(130);
  });

  it('places the twenty visible stones on a single readable trail', () => {
    const source = readFileSync(resolve(__dirname, '../../app/quest-map.tsx'), 'utf8');
    const layouts = [
      ...source.matchAll(/\{ left: ([\d.]+), rotation: '[^']+', top: ([\d.]+) \}/g),
    ].map((match) => ({
      left: Number(match[1]),
      top: Number(match[2]),
    }));

    expect(layouts).toHaveLength(20);
    expect(layouts[0].top).toBeGreaterThan(layouts[layouts.length - 1].top);

    for (let index = 1; index < layouts.length; index += 1) {
      expect(layouts[index - 1].top).toBeGreaterThan(layouts[index].top);
    }

    const leftValues = layouts.map((layout) => layout.left);
    expect(Math.max(...leftValues) - Math.min(...leftValues)).toBeLessThanOrEqual(0.3);
    expect(layouts[0].left).toBeGreaterThanOrEqual(0.5);
    expect(layouts[0].left).toBeLessThanOrEqual(0.58);
  });

  it('spaces the visible stone trail far enough apart to scroll through comfortably', () => {
    const source = readFileSync(resolve(__dirname, '../../app/quest-map.tsx'), 'utf8');
    const layouts = [
      ...source.matchAll(/\{ left: ([\d.]+), rotation: '[^']+', top: ([\d.]+) \}/g),
    ].map((match) => ({
      left: Number(match[1]),
      top: Number(match[2]),
    }));
    const regularHeightMatch = source.match(/const questMapRegularHeight = (\d+);/);
    const compactHeightMatch = source.match(/const questMapCompactHeight = (\d+);/);
    const verticalGaps = layouts
      .slice(1)
      .map((layout, index) => layouts[index].top - layout.top);

    expect(Number(regularHeightMatch?.[1])).toBeGreaterThanOrEqual(2200);
    expect(Number(compactHeightMatch?.[1])).toBeGreaterThanOrEqual(1760);
    expect(Math.min(...verticalGaps)).toBeGreaterThanOrEqual(0.038);
    expect(new Set(verticalGaps.map((gap) => gap.toFixed(3))).size).toBeGreaterThanOrEqual(6);
    expect(source).toContain('getFocusedStepScrollOffset');
    expect(source).toContain('scrollViewRef.current?.scrollTo');
  });
});

function existsInWorkspace(relativePath: string) {
  return existsSync(resolve(__dirname, '../../', relativePath));
}
