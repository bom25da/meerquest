import { categories } from './categories';
import type { QuestCategory, QuestCategoryId } from './categories';

export interface QuestMapCopy {
  title: string;
  subtitle: string;
}

const categoryIds = new Set<QuestCategoryId>(categories.map((category) => category.id));

function getCategoryIdParam(categoryId?: string | string[]): string | undefined {
  return Array.isArray(categoryId) ? categoryId[0] : categoryId;
}

export function getQuestMapCategories(categoryId?: string | string[]): QuestCategory[] {
  const selectedCategoryId = getCategoryIdParam(categoryId);

  if (!selectedCategoryId || !categoryIds.has(selectedCategoryId as QuestCategoryId)) {
    return categories;
  }

  return categories.filter((category) => category.id === selectedCategoryId);
}

export function getQuestMapCopy(categoryId?: string | string[]): QuestMapCopy {
  const selectedCategories = getQuestMapCategories(categoryId);

  if (selectedCategories.length === 1) {
    return {
      title: selectedCategories[0].title,
      subtitle: '선택한 탐험 지역의 퀘스트를 한 단계씩 깨봐요.',
    };
  }

  return {
    title: '퀘스트 맵',
    subtitle: '완료한 퀘스트 다음에는 조금 더 깊은 땅굴이 열려요.',
  };
}
