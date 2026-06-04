import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/src/theme/colors';

export type MascotMood = 'greeting' | 'idle' | 'hint' | 'thinking' | 'clap' | 'celebrate';

interface MeerkatMascotProps {
  mood?: MascotMood;
  label?: string;
}

const moodLabel: Record<MascotMood, string> = {
  greeting: '빼꼼!',
  idle: '살펴보자',
  hint: '힌트!',
  thinking: '같이 생각해보자',
  clap: '잘했어!',
  celebrate: '탐험 성공!',
};

export function MeerkatMascot({ mood = 'greeting', label = moodLabel[mood] }: MeerkatMascotProps) {
  const isThinking = mood === 'thinking';
  const isCelebrate = mood === 'celebrate';

  return (
    <View style={[styles.stage, isCelebrate && styles.stageCelebrate]}>
      <View style={[styles.burrow, mood === 'hint' && styles.burrowOpen]} />
      <View style={[styles.tail, isCelebrate && styles.tailCelebrate]} />
      <View style={[styles.body, isCelebrate && styles.bodyCelebrate]}>
        <View style={styles.earLeft} />
        <View style={styles.earRight} />
        <View style={styles.face}>
          <View style={[styles.eyePatch, styles.eyePatchLeft, isThinking && styles.tiredPatch]}>
            <View style={styles.eye} />
          </View>
          <View style={[styles.eyePatch, styles.eyePatchRight, isThinking && styles.tiredPatch]}>
            <View style={styles.eye} />
          </View>
          <View style={styles.nose} />
          <View style={styles.smile} />
        </View>
        <View style={[styles.armLeft, mood === 'clap' && styles.armClapLeft]} />
        <View style={[styles.armRight, mood === 'clap' && styles.armClapRight]} />
      </View>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.skySoft,
    borderColor: colors.white,
    borderRadius: 28,
    borderWidth: 4,
    height: 220,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    width: 220,
  },
  stageCelebrate: {
    backgroundColor: colors.greenSoft,
  },
  burrow: {
    backgroundColor: colors.burrow,
    borderRadius: 80,
    bottom: 34,
    height: 44,
    position: 'absolute',
    width: 154,
  },
  burrowOpen: {
    height: 52,
    width: 172,
  },
  tail: {
    backgroundColor: colors.sand,
    borderColor: colors.ink,
    borderRadius: 22,
    borderWidth: 3,
    bottom: 82,
    height: 20,
    left: 50,
    position: 'absolute',
    transform: [{ rotate: '-25deg' }],
    width: 78,
  },
  tailCelebrate: {
    transform: [{ rotate: '-42deg' }],
  },
  body: {
    alignItems: 'center',
    backgroundColor: '#C89156',
    borderColor: colors.ink,
    borderRadius: 56,
    borderWidth: 4,
    height: 118,
    justifyContent: 'center',
    marginBottom: 44,
    width: 106,
  },
  bodyCelebrate: {
    marginBottom: 58,
  },
  earLeft: {
    backgroundColor: '#805236',
    borderColor: colors.ink,
    borderRadius: 18,
    borderWidth: 3,
    height: 32,
    left: -10,
    position: 'absolute',
    top: 22,
    width: 32,
  },
  earRight: {
    backgroundColor: '#805236',
    borderColor: colors.ink,
    borderRadius: 18,
    borderWidth: 3,
    height: 32,
    position: 'absolute',
    right: -10,
    top: 22,
    width: 32,
  },
  face: {
    alignItems: 'center',
    backgroundColor: '#F7D8A8',
    borderRadius: 42,
    height: 78,
    justifyContent: 'center',
    width: 82,
  },
  eyePatch: {
    alignItems: 'center',
    backgroundColor: '#7B4F37',
    borderRadius: 18,
    height: 30,
    justifyContent: 'center',
    position: 'absolute',
    top: 18,
    width: 26,
  },
  tiredPatch: {
    backgroundColor: '#5D4A48',
    height: 34,
    top: 20,
  },
  eyePatchLeft: {
    left: 16,
  },
  eyePatchRight: {
    right: 16,
  },
  eye: {
    backgroundColor: colors.white,
    borderRadius: 6,
    height: 9,
    width: 9,
  },
  nose: {
    backgroundColor: colors.ink,
    borderRadius: 6,
    height: 10,
    marginTop: 28,
    width: 12,
  },
  smile: {
    borderBottomColor: colors.ink,
    borderBottomWidth: 3,
    borderRadius: 10,
    height: 10,
    width: 24,
  },
  armLeft: {
    backgroundColor: '#A66E45',
    borderColor: colors.ink,
    borderRadius: 12,
    borderWidth: 3,
    height: 22,
    left: -14,
    position: 'absolute',
    top: 72,
    transform: [{ rotate: '20deg' }],
    width: 36,
  },
  armRight: {
    backgroundColor: '#A66E45',
    borderColor: colors.ink,
    borderRadius: 12,
    borderWidth: 3,
    height: 22,
    position: 'absolute',
    right: -14,
    top: 72,
    transform: [{ rotate: '-20deg' }],
    width: 36,
  },
  armClapLeft: {
    left: 16,
    top: 78,
    transform: [{ rotate: '-20deg' }],
  },
  armClapRight: {
    right: 16,
    top: 78,
    transform: [{ rotate: '20deg' }],
  },
  label: {
    bottom: 12,
    color: colors.ink,
    fontSize: 16,
    fontWeight: '900',
    position: 'absolute',
  },
});
