import { categoryColors, colors } from '@/src/theme/colors';

import type { QuestCategoryId } from './categories';

export type QuestMapThemeBackgroundKey =
  | 'math-cave'
  | 'language-hill'
  | 'social-playground'
  | 'safety-desert';

export interface QuestMapTheme {
  accentColor: string;
  backgroundKey: QuestMapThemeBackgroundKey;
  hudMutedColor: string;
  ropeColor: string;
  ropeKnotColor: string;
  safeAreaColor: string;
  title: string;
  vignetteColor: string;
}

export const questMapThemes: Record<QuestCategoryId, QuestMapTheme> = {
  math: {
    accentColor: categoryColors.math,
    backgroundKey: 'math-cave',
    hudMutedColor: colors.muted,
    ropeColor: '#C88B48',
    ropeKnotColor: '#B47739',
    safeAreaColor: '#4D2B2A',
    title: '신비한 수학 동굴',
    vignetteColor: 'rgba(43, 24, 26, 0.16)',
  },
  language: {
    accentColor: categoryColors.language,
    backgroundKey: 'language-hill',
    hudMutedColor: '#376A80',
    ropeColor: '#4FAACB',
    ropeKnotColor: '#2F8EB0',
    safeAreaColor: '#235D73',
    title: '말소리 언어 언덕',
    vignetteColor: 'rgba(18, 84, 107, 0.12)',
  },
  social: {
    accentColor: categoryColors.social,
    backgroundKey: 'social-playground',
    hudMutedColor: '#8D4D2C',
    ropeColor: '#E59053',
    ropeKnotColor: '#C66D35',
    safeAreaColor: '#7A4228',
    title: '마음 놀이터',
    vignetteColor: 'rgba(120, 63, 31, 0.12)',
  },
  safety: {
    accentColor: categoryColors.safety,
    backgroundKey: 'safety-desert',
    hudMutedColor: '#816827',
    ropeColor: '#D6A848',
    ropeKnotColor: '#B8872E',
    safeAreaColor: '#6D5525',
    title: '안전 사막 길',
    vignetteColor: 'rgba(109, 76, 20, 0.12)',
  },
};

export function getQuestMapTheme(categoryId: QuestCategoryId): QuestMapTheme {
  return questMapThemes[categoryId];
}
