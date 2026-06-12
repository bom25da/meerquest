import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText as Text } from '@/src/components/AppText';
import { MeerkatMascot, type MascotMood } from '@/src/components/MeerkatMascot';
import type { TtsBootstrapPhase } from '@/src/features/speech/TTSBootstrapGate';
import { colors } from '@/src/theme/colors';

interface ModelDownloadScreenProps {
  message: string;
  onRetry?: () => void;
  percent: number;
  phase: TtsBootstrapPhase;
}

const phaseMascotMood: Record<TtsBootstrapPhase, MascotMood> = {
  checking: 'thinking',
  downloading: 'greeting',
  verifying: 'hint',
  preparing: 'thinking',
  ready: 'celebrate',
  failed: 'hint',
};

const phaseMascotLabel: Record<TtsBootstrapPhase, string> = {
  checking: '살펴보자',
  downloading: '슝슝!',
  verifying: '꼼꼼히',
  preparing: '말 준비!',
  ready: '준비됐어!',
  failed: '다시!',
};

export function ModelDownloadScreen({
  message,
  onRetry,
  percent,
  phase,
}: ModelDownloadScreenProps) {
  const { height, width } = useWindowDimensions();
  const isCompact = height < 430 || width < 700;
  const isNarrow = width < 560 && height >= 430;
  const safePercent = Math.max(0, Math.min(100, Math.round(percent)));

  return (
    <SafeAreaView style={styles.safeArea}>
      <View
        style={[
          styles.screen,
          isCompact && styles.compactScreen,
          isNarrow && styles.narrowScreen,
        ]}>
        <MeerkatMascot mood={phaseMascotMood[phase]} label={phaseMascotLabel[phase]} />

        <View
          style={[
            styles.status,
            isCompact && styles.compactStatus,
            isNarrow && styles.narrowStatus,
          ]}>
          <Text
            accessibilityLiveRegion="polite"
            adjustsFontSizeToFit
            numberOfLines={2}
            style={[styles.message, isCompact && styles.compactMessage]}>
            {message}
          </Text>

          <View
            accessible
            accessibilityLabel={`준비 ${safePercent}퍼센트`}
            accessibilityRole="progressbar"
            accessibilityValue={{ max: 100, min: 0, now: safePercent }}
            style={styles.progressWrap}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${safePercent}%` }]} />
            </View>
            <Text
              adjustsFontSizeToFit
              numberOfLines={1}
              style={styles.percentText}>
              {safePercent}%
            </Text>
          </View>

          {onRetry ? (
            <Pressable
              accessibilityLabel="목소리 보물 다시 준비하기"
              accessibilityRole="button"
              onPress={onRetry}
              style={({ pressed }) => [styles.retryButton, pressed && styles.retryButtonPressed]}>
              <Text adjustsFontSizeToFit numberOfLines={1} style={styles.retryText}>
                다시 준비하기
              </Text>
            </Pressable>
          ) : null}
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
  screen: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 30,
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 18,
  },
  compactScreen: {
    gap: 18,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  narrowScreen: {
    flexDirection: 'column',
  },
  status: {
    alignItems: 'center',
    gap: 18,
    maxWidth: 420,
    minWidth: 320,
  },
  compactStatus: {
    gap: 12,
    maxWidth: 360,
    minWidth: 280,
  },
  narrowStatus: {
    maxWidth: 420,
    minWidth: 0,
    width: '100%',
  },
  message: {
    color: colors.ink,
    fontSize: 26,
    fontWeight: '900',
    lineHeight: 34,
    textAlign: 'center',
  },
  compactMessage: {
    fontSize: 22,
    lineHeight: 29,
  },
  progressWrap: {
    alignItems: 'center',
    gap: 8,
    width: '100%',
  },
  progressTrack: {
    backgroundColor: colors.surface,
    borderColor: colors.ink,
    borderRadius: 8,
    borderWidth: 3,
    height: 30,
    overflow: 'hidden',
    width: '100%',
  },
  progressFill: {
    backgroundColor: colors.sky,
    height: '100%',
  },
  percentText: {
    color: colors.muted,
    fontSize: 18,
    fontWeight: '900',
    minHeight: 24,
    textAlign: 'center',
  },
  retryButton: {
    alignItems: 'center',
    backgroundColor: colors.orange,
    borderColor: colors.ink,
    borderRadius: 8,
    borderWidth: 3,
    justifyContent: 'center',
    minHeight: 54,
    minWidth: 170,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  retryButtonPressed: {
    transform: [{ scale: 0.97 }],
  },
  retryText: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
  },
});
