import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const animationComponentPath = resolve(
  process.cwd(),
  'src/components/quest/MeeroDigPeekAnimation.tsx',
);

describe('Meero dig-peek animation', () => {
  it('defines a looping animation from the five dig-peek frame assets', () => {
    const source = existsSync(animationComponentPath)
      ? readFileSync(animationComponentPath, 'utf8')
      : '';

    expect(existsSync(animationComponentPath)).toBe(true);
    expect(source).toContain('setInterval');
    expect(source).toContain('meero-dig-peek-01.png');
    expect(source).toContain('meero-dig-peek-02.png');
    expect(source).toContain('meero-dig-peek-03.png');
    expect(source).toContain('meero-dig-peek-04.png');
    expect(source).toContain('meero-dig-peek-05.png');
  });

  it('keeps the apple count screen free of the temporary mascot and question panels', () => {
    const source = readFileSync(resolve(process.cwd(), 'app/quest-play.tsx'), 'utf8');

    expect(source).not.toContain('<MeeroDigPeekAnimation');
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
});
