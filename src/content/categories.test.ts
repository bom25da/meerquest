import { describe, expect, it } from 'vitest';

import { categories } from './categories';

describe('quest categories', () => {
  it('defines a matching exploration illustration for each category', () => {
    expect(
      categories.map(({ id, title, illustration }) => ({
        id,
        title,
        illustration,
      })),
    ).toEqual([
      { id: 'math', title: '수학 동굴', illustration: 'cave' },
      { id: 'language', title: '언어 언덕', illustration: 'hill' },
      { id: 'social', title: '마음 놀이터', illustration: 'playground' },
      { id: 'safety', title: '안전 사막', illustration: 'desert' },
    ]);
  });
});
