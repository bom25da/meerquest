import type { QuestCategoryId } from "./categories";

export type HomeRegionTone = "orange" | "blue" | "green" | "yellow";
export type HomeRegionArt =
  | "category-math-cave"
  | "category-language-hill"
  | "category-social-playground"
  | "category-safety-desert";
export type HomeRegionBackground =
  | "category-math-background"
  | "category-language-background"
  | "category-social-background"
  | "category-safety-background";

export type HomeNavigationId = "home" | "quest-map" | "reward" | "guardian";
export type HomeNavigationIcon =
  | "nav-home"
  | "nav-quest-map"
  | "nav-reward"
  | "nav-guardian";
export type HomeHeroCtaImage = "quest-map-button";
export type HomeLearningRegionRoute =
  `/quest-map?categoryId=${QuestCategoryId}`;
export type HomeSectionHeaderIcon = "sprout";

export interface HomeHeroCtaLayout {
  bottom: number;
  height: number;
  right: number;
  width: number;
}

export interface HomeHero {
  image:
    | "home-banner"
    | "home-adventure-background"
    | "home-adventure-background-clean"
    | "home-adventure-background-no-text";
  alt: string;
  aspectRatio: number;
  resizeMode: "cover";
  frameBorderWidth: number;
  speechText: string;
  cta: {
    image: HomeHeroCtaImage;
    label: string;
    layout: {
      compact: HomeHeroCtaLayout;
      regular: HomeHeroCtaLayout;
    };
    route: "/quest-map";
    variant: "image-button";
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
  route: HomeLearningRegionRoute;
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
  compactRegionCardAspectRatio: number;
  contentGap: number;
  maxContentWidth: number;
  regionCardAspectRatio: number;
  regionColumns: number;
  regionGridGap: number;
  screenPadding: {
    compact: number;
    regular: number;
  };
}

export interface HomeViewportLayoutInput {
  bodyWidth: number;
  bottomInset: number;
  height: number;
  isCompact: boolean;
}

export interface HomeViewportLayout {
  heroHeight: number;
  regionCardHeight: number;
  regionCardWidth: number;
}

export const homeEntrySpeechText = "오늘도 같이 탐험해보자!";

export const homeHero: HomeHero = {
  image: "home-adventure-background-clean",
  alt: "미어로가 산길 앞에서 손을 흔드는 퀘스트맵 배너",
  aspectRatio: 1857 / 847,
  resizeMode: "cover",
  frameBorderWidth: 0,
  speechText: "오늘도 같이\n탐험하자!",
  cta: {
    image: "quest-map-button",
    label: "퀘스트 맵 보기",
    layout: {
      compact: {
        bottom: 10,
        height: 106,
        right: 14,
        width: 110,
      },
      regular: {
        bottom: 18,
        height: 148,
        right: 34,
        width: 154,
      },
    },
    route: "/quest-map",
    variant: "image-button",
  },
};

export const homeLandscapeLayout: HomeLandscapeLayout = {
  bodyGap: 12,
  bottomNavigationMaxWidth: 620,
  bottomNavigationMinHeight: 74,
  compactHeightBreakpoint: 500,
  compactBreakpoint: 760,
  compactRegionCardAspectRatio: 2.05,
  contentGap: 10,
  maxContentWidth: 1160,
  regionCardAspectRatio: 1.75,
  regionColumns: 4,
  regionGridGap: 10,
  screenPadding: {
    compact: 12,
    regular: 20,
  },
};

const homeViewportChrome = {
  bottomNavigationHeight: {
    compact: 48,
    regular: homeLandscapeLayout.bottomNavigationMinHeight,
  },
  bottomNavigationMarginMin: 8,
  compactTopBarHeight: 54,
  expandedRegionCardAspectRatio: 1.1,
  heroViewportRatio: {
    compact: 0.39,
    regular: 0.39,
  },
  regionColumnGap: 8,
  regularTopBarHeight: 60,
  sectionHeaderHeight: 32,
} as const;

export function getHomeViewportLayout({
  bodyWidth,
  bottomInset,
  height,
  isCompact,
}: HomeViewportLayoutInput): HomeViewportLayout {
  const columns = homeLandscapeLayout.regionColumns;
  const regionCardWidth =
    (bodyWidth - homeLandscapeLayout.regionGridGap * (columns - 1)) / columns;
  const regularHeroHeight = Math.min(
    bodyWidth / homeHero.aspectRatio,
    height *
      (isCompact
        ? homeViewportChrome.heroViewportRatio.compact
        : homeViewportChrome.heroViewportRatio.regular),
  );
  const regularRegionCardHeight =
    regionCardWidth /
    (isCompact
      ? homeLandscapeLayout.compactRegionCardAspectRatio
      : homeLandscapeLayout.regionCardAspectRatio);
  const containerVerticalPadding =
    (isCompact
      ? homeLandscapeLayout.screenPadding.compact
      : homeLandscapeLayout.screenPadding.regular) + 10;
  const fixedVerticalHeight =
    (isCompact
      ? homeViewportChrome.compactTopBarHeight
      : homeViewportChrome.regularTopBarHeight) +
    containerVerticalPadding +
    homeLandscapeLayout.bodyGap +
    homeViewportChrome.sectionHeaderHeight +
    homeViewportChrome.regionColumnGap +
    (isCompact
      ? homeViewportChrome.bottomNavigationHeight.compact
      : homeViewportChrome.bottomNavigationHeight.regular) +
    Math.max(bottomInset, homeViewportChrome.bottomNavigationMarginMin);
  const availableFlexibleHeight = Math.max(0, height - fixedVerticalHeight);
  const regularFlexibleHeight = regularHeroHeight + regularRegionCardHeight;

  if (availableFlexibleHeight <= regularFlexibleHeight) {
    const scale =
      regularFlexibleHeight > 0
        ? availableFlexibleHeight / regularFlexibleHeight
        : 1;

    return {
      heroHeight: Math.round(regularHeroHeight * scale),
      regionCardHeight: Math.round(regularRegionCardHeight * scale),
      regionCardWidth,
    };
  }

  const maxHeroHeight = bodyWidth / homeHero.aspectRatio;
  const maxRegionCardHeight =
    regionCardWidth / homeViewportChrome.expandedRegionCardAspectRatio;
  const targetFlexibleHeight = Math.min(
    availableFlexibleHeight,
    maxHeroHeight + maxRegionCardHeight,
  );
  const extraHeight = targetFlexibleHeight - regularFlexibleHeight;
  const heroCapacity = Math.max(0, maxHeroHeight - regularHeroHeight);
  const regionCardCapacity = Math.max(
    0,
    maxRegionCardHeight - regularRegionCardHeight,
  );
  const totalCapacity = heroCapacity + regionCardCapacity;
  const heroExtra =
    totalCapacity > 0
      ? extraHeight * (heroCapacity / totalCapacity)
      : extraHeight / 2;
  const regionCardExtra = extraHeight - heroExtra;

  return {
    heroHeight: Math.round(regularHeroHeight + heroExtra),
    regionCardHeight: Math.round(regularRegionCardHeight + regionCardExtra),
    regionCardWidth,
  };
}

export const homeLearningRegions: HomeLearningRegion[] = [
  {
    id: "math",
    title: "수학동굴",
    stars: 0,
    locked: false,
    tone: "orange",
    art: "category-math-cave",
    background: "category-math-background",
    route: "/quest-map?categoryId=math",
  },
  {
    id: "language",
    title: "언어언덕",
    stars: 0,
    locked: false,
    tone: "blue",
    art: "category-language-hill",
    background: "category-language-background",
    route: "/quest-map?categoryId=language",
  },
  {
    id: "social",
    title: "마음놀이터",
    stars: 0,
    locked: false,
    tone: "green",
    art: "category-social-playground",
    background: "category-social-background",
    route: "/quest-map?categoryId=social",
  },
  {
    id: "safety",
    title: "안전사막",
    stars: 0,
    locked: false,
    tone: "yellow",
    art: "category-safety-desert",
    background: "category-safety-background",
    route: "/quest-map?categoryId=safety",
  },
];

export const homeRegionCardStyle: HomeRegionCardStyle = {
  borderRadius: 8,
  borderWidth: 0,
  showIcon: false,
};

export const homeSectionHeader: HomeSectionHeader = {
  icon: "sprout",
  title: "탐험 지역 고르기",
};

export const homeNavigationItems: HomeNavigationItem[] = [
  { id: "home", label: "홈", route: "/", active: true, icon: "nav-home" },
  {
    id: "quest-map",
    label: "퀘스트맵",
    route: "/quest-map",
    active: false,
    icon: "nav-quest-map",
  },
  {
    id: "reward",
    label: "보상",
    route: "/reward",
    active: false,
    icon: "nav-reward",
  },
  {
    id: "guardian",
    label: "보호자",
    route: "/guardian",
    active: false,
    icon: "nav-guardian",
  },
];

export const homeNavigationStyle: HomeNavigationStyle = {
  assetSize: 96,
  minimumTouchTarget: 48,
  inactiveIconOpacity: 0.7,
  activeBackgroundColor: "#FFF1E5",
  inactiveLabelColor: "#5B412A",
  activeLabelColor: "#F47B17",
};

export const todayQuest = {
  title: "오늘의 퀘스트:",
  description: "사과를 세어보자",
  rewardIcon: "🍎",
} as const;
