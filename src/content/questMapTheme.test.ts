import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { categories } from './categories';
import { getQuestMapTheme, questMapThemes } from './questMapTheme';

describe('quest map themes', () => {
  it('defines a distinct map theme for every learning category', () => {
    expect(Object.keys(questMapThemes).sort()).toEqual(
      categories.map((category) => category.id).sort(),
    );

    expect(getQuestMapTheme('math')).toMatchObject({
      backgroundKey: 'math-cave',
      title: '신비한 수학 동굴',
    });
    expect(getQuestMapTheme('language')).toMatchObject({
      backgroundKey: 'language-hill',
      title: '말소리 언어 언덕',
    });
    expect(getQuestMapTheme('social')).toMatchObject({
      backgroundKey: 'social-playground',
      title: '마음 놀이터',
    });
    expect(getQuestMapTheme('safety')).toMatchObject({
      backgroundKey: 'safety-desert',
      title: '안전 사막 길',
    });
  });

  it('uses the selected category theme in the quest map screen', () => {
    const source = readFileSync(resolve(__dirname, '../../app/quest-map.tsx'), 'utf8');

    expect(source).toContain('getQuestMapTheme(activeCategory.id)');
    expect(source).toContain('questMapBackgroundSources[mapTheme.backgroundKey]');
    expect(source).toContain('language-hill-empty-ground-v1.png');
    expect(source).toContain('social-playground-empty-ground-v1.png');
    expect(source).toContain('safety-desert-empty-ground-v1.png');
    expect(source).not.toContain('category-language-background.png');
    expect(source).not.toContain('category-social-background.png');
    expect(source).not.toContain('category-safety-background.png');
    expect(source).not.toContain('<Text style={styles.hudEyebrow}>신비한 수학 동굴</Text>');
  });

  it('keeps a visible back control on the quest map screen', () => {
    const source = readFileSync(resolve(__dirname, '../../app/quest-map.tsx'), 'utf8');

    expect(source).toContain("require('../assets/images/quests/buttons/quest-button-back.png')");
    expect(source).toContain('accessibilityLabel="이전 화면"');
    expect(source).toContain('router.canGoBack()');
    expect(source).toContain("router.push('/' as Href)");
  });
});
