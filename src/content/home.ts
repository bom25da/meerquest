import type { QuestCategoryId } from './categories';

export type HomeRegionTone = 'orange' | 'blue' | 'green' | 'yellow';
export type HomeRegionArt =
  | 'category-math-cave'
  | 'category-language-hill'
  | 'category-social-playground'
  | 'category-safety-desert';
export type HomeRegionBackground =
  | 'category-math-background'
  | 'category-language-background'
  | 'category-social-background'
  | 'category-safety-background';

export type HomeNavigationId = 'home' | 'quest-map' | 'reward' | 'guardian';
export type HomeNavigationIcon = 'nav-home' | 'nav-quest-map' | 'nav-reward' | 'nav-guardian';
export type HomeHeroCtaImage = 'quest-map-button';
export type HomeSectionHeaderIcon = 'sprout';

export interface HomeHeroCtaLayout {
  bottom: number;
  height: number;
  right: number;
  width: number;
}

export interface HomeHero {
  image: 'home-banner';
  alt: string;
  aspectRatio: number;
  frameBorderWidth: number;
  cta: {
    image: HomeHeroCtaImage;
    label: string;
    layout: {
      compact: HomeHeroCtaLayout;
      regular: HomeHeroCtaLayout;
    };
    route: '/quest-map';
    variant: 'image-button';
  };
}

export interface HomeLearningRegion {
  id: QuestCategoryId;
  title: string;
  stars: number;
  locked: boolean;
  tone: HomeRegionTone;
  art: HomeRegionArt;
  background: HomeRegionBackground;
}

export interface HomeNavigationItem {
  id: HomeNavigationId;
  label: string;
  route: string;
  active: boolean;
  icon: HomeNavigationIcon;
}

export interface HomeNavigationStyle {
  assetSize: number;
  minimumTouchTarget: number;
  inactiveIconOpacity: number;
  activeBackgroundColor: string;
  inactiveLabelColor: string;
  activeLabelColor: string;
}

export interface HomeRegionCardStyle {
  borderRadius: number;
  borderWidth: number;
  showIcon: boolean;
}

export interface HomeSectionHeader {
  icon: HomeSectionHeaderIcon;
  title: string;
}

export interface HomeLandscapeLayout {
  bodyGap: number;
  bottomNavigationMaxWidth: number;
  bottomNavigationMinHeight: number;
  compactHeightBreakpoint: number;
  compactBreakpoint: number;
  compactHeroColumnRatio: number;
  compactRegionCardAspectRatio: number;
  contentGap: number;
  heroColumnRatio: number;
  maxContentWidth: number;
  regionCardAspectRatio: number;
  regionColumns: number;
  regionGridGap: number;
  screenPadding: {
    compact: number;
    regular: number;
  };
}

export const homeHero: HomeHero = {
  image: 'home-banner',
  alt: '미어루가 오늘도 같이 탐험하자고 인사하는 홈 퀘스트맵 배너',
  aspectRatio: 1438 / 736,
  frameBorderWidth: 0,
  cta: {
    image: 'quest-map-button',
    label: '퀘스트 맵 보기',
    layout: {
      compact: {
        bottom: -34,
        height: 118,
        right: 0,
        width: 112,
      },
      regular: {
        bottom: -36,
        height: 150,
        right: 4,
        width: 136,
      },
    },
    route: '/quest-map',
    variant: 'image-button',
  },
};

export const homeLandscapeLayout: HomeLandscapeLayout = {
  bodyGap: 12,
  bottomNavigationMaxWidth: 620,
  bottomNavigationMinHeight: 74,
  compactHeightBreakpoint: 500,
  compactBreakpoint: 760,
  compactHeroColumnRatio: 0.42,
  compactRegionCardAspectRatio: 2.2,
  contentGap: 10,
  heroColumnRatio: 0.54,
  maxContentWidth: 1160,
  regionCardAspectRatio: 1.55,
  regionColumns: 2,
  regionGridGap: 10,
  screenPadding: {
    compact: 12,
    regular: 20,
  },
};

export const homeLearningRegions: HomeLearningRegion[] = [
  {
    id: 'math',
    title: '수학',
    stars: 3,
    locked: false,
    tone: 'orange',
    art: 'category-math-cave',
    background: 'category-math-background',
  },
  {
    id: 'language',
    title: '언어',
    stars: 2,
    locked: false,
    tone: 'blue',
    art: 'category-language-hill',
    background: 'category-language-background',
  },
  {
    id: 'social',
    title: '사회성',
    stars: 1,
    locked: false,
    tone: 'green',
    art: 'category-social-playground',
    background: 'category-social-background',
  },
  {
    id: 'safety',
    title: '안전',
    stars: 0,
    locked: true,
    tone: 'yellow',
    art: 'category-safety-desert',
    background: 'category-safety-background',
  },
];

export const homeRegionCardStyle: HomeRegionCardStyle = {
  borderRadius: 8,
  borderWidth: 0,
  showIcon: false,
};

export const homeSectionHeader: HomeSectionHeader = {
  icon: 'sprout',
  title: '탐험 지역 고르기',
};

export const homeNavigationItems: HomeNavigationItem[] = [
  { id: 'home', label: '홈', route: '/', active: true, icon: 'nav-home' },
  { id: 'quest-map', label: '퀘스트맵', route: '/quest-map', active: false, icon: 'nav-quest-map' },
  { id: 'reward', label: '보상', route: '/reward', active: false, icon: 'nav-reward' },
  { id: 'guardian', label: '보호자', route: '/guardian', active: false, icon: 'nav-guardian' },
];

export const homeNavigationStyle: HomeNavigationStyle = {
  assetSize: 96,
  minimumTouchTarget: 48,
  inactiveIconOpacity: 0.7,
  activeBackgroundColor: '#FFF1E5',
  inactiveLabelColor: '#5B412A',
  activeLabelColor: '#F47B17',
};

export const todayQuest = {
  title: '오늘의 퀘스트:',
  description: '사과를 세어보자',
  rewardIcon: '🍎',
} as const;
