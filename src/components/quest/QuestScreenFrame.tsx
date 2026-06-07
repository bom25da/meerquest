import type { ReactNode } from 'react';
import {
  ImageBackground,
  Image,
  Pressable,
  StyleSheet,
  type ImageSourcePropType,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText as Text } from '@/src/components/AppText';
import {
  getQuestStageFillLayout,
  getQuestStageRect,
  type QuestStageFillLayout,
  type QuestStageSourceRect,
} from '@/src/content/questStageLayout';
import {
  questBottomButtonRects,
  questFrameSafeAreaEdges,
  questTopButtonRects,
  questTopHudRects,
  questTopTitleRect,
} from './questFrameLayout';

const questBackButton = require('../../../assets/images/quests/buttons/quest-button-back.png');
const questTitlePlaque = require('../../../assets/images/quests/ui/quest-title-plaque.png');
const questSoundButton = require('../../../assets/images/quests/buttons/quest-button-speaker.png');
const questHomeButton = require('../../../assets/images/quests/buttons/quest-button-home.png');
const questPreviousButton = require('../../../assets/images/quests/buttons/quest-button-previous.png');
const questNextButton = require('../../../assets/images/quests/buttons/quest-button-next.png');
const questRewardButton = require('../../../assets/images/quests/buttons/quest-button-star.png');

interface QuestScreenFrameProps {
  backgroundSource: ImageSourcePropType;
  children: (layout: QuestStageFillLayout) => ReactNode;
  height: number;
  onBack: () => void;
  onHome: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onReward: () => void;
  onSound?: () => void;
  questTitle: string;
  stars: number;
  width: number;
}

export function QuestScreenFrame({
  backgroundSource,
  children,
  height,
  onBack,
  onHome,
  onNext,
  onPrevious,
  onReward,
  onSound,
  questTitle,
  stars,
  width,
}: QuestScreenFrameProps) {
  const layout = getQuestStageFillLayout({ height, width });

  return (
    <SafeAreaView edges={questFrameSafeAreaEdges} style={styles.safeArea}>
      <View style={styles.screen}>
        <ImageBackground
          accessibilityLabel="퀘스트 배경"
          resizeMode="stretch"
          source={backgroundSource}
          style={[styles.stage, { height: layout.stageHeight, width: layout.stageWidth }]}>
          {children(layout)}
          <QuestTopHud
            layout={layout}
            onBack={onBack}
            onSound={onSound}
            questTitle={questTitle}
            stars={stars}
          />
          <QuestBottomNavigation
            layout={layout}
            onHome={onHome}
            onNext={onNext}
            onPrevious={onPrevious}
            onReward={onReward}
          />
        </ImageBackground>
      </View>
    </SafeAreaView>
  );
}

function QuestTopHud({
  layout,
  onBack,
  onSound,
  questTitle,
  stars,
}: {
  layout: QuestStageFillLayout;
  onBack: () => void;
  onSound?: () => void;
  questTitle: string;
  stars: number;
}) {
  return (
    <>
      <Pressable
        accessibilityLabel="이전 화면"
        accessibilityRole="button"
        onPress={onBack}
        style={[styles.assetButton, getQuestStageRect(layout, questTopButtonRects.back)]}>
        <Image resizeMode="contain" source={questBackButton} style={styles.assetImage} />
      </Pressable>
      <View
        accessibilityLabel={questTitle}
        style={[styles.titleHud, getQuestStageRect(layout, questTopTitleRect)]}>
        <Image resizeMode="stretch" source={questTitlePlaque} style={styles.assetImage} />
        <View style={styles.questTitleTextBox}>
          <Text
            adjustsFontSizeToFit
            numberOfLines={1}
            style={[styles.questTitleText, { fontSize: 29 * layout.scaleY }]}>
            {questTitle}
          </Text>
        </View>
      </View>
      <QuestScoreHud layout={layout} stars={stars} />
      <Pressable
        accessibilityLabel="소리"
        accessibilityRole="button"
        onPress={onSound}
        style={[styles.assetButton, getQuestStageRect(layout, questTopButtonRects.sound)]}>
        <Image resizeMode="contain" source={questSoundButton} style={styles.assetImage} />
      </Pressable>
    </>
  );
}

function QuestScoreHud({ layout, stars }: { layout: QuestStageFillLayout; stars: number }) {
  return (
    <View
      accessibilityLabel={`별 ${stars}개`}
      style={[styles.scoreHud, getQuestStageRect(layout, questTopHudRects.score)]}>
      <Text
        adjustsFontSizeToFit
        numberOfLines={1}
        style={[styles.scoreStar, { fontSize: 34 * layout.scaleY, lineHeight: 38 * layout.scaleY }]}>
        ★
      </Text>
      <Text
        adjustsFontSizeToFit
        numberOfLines={1}
        style={[styles.scoreValue, { fontSize: 30 * layout.scaleY, lineHeight: 36 * layout.scaleY }]}>
        {stars}
      </Text>
    </View>
  );
}

function QuestBottomNavigation({
  layout,
  onHome,
  onNext,
  onPrevious,
  onReward,
}: {
  layout: QuestStageFillLayout;
  onHome: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onReward: () => void;
}) {
  return (
    <>
      <QuestNavButton
        accessibilityLabel="홈"
        imageSource={questHomeButton}
        layout={layout}
        onPress={onHome}
        rect={questBottomButtonRects.home}
      />
      <QuestNavButton
        accessibilityLabel="이전"
        imageSource={questPreviousButton}
        layout={layout}
        onPress={onPrevious}
        rect={questBottomButtonRects.previous}
      />
      <QuestNavButton
        accessibilityLabel="다음"
        imageSource={questNextButton}
        layout={layout}
        onPress={onNext}
        rect={questBottomButtonRects.next}
      />
      <QuestNavButton
        accessibilityLabel="별 보상"
        imageSource={questRewardButton}
        layout={layout}
        onPress={onReward}
        rect={questBottomButtonRects.reward}
      />
    </>
  );
}

function QuestNavButton({
  accessibilityLabel,
  imageSource,
  layout,
  onPress,
  rect,
}: {
  accessibilityLabel: string;
  imageSource: ImageSourcePropType;
  layout: QuestStageFillLayout;
  onPress: () => void;
  rect: QuestStageSourceRect;
}) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.assetButton, getQuestStageRect(layout, rect)]}>
      <Image resizeMode="contain" source={imageSource} style={styles.assetImage} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  assetButton: {
    position: 'absolute',
  },
  assetImage: {
    height: '100%',
    width: '100%',
  },
  questTitleText: {
    color: '#4A2A12',
    fontWeight: '900',
    letterSpacing: 0,
    textAlign: 'center',
    textShadowColor: 'rgba(255, 255, 255, 0.85)',
    textShadowOffset: { height: 1, width: 0 },
    textShadowRadius: 2,
  },
  questTitleTextBox: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    left: 42,
    position: 'absolute',
    right: 42,
    top: 0,
  },
  safeArea: {
    backgroundColor: '#7FC8E8',
    flex: 1,
  },
  screen: {
    alignItems: 'center',
    backgroundColor: '#7FC8E8',
    flex: 1,
    justifyContent: 'center',
  },
  stage: {
    position: 'relative',
  },
  scoreHud: {
    alignItems: 'center',
    backgroundColor: '#FFFEFA',
    borderColor: 'rgba(255, 255, 255, 0.96)',
    borderRadius: 30,
    borderWidth: 3,
    elevation: 5,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    paddingHorizontal: 10,
    position: 'absolute',
    shadowColor: '#8E5A1F',
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 7,
  },
  scoreStar: {
    color: '#FFD233',
    textAlign: 'center',
    textShadowColor: '#D4911C',
    textShadowOffset: { height: 2, width: 0 },
    textShadowRadius: 1,
  },
  scoreValue: {
    color: '#4A2A12',
    textAlign: 'center',
    textShadowColor: 'rgba(255, 255, 255, 0.85)',
    textShadowOffset: { height: 1, width: 0 },
    textShadowRadius: 1,
  },
  titleHud: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
  },
});
