import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

interface DecodedPng {
  data: Buffer;
  height: number;
  width: number;
}

const require = createRequire(import.meta.url);
const { PNG } = require('pngjs') as {
  PNG: { sync: { read: (buffer: Buffer) => DecodedPng } };
};

const animationComponentPath = resolve(
  process.cwd(),
  'src/components/quest/MeeroDigPeekAnimation.tsx',
);

describe('Meero dig-peek animation', () => {
  it('defines a smoother looping animation from expanded dig-peek frame assets', () => {
    const source = existsSync(animationComponentPath)
      ? readFileSync(animationComponentPath, 'utf8')
      : '';
    const digPeekFrames = getAnimationFrameAssets(source, 'meero-dig-peek-smooth');

    expect(existsSync(animationComponentPath)).toBe(true);
    expect(source).toContain('setInterval');
    expect(getDefaultFrameMs(source)).toBeLessThanOrEqual(90);
    expect(digPeekFrames).toHaveLength(12);
    digPeekFrames.forEach((assetPath) => {
      expect(existsSync(resolve(process.cwd(), assetPath))).toBe(true);
    });
  });

  it('keeps dig-peek frames registered to a stable burrow position', () => {
    const digPeekFrameBounds = Array.from({ length: 12 }, (_, index) => index + 1).map(
      (frameNumber) =>
        getOpaqueBounds(
          resolve(
            process.cwd(),
            `assets/images/characters/animations/meero-dig-peek-smooth/meero-dig-peek-smooth-${String(frameNumber).padStart(2, '0')}.png`,
          ),
        ),
    );
    const centerXs = digPeekFrameBounds.map((bounds) => bounds.centerX);
    const bottoms = digPeekFrameBounds.map((bounds) => bounds.bottom);

    expect(Math.max(...centerXs) - Math.min(...centerXs)).toBeLessThanOrEqual(2);
    expect(Math.max(...bottoms) - Math.min(...bottoms)).toBeLessThanOrEqual(2);
  });

  it('keeps the dig-peek dirt base outer edges stable across frames', () => {
    const originalBaseBounds = Array.from({ length: 5 }, (_, index) => index + 1).map(
      (frameNumber) =>
        getBaseBounds(
          resolve(
            process.cwd(),
            `assets/images/characters/animations/meero-dig-peek/meero-dig-peek-0${frameNumber}.png`,
          ),
        ),
    );
    const smoothBaseBounds = Array.from({ length: 12 }, (_, index) => index + 1).map(
      (frameNumber) =>
        getBaseBounds(
          resolve(
            process.cwd(),
            `assets/images/characters/animations/meero-dig-peek-smooth/meero-dig-peek-smooth-${String(frameNumber).padStart(2, '0')}.png`,
          ),
        ),
    );

    expect(getSpread(originalBaseBounds.map((bounds) => bounds.left))).toBeLessThanOrEqual(2);
    expect(getSpread(originalBaseBounds.map((bounds) => bounds.right))).toBeLessThanOrEqual(2);
    expect(getSpread(smoothBaseBounds.map((bounds) => bounds.left))).toBeLessThanOrEqual(2);
    expect(getSpread(smoothBaseBounds.map((bounds) => bounds.right))).toBeLessThanOrEqual(2);
  });

  it('keeps dig-peek smooth frames free of detached pixels below the dirt base', () => {
    const bottomBands = Array.from({ length: 12 }, (_, index) => index + 1).map((frameNumber) =>
      getBottomOpaqueBandHeight(
        resolve(
          process.cwd(),
          `assets/images/characters/animations/meero-dig-peek-smooth/meero-dig-peek-smooth-${String(frameNumber).padStart(2, '0')}.png`,
        ),
      ),
    );

    expect(Math.min(...bottomBands)).toBeGreaterThanOrEqual(16);
  });

  it('keeps dig-peek smooth frames free of mascot fur spillover below the dirt base', () => {
    const spilloverPixelCounts = Array.from({ length: 12 }, (_, index) => index + 1).map(
      (frameNumber) =>
        getBottomMascotFurPixelCount(
          resolve(
            process.cwd(),
            `assets/images/characters/animations/meero-dig-peek-smooth/meero-dig-peek-smooth-${String(frameNumber).padStart(2, '0')}.png`,
          ),
        ),
    );

    expect(Math.max(...spilloverPixelCounts)).toBeLessThanOrEqual(80);
  });

  it('keeps dig-peek smooth frames free of exposed lower dirt shelves', () => {
    const exposedShelfRuns = Array.from({ length: 12 }, (_, index) => index + 1).map(
      (frameNumber) =>
        getMaxLowerShelfExposureRun(
          resolve(
            process.cwd(),
            `assets/images/characters/animations/meero-dig-peek-smooth/meero-dig-peek-smooth-${String(frameNumber).padStart(2, '0')}.png`,
          ),
        ),
    );

    expect(Math.max(...exposedShelfRuns)).toBeLessThanOrEqual(8);
  });

  it('defines a smoother generated retry-thinking frame animation asset', () => {
    const retryAnimationPath = resolve(
      process.cwd(),
      'src/components/quest/MeeroThinkAgainAnimation.tsx',
    );
    const source = existsSync(retryAnimationPath) ? readFileSync(retryAnimationPath, 'utf8') : '';
    const retryFrames = getAnimationFrameAssets(source, 'meero-think-again-smooth');

    expect(existsSync(retryAnimationPath)).toBe(true);
    expect(getDefaultFrameMs(source)).toBeLessThanOrEqual(100);
    expect(retryFrames).toHaveLength(12);
    retryFrames.forEach((assetPath) => {
      expect(existsSync(resolve(process.cwd(), assetPath))).toBe(true);
    });
    expect(source).toContain('setInterval');
    expect(source).toContain('meeroThinkAgainFrames');
    expect(source).not.toContain('thinkingFrameStyles');
    expect(source).toContain('다시 생각해보는 미어루');
  });

  it('keeps retry-thinking frames registered to a stable character position', () => {
    const retryFrameBounds = Array.from({ length: 12 }, (_, index) => index + 1).map(
      (frameNumber) =>
        getOpaqueBounds(
          resolve(
            process.cwd(),
            `assets/images/characters/animations/meero-think-again-smooth/meero-think-again-smooth-${String(frameNumber).padStart(2, '0')}.png`,
          ),
        ),
    );
    const centerXs = retryFrameBounds.map((bounds) => bounds.centerX);
    const bottoms = retryFrameBounds.map((bounds) => bounds.bottom);

    expect(Math.max(...centerXs) - Math.min(...centerXs)).toBeLessThanOrEqual(2);
    expect(Math.max(...bottoms) - Math.min(...bottoms)).toBeLessThanOrEqual(2);
  });

  it('keeps retry-thinking dirt base outer edges stable across frames', () => {
    const retryBaseBounds = Array.from({ length: 12 }, (_, index) => index + 1).map(
      (frameNumber) =>
        getBaseBounds(
          resolve(
            process.cwd(),
            `assets/images/characters/animations/meero-think-again-smooth/meero-think-again-smooth-${String(frameNumber).padStart(2, '0')}.png`,
          ),
        ),
    );

    expect(getSpread(retryBaseBounds.map((bounds) => bounds.left))).toBeLessThanOrEqual(2);
    expect(getSpread(retryBaseBounds.map((bounds) => bounds.right))).toBeLessThanOrEqual(2);
  });

  it('keeps retry-thinking ground pixels identical across frames', () => {
    const referenceGroundPath = resolve(
      process.cwd(),
      'assets/images/characters/animations/meero-think-again-smooth/meero-think-again-smooth-01.png',
    );
    const groundMismatchCounts = Array.from({ length: 11 }, (_, index) => index + 2).map(
      (frameNumber) =>
        getMaskedPixelMismatchCount(
          referenceGroundPath,
          resolve(
            process.cwd(),
            `assets/images/characters/animations/meero-think-again-smooth/meero-think-again-smooth-${String(frameNumber).padStart(2, '0')}.png`,
          ),
          isThinkAgainGroundPixel,
        ),
    );

    expect(Math.max(...groundMismatchCounts)).toBe(0);
  });

  it('keeps retry-thinking frame 08 from painting ground over the raised arm gap', () => {
    const armGapOpaquePixels = getOpaquePixelCountInRect(
      resolve(
        process.cwd(),
        'assets/images/characters/animations/meero-think-again-smooth/meero-think-again-smooth-08.png',
      ),
      { height: 13, left: 232, top: 216, width: 15 },
    );

    expect(armGapOpaquePixels).toBe(0);
  });

  it('keeps the apple count screen free of the temporary mascot and question panels', () => {
    const source = readFileSync(resolve(process.cwd(), 'app/quest-play.tsx'), 'utf8');

    expect(source).not.toContain('appleQuestionPanel');
    expect(source).not.toContain('사과를 세어보자');
    expect(source).not.toContain('appleChoiceHitArea');
    expect(source).not.toContain('appleScene');
    expect(source).not.toContain("assets/images/quests/apple-count/meerkat-standing.png");
    expect(source).not.toContain("assets/images/quests/apple-count/burrow.png");
  });

  it('does not render a solid mascot panel behind the dig-peek animation', () => {
    const source = readFileSync(resolve(process.cwd(), 'app/quest-play.tsx'), 'utf8');

    expect(source).not.toContain('appleMascotPanel');
    expect(source).not.toContain('mascotPanelRect');
  });

  it('renders a translucent rounded content backdrop between the top and bottom controls', () => {
    const source = readFileSync(resolve(process.cwd(), 'app/quest-play.tsx'), 'utf8');

    expect(source).toContain('questContentBackdropRect');
    expect(source).toContain('questContentBackdrop');
    expect(source).toContain("backgroundColor: 'rgba(255, 255, 255, 0.72)'");
    expect(source).toContain('borderRadius: 32');
    expect(source).toContain('top: 124');
    expect(source).toContain('height: 504');
  });

  it('uses an imagegen apple asset, a short problem prompt, and Korean count labels', () => {
    const source = readFileSync(resolve(process.cwd(), 'app/quest-play.tsx'), 'utf8');
    const appleAssetPath = resolve(
      process.cwd(),
      'assets/images/quests/apple-count/apple-count-meero-apple-tree-v1.png',
    );

    expect(existsSync(appleAssetPath)).toBe(true);
    const appleAsset = readFileSync(appleAssetPath);

    expect(appleAsset[25]).toBe(6);
    expect(source).toContain('appleCountApplesImage');
    expect(source).toContain('apple-count-meero-apple-tree-v1.png');
    expect(source).not.toContain('apple-count-apples-cartoon-soft.png');
    expect(source).toContain('appleCountPromptRect');
    expect(source).toContain('styles.appleCountPromptText');
    expect(source).toContain('{step.instructionText}');
    expect(source).toContain('appleCountChoiceRects');
    expect(source).toContain('appleCountChoiceDots');
    expect(source).toContain('styles.appleCountChoiceCard');
    expect(source).toContain('styles.appleCountChoiceLabelText');
    expect(source).toContain('{choice.label}');
    expect(source).not.toContain('appleFeedbackText');
  });

  it('uses the math cave visual template for the stage 2 shape quest', () => {
    const questSource = readFileSync(resolve(process.cwd(), 'src/content/quests.ts'), 'utf8');
    const screenSource = readFileSync(resolve(process.cwd(), 'app/quest-play.tsx'), 'utf8');
    const progressSource = readFileSync(
      resolve(process.cwd(), 'src/features/quests/questProgress.ts'),
      'utf8',
    );

    expect(progressSource).toContain("'shape-find'");
    expect(questSource).toContain("id: 'math-2'");
    expect(questSource).toContain("visualLayout: 'shape-find'");
    expect(questSource).toContain("backgroundAsset: 'math-cave-background'");
    expect(screenSource).toContain("quest.visualLayout === 'shape-find'");
    expect(screenSource).toContain('ShapeFindQuestScreen');
    expect(screenSource).toContain('shapeFindPromptRect');
    expect(screenSource).toContain('shapeFindChoiceRects');
  });

  it('presents stage 2 as choosing the numbered circle button on Meero door art', () => {
    const questSource = readFileSync(resolve(process.cwd(), 'src/content/quests.ts'), 'utf8');
    const screenSource = readFileSync(resolve(process.cwd(), 'app/quest-play.tsx'), 'utf8');
    const doorAssetPath = resolve(
      process.cwd(),
      'assets/images/quests/shape-find/shape-find-meero-door-v1.png',
    );

    expect(existsSync(doorAssetPath)).toBe(true);
    const doorAsset = readFileSync(doorAssetPath);

    expect(doorAsset[25]).toBe(6);
    expect(questSource).toContain('동그라미 버튼을 찾아요');
    expect(questSource).toContain(
      '미어로가 문을 통과하기 위하여 동그라미 버튼을 눌러야해요. 동그라미 버튼은 무엇인가요?',
    );
    expect(questSource).not.toContain('이 도형');
    expect(questSource).toContain("{ id: 'button-1', label: '1번' }");
    expect(questSource).toContain("{ id: 'button-2', label: '2번' }");
    expect(questSource).toContain("correctChoiceId: 'button-1'");
    expect(screenSource).toContain('shapeFindDoorImage');
    expect(screenSource).toContain('shape-find-meero-door-v1.png');
    expect(screenSource).toContain('미어로가 동그라미와 네모 버튼이 있는 문을 바라보는 장면');
    expect(screenSource).toContain('shapeFindDoorImageRect');
    expect(screenSource).toContain('shapeFindDoorButtonLabelRects');
    expect(screenSource).toContain('styles.shapeFindDoorNumberBadge');
    expect(screenSource).toContain('{getChoiceNumber(choice.label)}');
    expect(screenSource).toContain("'button-1': { height: 136, left: 850, top: 270, width: 252 }");
    expect(screenSource).toContain("'button-2': { height: 136, left: 850, top: 437, width: 252 }");
    expect(screenSource).toContain("'button-1-label': { height: 48, left: 472, top: 372, width: 48 }");
    expect(screenSource).toContain("'button-2-label': { height: 48, left: 564, top: 372, width: 48 }");
    expect(screenSource).toContain('styles.shapeFindChoiceLabelText');
    expect(screenSource).not.toContain('getShapeFindChoiceShape(choice.id, stage.scaleY)');
    expect(screenSource).not.toContain('shapeFindChoiceCircle');
    expect(screenSource).not.toContain('shapeFindChoiceTriangle');
    expect(screenSource).not.toContain('shapeFindChoiceSquare');
    expect(screenSource).not.toContain('shapeFindIllustrationRect');
    expect(screenSource).not.toContain('shapeFindWallPlaque');
    expect(screenSource).not.toContain('shapeFindMainCircle');
    expect(screenSource).not.toContain('shapeFindMainCircleSize');
    expect(screenSource).not.toContain('문제 도형 동그라미');
    expect(screenSource).not.toContain('shapeFindCircleShine');
    expect(screenSource).not.toContain('borderColor: colors.orange');
    expect(screenSource).not.toContain('borderWidth: 10');
    expect(screenSource).not.toContain('shapeFindQuestionBadge');
    expect(screenSource).not.toContain('shapeFindQuestionText');
    expect(screenSource).not.toContain('이 도형');
    expect(screenSource).not.toContain('찾을 모양');
  });

  it('uses an imagegen pattern path template for the stage 3 pattern quest', () => {
    const questSource = readFileSync(resolve(process.cwd(), 'src/content/quests.ts'), 'utf8');
    const screenSource = readFileSync(resolve(process.cwd(), 'app/quest-play.tsx'), 'utf8');
    const progressSource = readFileSync(
      resolve(process.cwd(), 'src/features/quests/questProgress.ts'),
      'utf8',
    );
    const patternAssetPath = resolve(
      process.cwd(),
      'assets/images/quests/pattern-path/pattern-path-meero-crossing-v1.png',
    );

    expect(existsSync(patternAssetPath)).toBe(true);
    const patternAsset = readFileSync(patternAssetPath);

    expect(patternAsset[25]).toBe(6);
    expect(progressSource).toContain("'pattern-path'");
    expect(questSource).toContain("id: 'math-3'");
    expect(questSource).toContain('미어로가 길을 건너고 있어요. 다음 길은 무슨 색 길일까요?');
    expect(questSource).toContain("backgroundAsset: 'math-cave-background'");
    expect(questSource).toContain("visualLayout: 'pattern-path'");
    expect(screenSource).toContain("quest.visualLayout === 'pattern-path'");
    expect(screenSource).toContain('PatternPathQuestScreen');
    expect(screenSource).toContain('patternPathStonesImage');
    expect(screenSource).toContain('pattern-path-meero-crossing-v1.png');
    expect(screenSource).toContain('미어로가 빨강 파랑 빨강 파랑 길을 건너고 다음 칸이 비어 있는 패턴 길');
    expect(screenSource).toContain('patternPathPromptRect');
    expect(screenSource).toContain('patternPathStonesRect');
    expect(screenSource).toContain('patternPathChoiceRects');
    expect(screenSource).toContain('getPatternPathChoiceColors(choice.id)');
    expect(screenSource).toContain('styles.patternPathChoiceCard');
    expect(screenSource).toContain('styles.patternPathChoiceSwatch');
    expect(screenSource).toContain('styles.patternPathChoiceLabelText');

    const panelRect = getSourceRect(screenSource, 'questContentBackdropRect');
    const promptRect = getSourceRect(screenSource, 'patternPathPromptRect');
    const stonesRect = getSourceRect(screenSource, 'patternPathStonesRect');
    const redChoiceRect = getChoiceRect(screenSource, 'red');

    expect(promptRect.width).toBeGreaterThanOrEqual(720);
    expect(stonesRect.top).toBeGreaterThanOrEqual(promptRect.top + promptRect.height + 6);
    expect(stonesRect.top + stonesRect.height).toBeLessThanOrEqual(redChoiceRect.top - 6);
    expect(redChoiceRect.top + redChoiceRect.height).toBeLessThanOrEqual(
      panelRect.top + panelRect.height,
    );
  });

  it('uses a numbered sleep-hole choice template for the stage 4 size quest', () => {
    const questSource = readFileSync(resolve(process.cwd(), 'src/content/quests.ts'), 'utf8');
    const screenSource = readFileSync(resolve(process.cwd(), 'app/quest-play.tsx'), 'utf8');
    const progressSource = readFileSync(
      resolve(process.cwd(), 'src/features/quests/questProgress.ts'),
      'utf8',
    );
    const holesAssetPath = resolve(
      process.cwd(),
      'assets/images/quests/size-compare/size-compare-meero-holes-v2.png',
    );

    expect(existsSync(holesAssetPath)).toBe(true);
    const holesAsset = readFileSync(holesAssetPath);

    expect(holesAsset[25]).toBe(6);
    expect(progressSource).toContain("'size-compare'");
    expect(questSource).toContain("id: 'math-4'");
    expect(questSource).toContain('큰 잠자리 구멍을 골라요');
    expect(questSource).toContain(
      '졸린 미어로가 잠을 잘 큰 구멍을 찾고 있어요. 어떤 구멍이 클까요?',
    );
    expect(questSource).toContain("backgroundAsset: 'math-cave-background'");
    expect(questSource).toContain("visualLayout: 'size-compare'");
    expect(questSource).toContain("{ id: 'hole-1', label: '1번' }");
    expect(questSource).toContain("{ id: 'hole-2', label: '2번' }");
    expect(questSource).toContain("correctChoiceId: 'hole-2'");
    expect(questSource).not.toContain("{ id: 'small-rock', label: '작은 바위' }");
    expect(questSource).not.toContain("{ id: 'big-rock', label: '큰 바위' }");
    expect(questSource).not.toContain("{ id: 'leaf', label: '나뭇잎' }");
    expect(screenSource).toContain("quest.visualLayout === 'size-compare'");
    expect(screenSource).toContain('SizeCompareQuestScreen');
    expect(screenSource).toContain('sizeCompareHolesImage');
    expect(screenSource).toContain('size-compare-meero-holes-v2.png');
    expect(screenSource).toContain('미어로가 두 구멍 앞에서 잠잘 큰 구멍을 고민하는 장면');
    expect(screenSource).toContain('구멍 위 반투명 원형 번호와 1번 2번 선택 버튼');
    expect(screenSource).toContain('sizeComparePromptRect');
    expect(screenSource).toContain('sizeCompareSceneRect');
    expect(screenSource).toContain('sizeCompareHoleLabelRects');
    expect(screenSource).toContain('sizeCompareChoiceRects');
    expect(screenSource).toContain('styles.sizeCompareSceneImage');
    expect(screenSource).toContain('styles.sizeCompareHoleNumberBadge');
    expect(screenSource).toContain('styles.sizeCompareNumberChoiceCard');
    expect(screenSource).toContain('styles.sizeCompareChoiceLabelText');
    expect(screenSource).toContain('getQuestStageCircleRect(stage, labelRect)');
    expect(screenSource).toContain('{getChoiceNumber(choice.label)}');
    expect(screenSource).not.toContain('sizeCompareRockImage');
    expect(screenSource).not.toContain('sizeComparePuddleImage');

    const panelRect = getSourceRect(screenSource, 'questContentBackdropRect');
    const promptRect = getSourceRect(screenSource, 'sizeComparePromptRect');
    const sceneRect = getSourceRect(screenSource, 'sizeCompareSceneRect');
    const firstHoleLabelRect = getChoiceRect(screenSource, 'hole-1-label');
    const secondHoleLabelRect = getChoiceRect(screenSource, 'hole-2-label');
    const firstButtonRect = getChoiceRect(screenSource, 'hole-1');
    const secondButtonRect = getChoiceRect(screenSource, 'hole-2');
    const holeNumberBadgeStyle = getStyleBlock(screenSource, 'sizeCompareHoleNumberBadge');
    const contentCenterY = (promptRect.top + promptRect.height + panelRect.top + panelRect.height) / 2;
    const sceneGroupCenterY = sceneRect.top + sceneRect.height / 2;
    const buttonsCenterY =
      (firstButtonRect.top + secondButtonRect.top + secondButtonRect.height) / 2;

    expect(promptRect.width).toBeGreaterThanOrEqual(840);
    expect(sceneRect.top).toBeGreaterThanOrEqual(promptRect.top + promptRect.height + 4);
    expect(sceneRect.left).toBeLessThan(firstButtonRect.left);
    expect(sceneRect.left + sceneRect.width).toBeLessThanOrEqual(firstButtonRect.left - 56);
    expect(firstHoleLabelRect.height).toBe(firstHoleLabelRect.width);
    expect(secondHoleLabelRect.height).toBe(secondHoleLabelRect.width);
    expect(firstHoleLabelRect.height).toBeLessThanOrEqual(54);
    expect(secondHoleLabelRect.height).toBeLessThanOrEqual(54);
    expect(firstHoleLabelRect.top).toBeLessThanOrEqual(412);
    expect(secondHoleLabelRect.top).toBeLessThanOrEqual(374);
    expect(screenSource).toContain("backgroundColor: 'rgba(247, 201, 72, 0.9)'");
    expect(screenSource).not.toContain("backgroundColor: 'rgba(255, 249, 236, 0.72)'");
    expect(holeNumberBadgeStyle).not.toContain('borderColor');
    expect(holeNumberBadgeStyle).not.toContain('borderWidth');
    expect(screenSource).toContain('function getQuestStageCircleRect');
    expect(screenSource).toContain('const size = Math.min(scaledRect.width, scaledRect.height)');
    expect(screenSource).toContain('width: size');
    expect(firstHoleLabelRect.top).toBeGreaterThanOrEqual(sceneRect.top);
    expect(firstHoleLabelRect.top + firstHoleLabelRect.height).toBeLessThanOrEqual(
      sceneRect.top + sceneRect.height,
    );
    expect(secondHoleLabelRect.top).toBeGreaterThanOrEqual(sceneRect.top);
    expect(secondHoleLabelRect.top + secondHoleLabelRect.height).toBeLessThanOrEqual(
      sceneRect.top + sceneRect.height,
    );
    expect(firstHoleLabelRect.left).toBeGreaterThanOrEqual(sceneRect.left);
    expect(secondHoleLabelRect.left + secondHoleLabelRect.width).toBeLessThanOrEqual(
      sceneRect.left + sceneRect.width,
    );
    expect(firstHoleLabelRect.left + firstHoleLabelRect.width).toBeLessThanOrEqual(
      secondHoleLabelRect.left - 140,
    );
    expect(firstButtonRect.left).toBe(secondButtonRect.left);
    expect(firstButtonRect.width).toBeGreaterThanOrEqual(240);
    expect(firstButtonRect.height).toBeGreaterThanOrEqual(120);
    expect(secondButtonRect.width).toBeGreaterThanOrEqual(240);
    expect(secondButtonRect.height).toBeGreaterThanOrEqual(120);
    expect(secondButtonRect.top).toBeGreaterThanOrEqual(firstButtonRect.top + firstButtonRect.height + 20);
    expect(secondButtonRect.top + secondButtonRect.height).toBeLessThanOrEqual(
      panelRect.top + panelRect.height,
    );
    expect(Math.abs(sceneGroupCenterY - contentCenterY)).toBeLessThanOrEqual(8);
    expect(Math.abs(buttonsCenterY - contentCenterY)).toBeLessThanOrEqual(8);
  });

  it('wires apple count numeric choices to quest answer handling', () => {
    const source = readFileSync(resolve(process.cwd(), 'app/quest-play.tsx'), 'utf8');

    expect(source).toContain('step={step}');
    expect(source).toContain('selectedChoiceId={selectedChoiceId}');
    expect(source).toContain('onChoicePress={handleChoicePress}');
    expect(source).toContain('choice.id === step.correctChoiceId');
  });

  it('keeps correct answer feedback off the center of the apple count scene', () => {
    const source = readFileSync(resolve(process.cwd(), 'app/quest-play.tsx'), 'utf8');

    expect(source).not.toContain('appleCountStar');
    expect(source).not.toContain('appleCountStarRect');
    expect(source).toContain('appleCountResultOverlay');
    expect(source).toContain('appleCountCheckBadge');
  });

  it('dims the apple count content and shows an action prompt after any selection', () => {
    const source = readFileSync(resolve(process.cwd(), 'app/quest-play.tsx'), 'utf8');
    const panelRect = getSourceRect(source, 'questContentBackdropRect');
    const promptRect = getSourceRect(source, 'appleCountPromptRect');
    const overlayRect = getSourceRect(source, 'appleCountResultOverlayRect');

    expect(source).toContain('styles.appleCountDimOverlay');
    expect(source).toContain('resultOverlay.actionLabel');
    expect(source).toContain('onResultOverlayPress');
    expect(overlayRect.top).toBeGreaterThanOrEqual(promptRect.top + promptRect.height + 8);
    expect(overlayRect.top + overlayRect.height).toBeLessThanOrEqual(panelRect.top + panelRect.height - 40);
  });

  it('places the correct and retry mascot animations inside the result overlay', () => {
    const source = readFileSync(resolve(process.cwd(), 'app/quest-play.tsx'), 'utf8');

    expect(source).toContain('MeeroDigPeekAnimation');
    expect(source).toContain('MeeroThinkAgainAnimation');
    expect(source).toContain("resultOverlay.tone === 'correct'");
    expect(source).toContain('styles.appleCountResultOverlayAnimation');
  });

  it('sizes result overlay mascot animations large enough to read as character feedback', () => {
    const source = readFileSync(resolve(process.cwd(), 'app/quest-play.tsx'), 'utf8');
    const appleCountAnimationSize = getSourceStyleSize(source, 'appleCountResultOverlayAnimation');
    const panelAnimationSize = getSourceStyleSize(source, 'resultOverlayAnimation');

    expect(appleCountAnimationSize.height).toBeGreaterThanOrEqual(128);
    expect(appleCountAnimationSize.width).toBeGreaterThanOrEqual(168);
    expect(panelAnimationSize.height).toBeGreaterThanOrEqual(128);
    expect(panelAnimationSize.width).toBeGreaterThanOrEqual(168);
  });

  it('places the apple image on the left and choice cards on the right', () => {
    const source = readFileSync(resolve(process.cwd(), 'app/quest-play.tsx'), 'utf8');
    const panelRect = getSourceRect(source, 'questContentBackdropRect');
    const applesRect = getSourceRect(source, 'appleCountApplesImageRect');
    const promptRect = getSourceRect(source, 'appleCountPromptRect');
    const twoChoiceRect = getChoiceRect(source, 'two');
    const threeChoiceRect = getChoiceRect(source, 'three');
    const contentCenterY = (promptRect.top + promptRect.height + panelRect.top + panelRect.height) / 2;
    const applesCenterY = applesRect.top + applesRect.height / 2;
    const choicesCenterY =
      (twoChoiceRect.top + threeChoiceRect.top + threeChoiceRect.height) / 2;

    expect(source).not.toContain('appleCountClusterGlow');
    expect(applesRect.top).toBeGreaterThanOrEqual(promptRect.top + promptRect.height + 6);
    expect(applesRect.left + applesRect.width).toBeLessThanOrEqual(twoChoiceRect.left - 36);
    expect(applesRect.left + applesRect.width).toBeLessThanOrEqual(threeChoiceRect.left - 36);
    expect(twoChoiceRect.left).toBe(threeChoiceRect.left);
    expect(threeChoiceRect.top).toBeGreaterThanOrEqual(twoChoiceRect.top + twoChoiceRect.height + 20);
    expect(Math.abs(applesCenterY - contentCenterY)).toBeLessThanOrEqual(2);
    expect(Math.abs(choicesCenterY - contentCenterY)).toBeLessThanOrEqual(2);
  });

  it('uses a Meero and Fena carrot addition template for the stage 5 math quest', () => {
    const questSource = readFileSync(resolve(process.cwd(), 'src/content/quests.ts'), 'utf8');
    const screenSource = readFileSync(resolve(process.cwd(), 'app/quest-play.tsx'), 'utf8');
    const progressSource = readFileSync(
      resolve(process.cwd(), 'src/features/quests/questProgress.ts'),
      'utf8',
    );
    const carrotAssetPath = resolve(
      process.cwd(),
      'assets/images/quests/carrot-addition/carrot-addition-meero-fena-v1.png',
    );

    expect(existsSync(carrotAssetPath)).toBe(true);
    const carrotAsset = readFileSync(carrotAssetPath);

    expect(carrotAsset[25]).toBe(6);
    expect(progressSource).toContain("'carrot-addition'");
    expect(questSource).toContain("id: 'math-5'");
    expect(questSource).toContain('당근을 더해요');
    expect(questSource).toContain(
      '미어로가 당근 2개를 갖고 있었어요. 페나가 당근 1개를 주면 모두 몇 개일까요?',
    );
    expect(questSource).toContain("visualLayout: 'carrot-addition'");
    expect(questSource).toContain("correctChoiceId: 'three'");
    expect(screenSource).toContain("quest.visualLayout === 'carrot-addition'");
    expect(screenSource).toContain('carrotAdditionSceneImage');
    expect(screenSource).toContain('carrot-addition-meero-fena-v1.png');
    expect(screenSource).toContain('미어로가 당근 2개를 들고 있고 페나가 당근 1개를 건네주는 장면');
    expect(screenSource).toContain('carrotAdditionSceneImageRect');
    expect(screenSource).toContain('carrotAdditionPromptRect');
    expect(screenSource).toContain('carrotAdditionChoiceRects');
    expect(screenSource).toContain('carrotAdditionChoiceDots');

    const panelRect = getSourceRect(screenSource, 'questContentBackdropRect');
    const sceneRect = getSourceRect(screenSource, 'carrotAdditionSceneImageRect');
    const promptRect = getSourceRect(screenSource, 'carrotAdditionPromptRect');
    const twoChoiceRect = getRecordChoiceRect(screenSource, 'carrotAdditionChoiceRects', 'two');
    const threeChoiceRect = getRecordChoiceRect(screenSource, 'carrotAdditionChoiceRects', 'three');
    const fourChoiceRect = getRecordChoiceRect(screenSource, 'carrotAdditionChoiceRects', 'four');

    expect(sceneRect.top).toBeGreaterThanOrEqual(promptRect.top + promptRect.height + 6);
    expect(sceneRect.left + sceneRect.width).toBeLessThanOrEqual(twoChoiceRect.left - 36);
    expect(twoChoiceRect.left).toBe(threeChoiceRect.left);
    expect(threeChoiceRect.left).toBe(fourChoiceRect.left);
    expect(threeChoiceRect.top).toBeGreaterThanOrEqual(twoChoiceRect.top + twoChoiceRect.height + 16);
    expect(fourChoiceRect.top).toBeGreaterThanOrEqual(threeChoiceRect.top + threeChoiceRect.height + 16);
    expect(fourChoiceRect.top + fourChoiceRect.height).toBeLessThanOrEqual(
      panelRect.top + panelRect.height,
    );
  });
});

function getSourceRect(source: string, name: string) {
  const match = source.match(
    new RegExp(
      `const ${name} = \\{ height: (\\d+), left: (\\d+), top: (\\d+), width: (\\d+) \\}`,
    ),
  );

  if (!match) {
    throw new Error(`Missing ${name}`);
  }

  return {
    height: Number(match[1]),
    left: Number(match[2]),
    top: Number(match[3]),
    width: Number(match[4]),
  };
}

function getChoiceRect(source: string, choiceId: string) {
  const match = source.match(
    new RegExp(
      `['"]?${choiceId}['"]?: \\{ height: (\\d+), left: (\\d+), top: (\\d+), width: (\\d+) \\}`,
    ),
  );

  if (!match) {
    throw new Error(`Missing ${choiceId} choice rect`);
  }

  return {
    height: Number(match[1]),
    left: Number(match[2]),
    top: Number(match[3]),
    width: Number(match[4]),
  };
}

function getRecordChoiceRect(source: string, recordName: string, choiceId: string) {
  const start = source.indexOf(`const ${recordName}`);

  if (start === -1) {
    throw new Error(`Missing ${recordName}`);
  }

  const end = source.indexOf('};', start);

  if (end === -1) {
    throw new Error(`Unclosed ${recordName}`);
  }

  return getChoiceRect(source.slice(start, end), choiceId);
}

function getAnimationFrameAssets(source: string, animationName: string) {
  const frameMatches = Array.from(
    source.matchAll(
      new RegExp(
        `assets/images/characters/animations/${animationName}/(${animationName}-\\d+\\.png)`,
        'g',
      ),
    ),
  );

  return [...new Set(frameMatches.map((match) => `assets/images/characters/animations/${animationName}/${match[1]}`))];
}

function getOpaqueBounds(path: string) {
  expect(existsSync(path)).toBe(true);

  const png = PNG.sync.read(readFileSync(path));
  let minX = png.width;
  let minY = png.height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < png.height; y += 1) {
    for (let x = 0; x < png.width; x += 1) {
      const alpha = png.data[(png.width * y + x) * 4 + 3];

      if (alpha > 12) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  return {
    bottom: maxY,
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2,
  };
}

function getBaseBounds(path: string) {
  const png = PNG.sync.read(readFileSync(path));
  let bottom = -1;

  for (let y = 0; y < png.height; y += 1) {
    for (let x = 0; x < png.width; x += 1) {
      const alpha = png.data[(png.width * y + x) * 4 + 3];

      if (alpha > 12) {
        bottom = Math.max(bottom, y);
      }
    }
  }

  let left = png.width;
  let right = -1;
  const baseTop = Math.max(0, bottom - 90);

  for (let y = baseTop; y <= bottom; y += 1) {
    for (let x = 0; x < png.width; x += 1) {
      const alpha = png.data[(png.width * y + x) * 4 + 3];

      if (alpha > 12) {
        left = Math.min(left, x);
        right = Math.max(right, x);
      }
    }
  }

  return { left, right };
}

function getBottomOpaqueBandHeight(path: string) {
  const png = PNG.sync.read(readFileSync(path));
  const opaqueRows: number[] = [];

  for (let y = 0; y < png.height; y += 1) {
    let opaquePixelCount = 0;

    for (let x = 0; x < png.width; x += 1) {
      const alpha = png.data[(png.width * y + x) * 4 + 3];

      if (alpha > 12) {
        opaquePixelCount += 1;
      }
    }

    if (opaquePixelCount > 0) {
      opaqueRows.push(y);
    }
  }

  let bandHeight = 1;

  for (let index = opaqueRows.length - 1; index > 0; index -= 1) {
    if (opaqueRows[index] - opaqueRows[index - 1] !== 1) {
      break;
    }

    bandHeight += 1;
  }

  return bandHeight;
}

function getBottomMascotFurPixelCount(path: string) {
  const png = PNG.sync.read(readFileSync(path));
  const guardTop = Math.max(0, png.height - 26);
  const guardLeft = 105;
  const guardRight = 205;
  let spilloverPixelCount = 0;

  for (let y = guardTop; y < png.height; y += 1) {
    for (let x = guardLeft; x <= guardRight; x += 1) {
      const offset = (png.width * y + x) * 4;

      if (
        isMascotFurPixel(
          png.data[offset],
          png.data[offset + 1],
          png.data[offset + 2],
          png.data[offset + 3],
        )
      ) {
        spilloverPixelCount += 1;
      }
    }
  }

  return spilloverPixelCount;
}

function getMaxLowerShelfExposureRun(path: string) {
  const png = PNG.sync.read(readFileSync(path));
  let maxExposureRun = 0;

  for (let y = 253; y <= 269; y += 1) {
    let currentRun = 0;

    for (let x = 80; x <= 240; x += 1) {
      const offset = (png.width * y + x) * 4;
      const aboveOffset = (png.width * (y - 1) + x) * 4;
      const isOpaque = png.data[offset + 3] > 12;
      const isExposedFromAbove = png.data[aboveOffset + 3] <= 12;

      if (isOpaque && isExposedFromAbove) {
        currentRun += 1;
        maxExposureRun = Math.max(maxExposureRun, currentRun);
      } else {
        currentRun = 0;
      }
    }
  }

  return maxExposureRun;
}

function getOpaquePixelCountInRect(
  path: string,
  rect: { height: number; left: number; top: number; width: number },
) {
  const png = PNG.sync.read(readFileSync(path));
  let opaquePixelCount = 0;

  for (let y = rect.top; y < rect.top + rect.height; y += 1) {
    for (let x = rect.left; x < rect.left + rect.width; x += 1) {
      const alpha = png.data[(png.width * y + x) * 4 + 3];

      if (alpha > 12) {
        opaquePixelCount += 1;
      }
    }
  }

  return opaquePixelCount;
}

function getMaskedPixelMismatchCount(
  referencePath: string,
  targetPath: string,
  isMaskedPixel: (x: number, y: number) => boolean,
) {
  const referencePng = PNG.sync.read(readFileSync(referencePath));
  const targetPng = PNG.sync.read(readFileSync(targetPath));
  let mismatchCount = 0;

  expect(targetPng.width).toBe(referencePng.width);
  expect(targetPng.height).toBe(referencePng.height);

  for (let y = 0; y < referencePng.height; y += 1) {
    for (let x = 0; x < referencePng.width; x += 1) {
      if (!isMaskedPixel(x, y)) {
        continue;
      }

      const offset = (referencePng.width * y + x) * 4;

      if (
        referencePng.data[offset] !== targetPng.data[offset] ||
        referencePng.data[offset + 1] !== targetPng.data[offset + 1] ||
        referencePng.data[offset + 2] !== targetPng.data[offset + 2] ||
        referencePng.data[offset + 3] !== targetPng.data[offset + 3]
      ) {
        mismatchCount += 1;
      }
    }
  }

  return mismatchCount;
}

function isThinkAgainGroundPixel(x: number, y: number) {
  if ((x <= 68 || x >= 258) && y >= 218) {
    return true;
  }

  const groundCenterX = 154;
  const normalizedDistanceFromCenter = Math.min(1, Math.abs(x - groundCenterX) / groundCenterX);
  const groundTop = Math.round(268 - 42 * normalizedDistanceFromCenter);

  return y >= groundTop;
}

function isMascotFurPixel(red: number, green: number, blue: number, alpha: number) {
  if (alpha <= 12) {
    return false;
  }

  const { hue, saturation, value } = rgbToHsv(red, green, blue);

  return (
    hue >= 32 &&
    hue <= 43 &&
    saturation >= 0.68 &&
    value >= 0.75 &&
    red >= 190 &&
    green >= 115 &&
    blue <= 85
  );
}

function rgbToHsv(red: number, green: number, blue: number) {
  const normalizedRed = red / 255;
  const normalizedGreen = green / 255;
  const normalizedBlue = blue / 255;
  const max = Math.max(normalizedRed, normalizedGreen, normalizedBlue);
  const min = Math.min(normalizedRed, normalizedGreen, normalizedBlue);
  const delta = max - min;
  let hue = 0;

  if (delta > 0) {
    if (max === normalizedRed) {
      hue = ((normalizedGreen - normalizedBlue) / delta) % 6;
    } else if (max === normalizedGreen) {
      hue = (normalizedBlue - normalizedRed) / delta + 2;
    } else {
      hue = (normalizedRed - normalizedGreen) / delta + 4;
    }

    hue *= 60;

    if (hue < 0) {
      hue += 360;
    }
  }

  return {
    hue,
    saturation: max === 0 ? 0 : delta / max,
    value: max,
  };
}

function getSpread(values: number[]) {
  return Math.max(...values) - Math.min(...values);
}

function getDefaultFrameMs(source: string) {
  const match = source.match(/const defaultFrameMs = (\d+);/);

  if (!match) {
    throw new Error('Missing defaultFrameMs');
  }

  return Number(match[1]);
}

function getSourceStyleSize(source: string, name: string) {
  const match = source.match(
    new RegExp(`${name}: \\{[\\s\\S]*?height: (\\d+),[\\s\\S]*?width: (\\d+),[\\s\\S]*?\\}`),
  );

  if (!match) {
    throw new Error(`Missing ${name} style`);
  }

  return {
    height: Number(match[1]),
    width: Number(match[2]),
  };
}

function getStyleBlock(source: string, name: string) {
  const start = source.indexOf(`${name}: {`);

  if (start === -1) {
    throw new Error(`Missing ${name} style`);
  }

  const openBraceIndex = source.indexOf('{', start);
  let depth = 0;

  for (let index = openBraceIndex; index < source.length; index += 1) {
    if (source[index] === '{') {
      depth += 1;
    }

    if (source[index] === '}') {
      depth -= 1;

      if (depth === 0) {
        return source.slice(openBraceIndex, index + 1);
      }
    }
  }

  throw new Error(`Unclosed ${name} style`);
}
