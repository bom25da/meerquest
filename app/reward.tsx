import { Link, type Href, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText as Text } from '@/src/components/AppText';
import { MeerkatMascot } from '@/src/components/MeerkatMascot';
import { quests } from '@/src/content/quests';
import { getNextQuestAfterReward } from '@/src/features/quests/questRewardNavigation';
import { useQuestProgress } from '@/src/features/quests/useQuestProgress';
import { colors } from '@/src/theme/colors';

export default function RewardScreen() {
  const { questId } = useLocalSearchParams<{ questId?: string }>();
  const { profileProgress } = useQuestProgress();
  const quest = quests.find((item) => item.id === questId) ?? quests[0];
  const nextQuest = getNextQuestAfterReward({
    completedQuestId: quest.id,
    quests,
    progress: profileProgress,
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <MeerkatMascot mood="celebrate" />
        <Text style={styles.title}>탐험 성공!</Text>
        <Text style={styles.subtitle}>{quest.title} 퀘스트를 완료했어요.</Text>
        <Text style={styles.nextQuestHint}>
          {nextQuest ? `다음 탐험: ${nextQuest.title}` : '오늘 열린 퀘스트를 모두 완료했어요.'}
        </Text>
        <View style={styles.rewardBadge}>
          <Text style={styles.rewardIcon}>
            {quest.reward.type === 'badge' ? '🏆' : quest.reward.type === 'sticker' ? '🌟' : '★'}
          </Text>
          <Text style={styles.rewardText}>{quest.reward.title}</Text>
        </View>
        <View style={styles.linkRow}>
          {nextQuest ? (
            <Link
              accessibilityLabel={`${nextQuest.title} 다음 퀘스트 시작하기`}
              accessibilityRole="button"
              href={`/quest-play?questId=${nextQuest.id}` as Href}
              style={styles.primaryLink}>
              다음 퀘스트
            </Link>
          ) : null}
          <Link
            accessibilityLabel="퀘스트맵으로 이동하기"
            accessibilityRole="button"
            href="/quest-map"
            style={nextQuest ? styles.secondaryLink : styles.primaryLink}>
            퀘스트맵
          </Link>
          <Link
            accessibilityLabel="홈으로 이동하기"
            accessibilityRole="button"
            href="/"
            style={styles.tertiaryLink}>
            홈으로 가기
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  container: {
    alignItems: 'center',
    flex: 1,
    gap: 16,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    color: colors.ink,
    fontSize: 38,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.muted,
    fontSize: 18,
    fontWeight: '700',
  },
  nextQuestHint: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: '900',
    textAlign: 'center',
  },
  rewardBadge: {
    alignItems: 'center',
    backgroundColor: colors.yellow,
    borderColor: colors.white,
    borderRadius: 8,
    borderWidth: 4,
    gap: 4,
    minHeight: 104,
    paddingHorizontal: 18,
    paddingVertical: 12,
    justifyContent: 'center',
    minWidth: 170,
  },
  rewardIcon: {
    color: colors.ink,
    fontSize: 30,
    fontWeight: '900',
  },
  rewardText: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
  },
  linkRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    marginTop: 8,
  },
  primaryLink: {
    backgroundColor: colors.orange,
    borderRadius: 8,
    color: colors.white,
    fontSize: 17,
    fontWeight: '900',
    minWidth: 128,
    overflow: 'hidden',
    paddingHorizontal: 18,
    paddingVertical: 13,
    textAlign: 'center',
  },
  secondaryLink: {
    backgroundColor: colors.green,
    borderRadius: 8,
    color: colors.white,
    fontSize: 17,
    fontWeight: '900',
    minWidth: 112,
    overflow: 'hidden',
    paddingHorizontal: 18,
    paddingVertical: 13,
    textAlign: 'center',
  },
  tertiaryLink: {
    backgroundColor: colors.sky,
    borderRadius: 8,
    color: colors.white,
    fontSize: 17,
    fontWeight: '900',
    minWidth: 112,
    overflow: 'hidden',
    paddingHorizontal: 18,
    paddingVertical: 13,
    textAlign: 'center',
  },
});
