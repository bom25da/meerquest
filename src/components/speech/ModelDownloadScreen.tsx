import { ImageBackground, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText as Text } from '@/src/components/AppText';
import type { TtsBootstrapPhase } from '@/src/features/speech/TTSBootstrapGate';
import { colors } from '@/src/theme/colors';

interface ModelDownloadScreenProps {
  message: string;
  onRetry?: () => void;
  percent: number;
  phase: TtsBootstrapPhase;
}

const speakingReadyBackground = require('../../../assets/images/speech/meero-speaking-ready-background-v1.png');

const phaseStatusLabel: Record<TtsBootstrapPhase, string> = {
  checking: '목소리 확인',
  downloading: '목소리 준비',
  verifying: '보물 확인',
  preparing: '말 준비',
  ready: '준비 완료',
  failed: '다시 준비',
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
      <ImageBackground
        accessibilityIgnoresInvertColors
        resizeMode="cover"
        source={speakingReadyBackground}
        style={styles.background}
        imageStyle={styles.backgroundImage}>
        <View style={styles.scrim} />
        <View
          style={[
            styles.status,
            isCompact && styles.compactStatus,
            isNarrow && styles.narrowStatus,
          ]}>
          <View style={styles.phaseBadge}>
            <Text style={styles.phaseBadgeText}>
              {phaseStatusLabel[phase]}
            </Text>
          </View>

          <Text
            accessibilityLiveRegion="polite"
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
              <Text style={styles.retryText}>
                다시 준비하기
              </Text>
            </Pressable>
          ) : null}
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#D98F2F',
    flex: 1,
  },
  background: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 44,
    paddingVertical: 32,
  },
  backgroundImage: {
    transform: [{ scale: 1.01 }],
  },
  scrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(62, 35, 16, 0.08)',
  },
  phaseBadge: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#FFF2C9',
    borderColor: '#F7B94E',
    borderRadius: 999,
    borderWidth: 3,
    justifyContent: 'center',
    minHeight: 42,
    minWidth: 150,
    paddingHorizontal: 18,
    paddingVertical: 7,
  },
  phaseBadgeText: {
    color: '#8A4C18',
    flexShrink: 1,
    fontSize: 18,
    fontWeight: '900',
    includeFontPadding: false,
    letterSpacing: 0,
    lineHeight: 22,
    textAlign: 'center',
    width: '100%',
  },
  status: {
    alignItems: 'center',
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(255, 249, 231, 0.94)',
    borderColor: '#FFFFFF',
    borderRadius: 28,
    borderWidth: 4,
    gap: 16,
    maxWidth: 480,
    minWidth: 360,
    paddingHorizontal: 30,
    paddingVertical: 26,
    shadowColor: '#5B351A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
  },
  compactStatus: {
    gap: 10,
    maxWidth: 410,
    minWidth: 320,
    paddingHorizontal: 22,
    paddingVertical: 18,
  },
  narrowStatus: {
    alignSelf: 'center',
    maxWidth: 420,
    minWidth: 0,
    width: '100%',
  },
  message: {
    color: '#4E3218',
    flexShrink: 1,
    fontSize: 30,
    fontWeight: '900',
    includeFontPadding: false,
    letterSpacing: 0,
    lineHeight: 37,
    textAlign: 'center',
    width: '100%',
  },
  compactMessage: {
    fontSize: 24,
    lineHeight: 31,
  },
  progressWrap: {
    alignItems: 'center',
    gap: 8,
    width: '100%',
  },
  progressTrack: {
    backgroundColor: '#FFE9AC',
    borderColor: '#7B4A1B',
    borderRadius: 999,
    borderWidth: 3,
    height: 32,
    overflow: 'hidden',
    width: '100%',
  },
  progressFill: {
    backgroundColor: '#58BFC7',
    borderRadius: 999,
    height: '100%',
  },
  percentText: {
    color: '#7C5524',
    flexShrink: 1,
    fontSize: 18,
    fontWeight: '900',
    includeFontPadding: false,
    lineHeight: 23,
    minHeight: 24,
    textAlign: 'center',
    width: '100%',
  },
  retryButton: {
    alignItems: 'center',
    backgroundColor: colors.orange,
    borderColor: '#FFFFFF',
    borderRadius: 999,
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
    color: '#4E3218',
    flexShrink: 1,
    fontSize: 18,
    fontWeight: '900',
    includeFontPadding: false,
    lineHeight: 23,
    textAlign: 'center',
    width: '100%',
  },
});
