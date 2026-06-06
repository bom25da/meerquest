import { describe, expect, it } from 'vitest';

import { getQuestMapCategories, getQuestMapCopy } from './questMap';

describe('quest map content helpers', () => {
  it('shows every category when opened from the quest map button', () => {
    expect(getQuestMapCategories().map((category) => category.id)).toEqual([
      'math',
      'language',
      'social',
      'safety',
    ]);
    expect(getQuestMapCopy().title).toBe('퀘스트 맵');
  });

  it('shows only the selected category when opened from a home region card', () => {
    expect(getQuestMapCategories('language').map((category) => category.id)).toEqual([
      'language',
    ]);
    expect(getQuestMapCopy('language')).toEqual({
      title: '언어 언덕',
      subtitle: '선택한 탐험 지역의 퀘스트를 한 단계씩 깨봐요.',
    });
  });

  it('falls back to every category for unknown category parameters', () => {
    expect(getQuestMapCategories('unknown').map((category) => category.id)).toEqual([
      'math',
      'language',
      'social',
      'safety',
    ]);
  });
});
