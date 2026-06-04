import { categoryColors } from '@/src/theme/colors';

export type QuestCategoryId = 'math' | 'language' | 'social' | 'safety';

export interface QuestCategory {
  id: QuestCategoryId;
  title: string;
  subtitle: string;
  accentColor: string;
}

export const categories: QuestCategory[] = [
  {
    id: 'math',
    title: '수학 동굴',
    subtitle: '숫자, 도형, 패턴을 찾아요',
    accentColor: categoryColors.math,
  },
  {
    id: 'language',
    title: '언어 언덕',
    subtitle: '소리와 그림을 연결해요',
    accentColor: categoryColors.language,
  },
  {
    id: 'social',
    title: '마음 놀이터',
    subtitle: '친구와 감정을 배워요',
    accentColor: categoryColors.social,
  },
  {
    id: 'safety',
    title: '안전 사막',
    subtitle: '위험한 상황을 알아차려요',
    accentColor: categoryColors.safety,
  },
];
