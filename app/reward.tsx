import { Link, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText as Text } from '@/src/components/AppText';
import { MeerkatMascot } from '@/src/components/MeerkatMascot';
import { quests } from '@/src/content/quests';
import { colors } from '@/src/theme/colors';

export default function RewardScreen() {
  const { questId } = useLocalSearchParams<{ questId?: string }>();
  const quest = quests.find((item) => item.id === questId) ?? quests[0];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <MeerkatMascot mood="celebrate" />
        <Text style={styles.title}>탐험 성공!</Text>
        <Text style={styles.subtitle}>{quest.title} 퀘스트를 완료했어요.</Text>
        <View style={styles.rewardBadge}>
          <Text style={styles.rewardIcon}>
            {quest.reward.type === 'badge' ? '🏆' : quest.reward.type === 'sticker' ? '🌟' : '★'}
          </Text>
          <Text style={styles.rewardText}>{quest.reward.title}</Text>
        </View>
        <View style={styles.linkRow}>
          <Link href="/quest-map" style={styles.secondaryLink}>
            퀘스트맵
          </Link>
          <Link href="/" style={styles.primaryLink}>
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
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  primaryLink: {
    backgroundColor: colors.orange,
    borderRadius: 8,
    color: colors.white,
    fontSize: 17,
    fontWeight: '900',
    overflow: 'hidden',
    paddingHorizontal: 18,
    paddingVertical: 13,
  },
  secondaryLink: {
    backgroundColor: colors.green,
    borderRadius: 8,
    color: colors.white,
    fontSize: 17,
    fontWeight: '900',
    overflow: 'hidden',
    paddingHorizontal: 18,
    paddingVertical: 13,
  },
});
