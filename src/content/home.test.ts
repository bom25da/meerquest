import { describe, expect, it } from 'vitest';

import {
  homeHero,
  homeLandscapeLayout,
  homeLearningRegions,
  homeRegionCardStyle,
  homeSectionHeader,
  homeNavigationItems,
  homeNavigationStyle,
  getHomeViewportLayout,
  todayQuest,
} from './home';

describe('home screen content', () => {
  it('uses the mountain adventure image for the full-width quest map banner', () => {
    expect(homeHero).toEqual({
      image: 'home-adventure-background',
      alt: '미어루가 산길 앞에서 오늘도 같이 탐험하자고 말하는 퀘스트맵 배너',
      aspectRatio: 1499 / 704,
      resizeMode: 'cover',
      frameBorderWidth: 0,
      cta: {
        image: 'quest-map-button',
        label: '퀘스트 맵 보기',
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
        route: '/quest-map',
        variant: 'image-button',
      },
    });
  });

  it('defines the landscape-first home layout bounds', () => {
    expect(homeLandscapeLayout).toEqual({
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
    });
  });

  it('expands the home hero and region cards to fill taller tablet screens', () => {
    const layout = getHomeViewportLayout({
      bodyWidth: 984,
      bottomInset: 0,
      height: 768,
      isCompact: false,
    });

    expect(layout.regionCardWidth).toBe(238.5);
    expect(layout.heroHeight + layout.regionCardHeight).toBe(544);
    expect(layout.heroHeight).toBeGreaterThan(Math.round(768 * 0.39));
    expect(layout.regionCardHeight).toBeGreaterThan(136);
  });

  it('keeps the home hero and region cards inside shorter landscape screens', () => {
    const layout = getHomeViewportLayout({
      bodyWidth: 984,
      bottomInset: 0,
      height: 576,
      isCompact: false,
    });

    expect(layout.heroHeight + layout.regionCardHeight).toBe(352);
    expect(layout.heroHeight).toBeLessThan(Math.round(576 * 0.39));
  });

  it('matches the four main learning regions shown on the home dashboard', () => {
    expect(
      homeLearningRegions.map(({ id, title, stars, locked, art, background }) => ({
        id,
        title,
        stars,
        locked,
        art,
        background,
      })),
    ).toEqual([
      {
        id: 'math',
        title: '수학',
        stars: 3,
        locked: false,
        art: 'category-math-cave',
        background: 'category-math-background',
      },
      {
        id: 'language',
        title: '언어',
        stars: 2,
        locked: false,
        art: 'category-language-hill',
        background: 'category-language-background',
      },
      {
        id: 'social',
        title: '사회성',
        stars: 1,
        locked: false,
        art: 'category-social-playground',
        background: 'category-social-background',
      },
      {
        id: 'safety',
        title: '안전',
        stars: 0,
        locked: true,
        art: 'category-safety-desert',
        background: 'category-safety-background',
      },
    ]);
  });

  it('defines the bottom toolbar navigation order and active home tab', () => {
    expect(homeNavigationItems).toEqual([
      { id: 'home', label: '홈', route: '/', active: true, icon: 'nav-home' },
      {
        id: 'quest-map',
        label: '퀘스트맵',
        route: '/quest-map',
        active: false,
        icon: 'nav-quest-map',
      },
      { id: 'reward', label: '보상', route: '/reward', active: false, icon: 'nav-reward' },
      {
        id: 'guardian',
        label: '보호자',
        route: '/guardian',
        active: false,
        icon: 'nav-guardian',
      },
    ]);
  });

  it('uses image backgrounds without extra region card icons or borders', () => {
    expect(homeRegionCardStyle).toEqual({
      borderRadius: 8,
      borderWidth: 0,
      showIcon: false,
    });
  });

  it('uses the sprout asset before the learning region section title', () => {
    expect(homeSectionHeader).toEqual({
      icon: 'sprout',
      title: '탐험 지역 고르기',
    });
  });

  it('matches the bottom navigation proposal interaction guidance', () => {
    expect(homeNavigationStyle).toEqual({
      assetSize: 96,
      minimumTouchTarget: 48,
      inactiveIconOpacity: 0.7,
      activeBackgroundColor: '#FFF1E5',
      inactiveLabelColor: '#5B412A',
      activeLabelColor: '#F47B17',
    });
  });

  it('surfaces the current quest prompt for the bottom callout', () => {
    expect(todayQuest).toEqual({
      title: '오늘의 퀘스트:',
      description: '사과를 세어보자',
      rewardIcon: '🍎',
    });
  });
});
