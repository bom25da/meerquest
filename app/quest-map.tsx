import { useEffect, useRef } from 'react';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SymbolView } from 'expo-symbols';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  type TextStyle,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText as Text } from '@/src/components/AppText';
import {
  getQuestMapCategories,
  getQuestMapRegionSummary,
  getQuestMapVisibleStepWindow,
  type QuestMapRegionSummary,
  type QuestMapRegionStep,
  type QuestMapStepStatus,
  type QuestMapVisibleStepWindow,
} from '@/src/content/questMap';
import { questMapBlankStoneSource } from '@/src/content/questMapStoneAssets';
import {
  getQuestMapTheme,
  type QuestMapTheme,
  type QuestMapThemeBackgroundKey,
} from '@/src/content/questMapTheme';
import { quests } from '@/src/content/quests';
import type { Quest } from '@/src/features/quests/questProgress';
import { useQuestProgress } from '@/src/features/quests/useQuestProgress';
import { colors } from '@/src/theme/colors';

const meeroCharacter = require('../assets/images/brand/meero-character.png');
const questMapBackButton = require('../assets/images/quests/buttons/quest-button-back.png');
const questMapBackgroundSources: Record<QuestMapThemeBackgroundKey, number> = {
  'language-hill': require('../assets/images/quest-map/language-hill-empty-ground-v1.png'),
  'math-cave': require('../assets/images/quest-map/math-cave-empty-ground-v1.png'),
  'safety-desert': require('../assets/images/quest-map/safety-desert-empty-ground-v1.png'),
  'social-playground': require('../assets/images/quest-map/social-playground-empty-ground-v1.png'),
};

const visibleStepCount = 20;
const questMapCompactHeight = 1920;
const questMapRegularHeight = 2400;

type QuestMapNodeLayout = {
  left: number;
  rotation: string;
  top: number;
};

type QuestMapImageAnchor = {
  rotation: string;
  sourceX: number;
  sourceY: number;
};

type QuestMapBackgroundDimensions = {
  height: number;
  width: number;
};

const questMapBackgroundDimensions: Record<QuestMapThemeBackgroundKey, QuestMapBackgroundDimensions> = {
  'language-hill': { height: 1820, width: 864 },
  'math-cave': { height: 1821, width: 864 },
  'safety-desert': { height: 1821, width: 864 },
  'social-playground': { height: 1821, width: 864 },
};

const nodeLayouts: readonly QuestMapNodeLayout[] = [
  { left: 0.56, rotation: '-3deg', top: 0.888 },
  { left: 0.49, rotation: '2deg', top: 0.844 },
  { left: 0.44, rotation: '-1deg', top: 0.801 },
  { left: 0.47, rotation: '4deg', top: 0.755 },
  { left: 0.405, rotation: '-2deg', top: 0.705 },
  { left: 0.43, rotation: '3deg', top: 0.664 },
  { left: 0.5, rotation: '-4deg', top: 0.616 },
  { left: 0.56, rotation: '2deg', top: 0.572 },
  { left: 0.61, rotation: '-2deg', top: 0.526 },
  { left: 0.635, rotation: '3deg', top: 0.482 },
  { left: 0.615, rotation: '-4deg', top: 0.433 },
  { left: 0.555, rotation: '2deg', top: 0.391 },
  { left: 0.49, rotation: '-1deg', top: 0.344 },
  { left: 0.43, rotation: '4deg', top: 0.299 },
  { left: 0.39, rotation: '-3deg', top: 0.251 },
  { left: 0.435, rotation: '2deg', top: 0.209 },
  { left: 0.505, rotation: '-2deg', top: 0.164 },
  { left: 0.58, rotation: '3deg', top: 0.123 },
  { left: 0.645, rotation: '-1deg', top: 0.081 },
  { left: 0.62, rotation: '4deg', top: 0.042 },
] as const;

const languageHillPathAnchors: readonly QuestMapImageAnchor[] = [
  { rotation: '-3deg', sourceX: 0.55, sourceY: 0.82308 },
  { rotation: '2deg', sourceX: 0.5, sourceY: 0.78681 },
  { rotation: '-1deg', sourceX: 0.49, sourceY: 0.75055 },
  { rotation: '4deg', sourceX: 0.54, sourceY: 0.71264 },
  { rotation: '-2deg', sourceX: 0.57, sourceY: 0.67088 },
  { rotation: '3deg', sourceX: 0.5, sourceY: 0.63626 },
  { rotation: '-4deg', sourceX: 0.48, sourceY: 0.5967 },
  { rotation: '2deg', sourceX: 0.45, sourceY: 0.55989 },
  { rotation: '-2deg', sourceX: 0.5, sourceY: 0.52143 },
  { rotation: '3deg', sourceX: 0.47, sourceY: 0.48462 },
  { rotation: '-4deg', sourceX: 0.49, sourceY: 0.44396 },
  { rotation: '2deg', sourceX: 0.52, sourceY: 0.40879 },
  { rotation: '-1deg', sourceX: 0.48, sourceY: 0.36978 },
  { rotation: '4deg', sourceX: 0.39, sourceY: 0.33187 },
  { rotation: '-3deg', sourceX: 0.45, sourceY: 0.29231 },
  { rotation: '2deg', sourceX: 0.62, sourceY: 0.25714 },
  { rotation: '-2deg', sourceX: 0.68, sourceY: 0.21923 },
  { rotation: '3deg', sourceX: 0.6, sourceY: 0.18516 },
  { rotation: '-1deg', sourceX: 0.59, sourceY: 0.15 },
  { rotation: '4deg', sourceX: 0.56, sourceY: 0.11758 },
] as const;

const socialPlaygroundPathAnchors: readonly QuestMapImageAnchor[] = [
  { rotation: '-3deg', sourceX: 0.47, sourceY: 0.82308 },
  { rotation: '2deg', sourceX: 0.51, sourceY: 0.78681 },
  { rotation: '-1deg', sourceX: 0.51, sourceY: 0.75055 },
  { rotation: '4deg', sourceX: 0.48, sourceY: 0.71264 },
  { rotation: '-2deg', sourceX: 0.5, sourceY: 0.67088 },
  { rotation: '3deg', sourceX: 0.535, sourceY: 0.63626 },
  { rotation: '-4deg', sourceX: 0.49, sourceY: 0.5967 },
  { rotation: '2deg', sourceX: 0.475, sourceY: 0.55989 },
  { rotation: '-2deg', sourceX: 0.52, sourceY: 0.52143 },
  { rotation: '3deg', sourceX: 0.526, sourceY: 0.48462 },
  { rotation: '-4deg', sourceX: 0.51, sourceY: 0.44396 },
  { rotation: '2deg', sourceX: 0.432, sourceY: 0.40879 },
  { rotation: '-1deg', sourceX: 0.437, sourceY: 0.36978 },
  { rotation: '4deg', sourceX: 0.502, sourceY: 0.33187 },
  { rotation: '-3deg', sourceX: 0.558, sourceY: 0.29231 },
  { rotation: '2deg', sourceX: 0.539, sourceY: 0.25714 },
  { rotation: '-2deg', sourceX: 0.572, sourceY: 0.21923 },
  { rotation: '3deg', sourceX: 0.472, sourceY: 0.18516 },
  { rotation: '-1deg', sourceX: 0.551, sourceY: 0.15 },
  { rotation: '4deg', sourceX: 0.608, sourceY: 0.11758 },
] as const;

export default function QuestMapScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const { height, width } = useWindowDimensions();
  const { categoryId } = useLocalSearchParams<{ categoryId?: string | string[] }>();
  const { isLoaded, profileProgress } = useQuestProgress();
  const selectedCategories = getQuestMapCategories(categoryId);
  const isCompact = width < 760 || height < 520;
  const mapHeight = Math.max(height, isCompact ? questMapCompactHeight : questMapRegularHeight);
  const selectedCategoryKey = selectedCategories.map((category) => category.id).join('|');
  const isFullQuestMap = selectedCategories.length > 1;
  const displayCategories = isFullQuestMap ? [...selectedCategories].reverse() : selectedCategories;
  const mapSections = displayCategories.map((category, sectionIndex) => {
    const mapTheme = getQuestMapTheme(category.id);
    const summary = getQuestMapRegionSummary({
      categoryId: category.id,
      progress: profileProgress,
      quests,
    });
    const visibleWindow = getQuestMapVisibleStepWindow(summary.steps, {
      focusQuestId: summary.currentQuest?.id,
      visibleCount: visibleStepCount,
    });
    const focusedVisibleIndex = Math.max(
      0,
      visibleWindow.steps.findIndex((step) => step.questId === visibleWindow.focusStep?.questId),
    );
    const sectionScrollOffset = sectionIndex * mapHeight;
    const focusedStepScrollOffset = getFocusedStepScrollOffset({
      backgroundKey: mapTheme.backgroundKey,
      canvasWidth: width,
      layoutIndex: focusedVisibleIndex,
      mapHeight,
      viewportHeight: height,
    });
    const progressRatio =
      summary.totalCount > 1
        ? Math.min(1, Math.max(0, visibleWindow.focusIndex / (summary.totalCount - 1)))
        : 0;
    const indicatorTop = `${Math.round(14 + progressRatio * 68)}%` as `${number}%`;

    return {
      category,
      focusedScrollOffset: sectionScrollOffset + focusedStepScrollOffset,
      indicatorTop,
      mapTheme,
      summary,
      visibleWindow,
    };
  });
  const activeSection =
    mapSections.find((section) => section.category.id === selectedCategories[0]?.id) ??
    mapSections[0];
  const totalMapHeight = mapHeight * Math.max(1, mapSections.length);
  const focusedScrollOffset = activeSection?.focusedScrollOffset ?? 0;
  const handleBackPress = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.push('/' as Href);
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      scrollViewRef.current?.scrollTo({ animated: false, y: focusedScrollOffset });
    }, 0);

    return () => clearTimeout(timeout);
  }, [focusedScrollOffset, selectedCategoryKey]);

  return (
    <SafeAreaView
      edges={[]}
      style={[
        styles.safeArea,
        { backgroundColor: activeSection?.mapTheme.safeAreaColor ?? colors.background },
      ]}>
      <StatusBar hidden />
      <View style={styles.screen}>
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={[
            styles.scrollContent,
            { height: totalMapHeight, paddingBottom: Math.max(insets.bottom, 12) + 24 },
          ]}
          showsVerticalScrollIndicator={false}
          style={styles.scrollView}>
          {mapSections.map((section) => (
            <QuestMapRegionCanvas
              canvasHeight={mapHeight}
              canvasWidth={width}
              isLoaded={isLoaded}
              key={section.category.id}
              mapTheme={section.mapTheme}
              onOpenQuest={(quest) => router.push(`/quest-play?questId=${quest.id}` as Href)}
              showEmbeddedHud={isFullQuestMap}
              summary={section.summary}
              visibleWindow={section.visibleWindow}
            />
          ))}
        </ScrollView>

        <View pointerEvents="box-none" style={[styles.backLayer, { top: Math.max(insets.top, 8) }]}>
          <Pressable
            accessibilityLabel="이전 화면"
            accessibilityRole="button"
            onPress={handleBackPress}
            style={({ pressed }) => [
              styles.backButton,
              { transform: [{ scale: pressed ? 0.94 : 1 }] },
            ]}>
            <Image
              accessibilityIgnoresInvertColors
              resizeMode="contain"
              source={questMapBackButton}
              style={styles.backButtonImage}
            />
          </Pressable>
        </View>

        {!isFullQuestMap && activeSection ? (
          <View pointerEvents="box-none" style={[styles.hudLayer, { top: Math.max(insets.top, 8) }]}>
            <QuestMapHud mapTheme={activeSection.mapTheme} summary={activeSection.summary} />
          </View>
        ) : null}

        {!isFullQuestMap && activeSection ? (
          <View pointerEvents="none" style={styles.ropeIndicator}>
            <View style={[styles.ropeLine, { backgroundColor: activeSection.mapTheme.ropeColor }]} />
            <View
              style={[
                styles.ropeKnotTop,
                { backgroundColor: activeSection.mapTheme.ropeKnotColor },
              ]}
            />
            <View
              style={[
                styles.ropeKnotBottom,
                { backgroundColor: activeSection.mapTheme.ropeKnotColor },
              ]}
            />
            <View style={[styles.ropeMeeroMarker, { top: activeSection.indicatorTop }]}>
              <Image
                accessibilityIgnoresInvertColors
                resizeMode="contain"
                source={meeroCharacter}
                style={styles.ropeMeeroImage}
              />
            </View>
          </View>
        ) : null}

      </View>
    </SafeAreaView>
  );
}

function QuestMapRegionCanvas({
  canvasHeight,
  canvasWidth,
  isLoaded,
  mapTheme,
  onOpenQuest,
  showEmbeddedHud,
  summary,
  visibleWindow,
}: {
  canvasHeight: number;
  canvasWidth: number;
  isLoaded: boolean;
  mapTheme: QuestMapTheme;
  onOpenQuest: (quest: Quest) => void;
  showEmbeddedHud: boolean;
  summary: QuestMapRegionSummary;
  visibleWindow: QuestMapVisibleStepWindow;
}) {
  return (
    <View style={[styles.caveCanvas, { height: canvasHeight }]}>
      <Image
        accessibilityIgnoresInvertColors
        resizeMode="cover"
        source={questMapBackgroundSources[mapTheme.backgroundKey]}
        style={[styles.caveTile, { height: canvasHeight, width: canvasWidth }]}
      />
      <View style={[styles.caveVignette, { backgroundColor: mapTheme.vignetteColor }]} />
      <VisibleStepPath
        accessibilityLabel={`${mapTheme.title} 단계 지도`}
        backgroundKey={mapTheme.backgroundKey}
        canvasHeight={canvasHeight}
        canvasWidth={canvasWidth}
        focusQuestId={visibleWindow.focusStep?.questId}
        isLoaded={isLoaded}
        onOpenQuest={onOpenQuest}
        steps={visibleWindow.steps}
      />
      {showEmbeddedHud ? (
        <View pointerEvents="box-none" style={styles.embeddedHudLayer}>
          <QuestMapHud mapTheme={mapTheme} summary={summary} />
        </View>
      ) : null}
    </View>
  );
}

function QuestMapHud({
  mapTheme,
  summary,
}: {
  mapTheme: QuestMapTheme;
  summary: QuestMapRegionSummary;
}) {
  return (
    <View style={styles.topHud}>
      <View style={[styles.guideBadge, { borderColor: mapTheme.accentColor }]}>
        <Image
          accessibilityIgnoresInvertColors
          resizeMode="contain"
          source={meeroCharacter}
          style={styles.guideImage}
        />
      </View>
      <View style={styles.hudCopy}>
        <Text style={[styles.hudEyebrow, { color: mapTheme.hudMutedColor }]}>
          {mapTheme.title}
        </Text>
        <Text style={styles.hudValue}>
          {summary.completedCount} / {summary.totalCount}
        </Text>
      </View>
    </View>
  );
}

function VisibleStepPath({
  accessibilityLabel,
  backgroundKey,
  canvasHeight,
  canvasWidth,
  focusQuestId,
  isLoaded,
  onOpenQuest,
  steps,
}: {
  accessibilityLabel: string;
  backgroundKey: QuestMapThemeBackgroundKey;
  canvasHeight: number;
  canvasWidth: number;
  focusQuestId?: string;
  isLoaded: boolean;
  onOpenQuest: (quest: Quest) => void;
  steps: QuestMapRegionStep[];
}) {
  return (
    <View accessibilityLabel={accessibilityLabel} style={styles.stepPathLayer}>
      {steps.map((step, index) => {
        const nodePosition = getNodePosition({
          backgroundKey,
          canvasHeight,
          canvasWidth,
          index,
        });

        return (
          <QuestCaveStepButton
            isFocused={step.questId === focusQuestId}
            isLoaded={isLoaded}
            key={step.questId}
            onOpenQuest={onOpenQuest}
            rotation={nodePosition.rotation}
            step={step}
            style={{ left: nodePosition.left, top: nodePosition.top }}
          />
        );
      })}
    </View>
  );
}

function QuestCaveStepButton({
  isFocused,
  isLoaded,
  onOpenQuest,
  rotation,
  step,
  style,
}: {
  isFocused: boolean;
  isLoaded: boolean;
  onOpenQuest: (quest: Quest) => void;
  rotation: string;
  step: QuestMapRegionStep;
  style: {
    left: number;
    top: number;
  };
}) {
  const isLocked = step.status === 'locked';
  const isDisabled = !isLoaded || isLocked;
  const isCompleted = step.status === 'completed';
  const isCurrent = step.status === 'current';
  const isPressable = !isDisabled;
  const statusLabel = getStepStatusLabel(step.status);
  const levelText = String(step.quest.level);
  const numberTextStyle = getStoneNumberTextStyle(step.quest.level);

  return (
    <Pressable
      accessibilityLabel={`${step.quest.level}단계 ${step.quest.title}, ${statusLabel}`}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, selected: isFocused }}
      disabled={isDisabled}
      hitSlop={{ bottom: 10, left: 12, right: 12, top: 10 }}
      onPress={() => onOpenQuest(step.quest)}
      style={({ pressed }) => [
        styles.stepButton,
        isFocused && styles.stepButtonFocused,
        isCurrent && styles.stepButtonCurrent,
        style,
        {
          transform: [{ rotate: rotation }, { scale: pressed && !isDisabled ? 0.94 : 1 }],
        },
        isLocked && styles.stepButtonLocked,
      ]}>
      {isPressable ? (
        <View
          pointerEvents="none"
          style={[
            styles.stoneActionGlow,
            isCurrent && styles.stoneActionGlowCurrent,
            isCompleted && styles.stoneActionGlowCompleted,
            isFocused && styles.stoneActionGlowFocused,
          ]}
        />
      ) : null}
      <Image
        accessibilityIgnoresInvertColors
        resizeMode="contain"
        source={questMapBlankStoneSource}
        style={[styles.stepStoneImage, isLocked && styles.stepStoneImageLocked]}
      />
      {isCurrent ? (
        <View
          pointerEvents="box-none"
          style={[styles.currentStepMeero, { transform: [{ rotate: getCounterRotation(rotation) }] }]}>
          <Image
            accessibilityIgnoresInvertColors
            accessible={false}
            resizeMode="contain"
            source={meeroCharacter}
            style={styles.currentStepMeeroImage}
          />
          <View pointerEvents="box-none" style={styles.currentStepGuidePanel}>
            <View pointerEvents="none" style={styles.currentStepSpeechBubble}>
              <Text style={styles.currentStepSpeechLabel}>{levelText}단계 문제</Text>
              <Text style={styles.currentStepSpeechTitle}>{step.quest.title}</Text>
              <View style={styles.currentStepSpeechTail} />
            </View>
            <Pressable
              accessibilityLabel={`${levelText}단계 문제 풀기`}
              accessibilityRole="button"
              onPress={() => onOpenQuest(step.quest)}
              style={({ pressed }) => [
                styles.currentStepPlayButton,
                pressed && styles.currentStepPlayButtonPressed,
              ]}>
              <Text style={styles.currentStepPlayButtonText}>문제 풀기</Text>
            </Pressable>
          </View>
        </View>
      ) : null}
      {isCompleted ? (
        <View pointerEvents="none" style={styles.stoneCompletedStamp}>
          <SymbolView
            fallback={<Text style={styles.stoneCompletedStampText}>★</Text>}
            name="star.fill"
            size={20}
            tintColor="#8F5B12"
            type="hierarchical"
            weight="black"
          />
        </View>
      ) : null}
      <View pointerEvents="none" style={styles.stoneNumberLayer}>
        <Text style={[styles.stoneNumberInsetShadow, numberTextStyle, isLocked && styles.stoneNumberLocked]}>
          {levelText}
        </Text>
        <Text style={[styles.stoneNumberHighlight, numberTextStyle, isLocked && styles.stoneNumberLocked]}>
          {levelText}
        </Text>
        <Text
          style={[
            styles.stoneNumber,
            numberTextStyle,
            isCompleted && styles.stoneNumberCompleted,
            isLocked && styles.stoneNumberLocked,
          ]}>
          {levelText}
        </Text>
      </View>
    </Pressable>
  );
}

function getStepStatusLabel(status: QuestMapStepStatus) {
  if (status === 'completed') {
    return '완료';
  }

  if (status === 'current') {
    return '도전 가능';
  }

  return '잠김';
}

function getStoneNumberTextStyle(level: number): TextStyle {
  const digitCount = String(Math.max(0, Math.floor(Math.abs(level)))).length;
  const fontSize = digitCount <= 1 ? 36 : digitCount === 2 ? 32 : digitCount === 3 ? 28 : 24;

  return {
    fontSize,
    lineHeight: fontSize + 4,
    minWidth: digitCount <= 2 ? 50 : digitCount === 3 ? 68 : 78,
  };
}

function getCounterRotation(rotation: string) {
  return rotation.startsWith('-') ? rotation.slice(1) : `-${rotation}`;
}

function getNodePosition({
  backgroundKey,
  canvasHeight,
  canvasWidth,
  index,
}: {
  backgroundKey: QuestMapThemeBackgroundKey;
  canvasHeight: number;
  canvasWidth: number;
  index: number;
}) {
  if (backgroundKey === 'language-hill') {
    const anchor =
      languageHillPathAnchors[index] ?? languageHillPathAnchors[languageHillPathAnchors.length - 1];

    return getImageAnchoredNodePosition({
      anchor,
      backgroundKey,
      canvasHeight,
      canvasWidth,
    });
  }

  if (backgroundKey === 'social-playground') {
    const anchor =
      socialPlaygroundPathAnchors[index] ??
      socialPlaygroundPathAnchors[socialPlaygroundPathAnchors.length - 1];

    return getImageAnchoredNodePosition({
      anchor,
      backgroundKey,
      canvasHeight,
      canvasWidth,
    });
  }

  const layout = nodeLayouts[index] ?? nodeLayouts[nodeLayouts.length - 1];

  return {
    left: canvasWidth * layout.left,
    rotation: layout.rotation,
    top: canvasHeight * layout.top,
  };
}

function getImageAnchoredNodePosition({
  anchor,
  backgroundKey,
  canvasHeight,
  canvasWidth,
}: {
  anchor: QuestMapImageAnchor;
  backgroundKey: QuestMapThemeBackgroundKey;
  canvasHeight: number;
  canvasWidth: number;
}) {
  const sourceDimensions = questMapBackgroundDimensions[backgroundKey];
  const scale = Math.max(
    canvasWidth / sourceDimensions.width,
    canvasHeight / sourceDimensions.height,
  );
  const renderedWidth = sourceDimensions.width * scale;
  const renderedHeight = sourceDimensions.height * scale;
  const offsetX = (canvasWidth - renderedWidth) / 2;
  const offsetY = (canvasHeight - renderedHeight) / 2;

  return {
    left: offsetX + anchor.sourceX * renderedWidth,
    rotation: anchor.rotation,
    top: offsetY + anchor.sourceY * renderedHeight,
  };
}

function getFocusedStepScrollOffset({
  backgroundKey,
  canvasWidth,
  layoutIndex,
  mapHeight,
  viewportHeight,
}: {
  backgroundKey: QuestMapThemeBackgroundKey;
  canvasWidth: number;
  layoutIndex: number;
  mapHeight: number;
  viewportHeight: number;
}) {
  const nodePosition = getNodePosition({
    backgroundKey,
    canvasHeight: mapHeight,
    canvasWidth,
    index: Math.min(Math.max(layoutIndex, 0), nodeLayouts.length - 1),
  });
  const maxScrollOffset = Math.max(0, mapHeight - viewportHeight);
  const targetOffset = nodePosition.top - viewportHeight * 0.62;

  return Math.min(maxScrollOffset, Math.max(0, targetOffset));
}

const styles = StyleSheet.create({
  backButton: {
    alignItems: 'center',
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  backButtonImage: {
    height: 64,
    width: 64,
  },
  backLayer: {
    left: 16,
    position: 'absolute',
  },
  caveCanvas: {
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
  },
  caveTile: {
    left: 0,
    position: 'absolute',
  },
  caveVignette: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(43, 24, 26, 0.16)',
  },
  currentStepMeero: {
    alignItems: 'flex-end',
    bottom: 8,
    flexDirection: 'row',
    height: 214,
    justifyContent: 'flex-start',
    position: 'absolute',
    right: -392,
    width: 488,
    zIndex: 3,
  },
  currentStepMeeroImage: {
    height: 194,
    marginRight: 12,
    shadowColor: '#3D2417',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    width: 136,
  },
  currentStepGuidePanel: {
    alignItems: 'flex-start',
    alignSelf: 'flex-start',
    gap: 10,
    marginTop: 8,
  },
  currentStepPlayButton: {
    alignItems: 'center',
    backgroundColor: '#68B83E',
    borderColor: colors.white,
    borderRadius: 999,
    borderWidth: 3,
    justifyContent: 'center',
    minHeight: 58,
    minWidth: 156,
    paddingHorizontal: 26,
    paddingVertical: 10,
    shadowColor: '#315719',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.24,
    shadowRadius: 6,
  },
  currentStepPlayButtonPressed: {
    transform: [{ scale: 0.96 }],
  },
  currentStepPlayButtonText: {
    color: colors.white,
    fontSize: 24,
    fontWeight: '900',
    includeFontPadding: false,
    letterSpacing: 0,
    lineHeight: 29,
    textAlign: 'center',
  },
  currentStepSpeechBubble: {
    alignItems: 'flex-start',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 252, 235, 0.96)',
    borderColor: colors.white,
    borderRadius: 20,
    borderWidth: 3,
    justifyContent: 'center',
    maxWidth: 320,
    minHeight: 94,
    paddingHorizontal: 22,
    paddingVertical: 16,
    shadowColor: '#5A351F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
  },
  currentStepSpeechTail: {
    backgroundColor: 'rgba(255, 252, 235, 0.96)',
    borderBottomColor: 'transparent',
    borderLeftColor: colors.white,
    borderLeftWidth: 3,
    borderRightColor: colors.white,
    borderRightWidth: 3,
    bottom: 18,
    height: 18,
    left: -10,
    position: 'absolute',
    transform: [{ rotate: '45deg' }],
    width: 18,
  },
  currentStepSpeechLabel: {
    color: '#7C5524',
    fontSize: 20,
    fontWeight: '900',
    includeFontPadding: false,
    letterSpacing: 0,
    lineHeight: 25,
    marginBottom: 6,
    textAlign: 'left',
  },
  currentStepSpeechTitle: {
    color: '#4E3218',
    flexShrink: 1,
    fontSize: 27,
    fontWeight: '900',
    includeFontPadding: false,
    letterSpacing: 0,
    lineHeight: 33,
    textAlign: 'left',
  },
  embeddedHudLayer: {
    left: 92,
    position: 'absolute',
    right: 74,
    top: 24,
    zIndex: 40,
  },
  guideBadge: {
    alignItems: 'center',
    backgroundColor: '#FFF7DF',
    borderColor: colors.white,
    borderRadius: 999,
    borderWidth: 3,
    height: 64,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    width: 64,
  },
  guideImage: {
    height: 76,
    marginBottom: -7,
    width: 54,
  },
  hudCopy: {
    gap: 0,
  },
  hudEyebrow: {
    color: colors.muted,
    fontSize: 15,
    fontWeight: '900',
  },
  hudLayer: {
    left: 92,
    position: 'absolute',
    right: 74,
  },
  hudValue: {
    color: colors.ink,
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 34,
  },
  ropeIndicator: {
    alignItems: 'center',
    bottom: 20,
    position: 'absolute',
    right: 14,
    top: 116,
    width: 48,
  },
  ropeKnotBottom: {
    backgroundColor: '#B47739',
    borderColor: '#FFE0A3',
    borderRadius: 999,
    borderWidth: 2,
    bottom: 0,
    height: 16,
    position: 'absolute',
    width: 16,
  },
  ropeKnotTop: {
    backgroundColor: '#B47739',
    borderColor: '#FFE0A3',
    borderRadius: 999,
    borderWidth: 2,
    height: 16,
    position: 'absolute',
    top: 0,
    width: 16,
  },
  ropeLine: {
    backgroundColor: '#C88B48',
    borderRadius: 999,
    bottom: 8,
    position: 'absolute',
    top: 8,
    width: 6,
  },
  ropeMeeroImage: {
    height: 52,
    marginBottom: -7,
    width: 38,
  },
  ropeMeeroMarker: {
    alignItems: 'center',
    backgroundColor: '#FFF7DF',
    borderColor: colors.white,
    borderRadius: 999,
    borderWidth: 3,
    height: 48,
    justifyContent: 'flex-end',
    marginTop: -24,
    overflow: 'hidden',
    position: 'absolute',
    width: 48,
  },
  safeArea: {
    backgroundColor: '#4D2B2A',
    flex: 1,
  },
  screen: {
    flex: 1,
  },
  scrollContent: {
    width: '100%',
  },
  scrollView: {
    flex: 1,
  },
  stepButton: {
    alignItems: 'center',
    height: 90,
    justifyContent: 'center',
    marginLeft: -66,
    marginTop: -45,
    position: 'absolute',
    width: 132,
  },
  stepButtonFocused: {
    height: 104,
    marginLeft: -77,
    marginTop: -52,
    width: 154,
  },
  stepButtonCurrent: {
    elevation: 30,
    zIndex: 30,
  },
  stepButtonLocked: {
    opacity: 1,
  },
  stepStoneImage: {
    height: '100%',
    width: '100%',
  },
  stepStoneImageLocked: {
    opacity: 0.56,
  },
  stoneActionGlow: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 250, 223, 0.08)',
    borderRadius: 999,
    height: 62,
    position: 'absolute',
    shadowColor: '#FFF3B0',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.28,
    shadowRadius: 20,
    width: 106,
  },
  stoneActionGlowCurrent: {
    backgroundColor: 'rgba(150, 217, 98, 0.12)',
    shadowColor: '#DBFF9C',
    shadowOpacity: 0.42,
  },
  stoneActionGlowCompleted: {
    backgroundColor: 'rgba(255, 211, 93, 0.16)',
    shadowColor: '#FFE27A',
    shadowOpacity: 0.46,
  },
  stoneActionGlowFocused: {
    height: 72,
    shadowOpacity: 0.48,
    shadowRadius: 22,
    width: 122,
  },
  stoneCompletedStamp: {
    alignItems: 'center',
    backgroundColor: '#FFE08A',
    borderRadius: 999,
    height: 28,
    justifyContent: 'center',
    position: 'absolute',
    right: 18,
    shadowColor: '#7E4B10',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 3,
    top: 9,
    width: 28,
  },
  stoneCompletedStampText: {
    color: '#8F5B12',
    fontSize: 17,
    fontWeight: '900',
    includeFontPadding: false,
    lineHeight: 20,
    textAlign: 'center',
  },
  stoneNumber: {
    color: '#4D524F',
    fontWeight: '900',
    includeFontPadding: false,
    letterSpacing: 0,
    position: 'absolute',
    textAlign: 'center',
    textShadowColor: 'rgba(28, 31, 31, 0.18)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  stoneNumberHighlight: {
    color: 'rgba(255, 255, 255, 0.24)',
    fontWeight: '900',
    includeFontPadding: false,
    letterSpacing: 0,
    position: 'absolute',
    textAlign: 'center',
    transform: [{ translateY: -1 }],
  },
  stoneNumberInsetShadow: {
    color: 'rgba(21, 25, 25, 0.34)',
    fontWeight: '900',
    includeFontPadding: false,
    letterSpacing: 0,
    position: 'absolute',
    textAlign: 'center',
    transform: [{ translateY: 2 }],
  },
  stoneNumberCompleted: {
    color: '#72551C',
    textShadowColor: 'rgba(255, 232, 150, 0.38)',
    textShadowRadius: 2,
  },
  stoneNumberLocked: {
    color: '#7A817D',
    opacity: 0.52,
    textShadowRadius: 0,
  },
  stoneNumberLayer: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 8,
  },
  stepPathLayer: {
    ...StyleSheet.absoluteFill,
  },
  topHud: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 253, 247, 0.92)',
    borderColor: colors.white,
    borderRadius: 8,
    borderWidth: 3,
    flexDirection: 'row',
    gap: 10,
    minHeight: 76,
    paddingHorizontal: 10,
    paddingVertical: 7,
    shadowColor: '#5A351F',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
  },
});
