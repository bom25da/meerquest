import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

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
  homeEntrySpeechText,
  todayQuest,
} from './home';

describe('home screen content', () => {
  it('uses the mountain adventure image for the full-width quest map banner', () => {
    expect(homeHero).toEqual({
      image: 'home-adventure-background-clean',
      alt: '미어루가 산길 앞에서 손을 흔드는 퀘스트맵 배너',
      aspectRatio: 1857 / 847,
      resizeMode: 'cover',
      frameBorderWidth: 0,
      speechText: '오늘도 같이\n탐험하자!',
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

  it('renders the hero speech bubble image and text as overlays instead of baked-in image text', () => {
    const homeScreenSource = readFileSync(resolve(process.cwd(), 'app/index.tsx'), 'utf8');

    expect(existsSync(resolve(process.cwd(), 'assets/images/home/hero-speech-bubble.png'))).toBe(
      true,
    );
    expect(homeScreenSource).toContain('hero-speech-bubble.png');
    expect(homeScreenSource).toContain('{homeHero.speechText}');
    expect(homeScreenSource).toContain('styles.speechBubble');
    expect(homeScreenSource).toContain('styles.speechBubbleImage');
    expect(homeScreenSource).toContain('styles.speechText');
    expect(homeScreenSource).not.toContain('styles.heroSpeechText');
    expect(homeScreenSource).not.toContain('styles.speechTail');
  });

  it('uses a smaller generated speech bubble and bold hero speech text', () => {
    const homeScreenSource = readFileSync(resolve(process.cwd(), 'app/index.tsx'), 'utf8');

    expect(homeScreenSource).toContain("width: '17.2%'");
    expect(homeScreenSource).toContain('aspectRatio: 512 / 353');
    expect(homeScreenSource).toContain("fontWeight: '900'");
  });

  it('speaks the home entry greeting through Supertonic 2 when the home screen mounts', () => {
    const homeScreenSource = readFileSync(resolve(process.cwd(), 'app/index.tsx'), 'utf8');

    expect(homeEntrySpeechText).toBe('오늘 같이 탐험해보자');
    expect(homeScreenSource).toContain(
      "import { supertonic2SpeechService } from '@/src/features/speech/supertonic2Speech';",
    );
    expect(homeScreenSource).toContain('useFocusEffect');
    expect(homeScreenSource).toContain('supertonic2SpeechService.speakText(homeEntrySpeechText');
    expect(homeScreenSource).toContain("lang: 'ko'");
    expect(homeScreenSource).toContain("voice: 'F1'");
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
      homeLearningRegions.map(({ id, title, stars, locked, art, background, route }) => ({
        id,
        title,
        stars,
        locked,
        art,
        background,
        route,
      })),
    ).toEqual([
      {
        id: 'math',
        title: '수학동굴',
        stars: 3,
        locked: false,
        art: 'category-math-cave',
        background: 'category-math-background',
        route: '/quest-map?categoryId=math',
      },
      {
        id: 'language',
        title: '언어언덕',
        stars: 2,
        locked: false,
        art: 'category-language-hill',
        background: 'category-language-background',
        route: '/quest-map?categoryId=language',
      },
      {
        id: 'social',
        title: '마음놀이터',
        stars: 1,
        locked: false,
        art: 'category-social-playground',
        background: 'category-social-background',
        route: '/quest-map?categoryId=social',
      },
      {
        id: 'safety',
        title: '안전사막',
        stars: 0,
        locked: true,
        art: 'category-safety-desert',
        background: 'category-safety-background',
        route: '/quest-map?categoryId=safety',
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
