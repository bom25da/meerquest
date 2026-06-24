import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText as Text } from '@/src/components/AppText';
import { quests } from '@/src/content/quests';
import { getNextQuestAfterReward } from '@/src/features/quests/questRewardNavigation';
import { useQuestProgress } from '@/src/features/quests/useQuestProgress';
import { colors } from '@/src/theme/colors';

const successBackground = require('../assets/images/reward/exploration-success-background-tablet-v1.png');
const nextQuestIcon = require('../assets/images/quests/buttons/quest-button-next.png');
const questMapIcon = require('../assets/images/quests/buttons/quest-button-map-v1.png');
const homeIcon = require('../assets/images/quests/buttons/quest-button-home.png');

export default function RewardScreen() {
  const { questId } = useLocalSearchParams<{ questId?: string }>();
  const router = useRouter();
  const { completeQuest, isLoaded, profileProgress } = useQuestProgress();
  const completionRecordedQuestIdRef = useRef<string | null>(null);
  const quest = quests.find((item) => item.id === questId) ?? quests[0];
  const nextQuest = getNextQuestAfterReward({
    completedQuestId: quest.id,
    quests,
    progress: profileProgress,
  });

  useEffect(() => {
    if (!isLoaded || completionRecordedQuestIdRef.current === quest.id) {
      return;
    }

    completionRecordedQuestIdRef.current = quest.id;
    void completeQuest(quest.id);
  }, [completeQuest, isLoaded, quest.id]);

  return (
    <View style={styles.screen}>
      <Image
        accessibilityIgnoresInvertColors
        resizeMode="cover"
        source={successBackground}
        style={styles.backgroundImage}
      />
      <View pointerEvents="none" style={styles.scrimOverlay} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.contentFrame}>
          <View style={styles.content}>
            <View style={styles.copyPanel}>
              <Text accessibilityRole="header" style={styles.kicker}>
                미어퀘스트
              </Text>
              <Text style={styles.title}>탐험 성공!</Text>
              <Text style={styles.subtitle}>{quest.title} 퀘스트를 완료했어요.</Text>
              <Text style={styles.nextQuestHint}>
                {nextQuest ? `다음 탐험: ${nextQuest.title}` : '오늘 열린 퀘스트를 모두 완료했어요.'}
              </Text>
            </View>
          </View>

          <View style={styles.linkRow}>
            <Pressable
              accessibilityLabel="홈으로 이동하기"
              accessibilityRole="button"
              onPress={() => router.push('/')}
              style={({ pressed }) => [styles.iconOnlyButton, pressed && styles.buttonPressed]}>
              <Image
                accessibilityIgnoresInvertColors
                resizeMode="contain"
                source={homeIcon}
                style={styles.homeIcon}
              />
            </Pressable>
            <Pressable
              accessibilityLabel="퀘스트맵으로 이동하기"
              accessibilityRole="button"
              onPress={() => router.push('/quest-map')}
              style={({ pressed }) => [styles.iconOnlyButton, pressed && styles.buttonPressed]}>
              <Image
                accessibilityIgnoresInvertColors
                resizeMode="contain"
                source={questMapIcon}
                style={styles.questMapIcon}
              />
            </Pressable>
            {nextQuest ? (
              <Pressable
                accessibilityLabel={`${nextQuest.title} 다음 퀘스트 시작하기`}
                accessibilityRole="button"
                onPress={() => router.push(`/quest-play?questId=${nextQuest.id}` as Href)}
                style={({ pressed }) => [styles.iconOnlyButton, pressed && styles.buttonPressed]}>
                <Image
                  accessibilityIgnoresInvertColors
                  resizeMode="contain"
                  source={nextQuestIcon}
                  style={styles.nextQuestIcon}
                />
              </Pressable>
            ) : null}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.ink,
    flex: 1,
    overflow: 'hidden',
  },
  backgroundImage: {
    bottom: 0,
    height: '100%',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    width: '100%',
  },
  scrimOverlay: {
    backgroundColor: 'rgba(63, 45, 36, 0.08)',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  safeArea: {
    flex: 1,
  },
  contentFrame: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: 26,
    paddingHorizontal: 38,
    paddingTop: 22,
  },
  content: {
    alignItems: 'flex-start',
    flex: 1,
    justifyContent: 'center',
    maxWidth: 670,
  },
  copyPanel: {
    backgroundColor: 'rgba(255, 253, 247, 0.9)',
    borderColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 8,
    borderWidth: 4,
    paddingHorizontal: 28,
    paddingVertical: 22,
    shadowColor: colors.ink,
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
  },
  kicker: {
    color: colors.orange,
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 2,
  },
  title: {
    color: colors.ink,
    fontSize: 54,
    fontWeight: '900',
    lineHeight: 66,
  },
  subtitle: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
    marginTop: 4,
  },
  nextQuestHint: {
    color: colors.muted,
    fontSize: 21,
    fontWeight: '900',
    lineHeight: 29,
    marginTop: 10,
  },
  linkRow: {
    alignItems: 'center',
    alignSelf: 'flex-end',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 18,
    justifyContent: 'flex-end',
  },
  buttonPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }],
  },
  iconOnlyButton: {
    alignItems: 'center',
    borderRadius: 8,
    height: 118,
    justifyContent: 'center',
    width: 118,
  },
  nextQuestIcon: {
    height: 98,
    width: 98,
  },
  questMapIcon: {
    height: 102,
    width: 102,
  },
  homeIcon: {
    height: 102,
    width: 102,
  },
});
