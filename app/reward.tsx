import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MeerkatMascot } from '@/src/components/MeerkatMascot';
import { colors } from '@/src/theme/colors';

export default function RewardScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <MeerkatMascot mood="celebrate" />
        <Text style={styles.title}>탐험 성공!</Text>
        <Text style={styles.subtitle}>별 스티커를 하나 얻었어요.</Text>
        <View style={styles.rewardBadge}>
          <Text style={styles.rewardText}>STAR</Text>
        </View>
        <Link href="/" style={styles.primaryLink}>
          홈으로 가기
        </Link>
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
    height: 82,
    justifyContent: 'center',
    width: 136,
  },
  rewardText: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: '900',
  },
  primaryLink: {
    backgroundColor: colors.orange,
    borderRadius: 8,
    color: colors.white,
    fontSize: 17,
    fontWeight: '900',
    marginTop: 8,
    overflow: 'hidden',
    paddingHorizontal: 18,
    paddingVertical: 13,
  },
});
