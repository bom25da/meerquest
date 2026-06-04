import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MeerkatMascot } from '@/src/components/MeerkatMascot';
import { colors } from '@/src/theme/colors';

export default function QuestPlayScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <MeerkatMascot mood="thinking" />
        <View style={styles.panel}>
          <Text style={styles.eyebrow}>수학 동굴 2단계</Text>
          <Text style={styles.title}>동그라미를 찾아요</Text>
          <Text style={styles.prompt}>미어캣이 같이 고민하고 있어요. 둥근 모양을 골라볼까요?</Text>
          <View style={styles.choiceGrid}>
            <View style={[styles.choice, styles.circleChoice]} />
            <View style={[styles.choice, styles.squareChoice]} />
            <View style={[styles.choice, styles.triangleChoice]} />
          </View>
          <Link href="/reward" style={styles.primaryLink}>
            정답으로 이어가기
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
    gap: 22,
    justifyContent: 'center',
    padding: 20,
  },
  panel: {
    backgroundColor: colors.surface,
    borderColor: colors.white,
    borderRadius: 8,
    borderWidth: 4,
    gap: 14,
    maxWidth: 640,
    padding: 20,
    width: '100%',
  },
  eyebrow: {
    color: colors.sky,
    fontSize: 16,
    fontWeight: '900',
  },
  title: {
    color: colors.ink,
    fontSize: 30,
    fontWeight: '900',
  },
  prompt: {
    color: colors.muted,
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 25,
  },
  choiceGrid: {
    flexDirection: 'row',
    gap: 14,
    justifyContent: 'center',
    paddingVertical: 10,
  },
  choice: {
    borderColor: colors.ink,
    borderWidth: 4,
    height: 86,
    width: 86,
  },
  circleChoice: {
    backgroundColor: colors.greenSoft,
    borderRadius: 43,
  },
  squareChoice: {
    backgroundColor: colors.orangeSoft,
    borderRadius: 8,
  },
  triangleChoice: {
    backgroundColor: colors.skySoft,
    borderRadius: 8,
    transform: [{ rotate: '45deg' }],
  },
  primaryLink: {
    alignSelf: 'center',
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
