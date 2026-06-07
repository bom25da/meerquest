import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText as Text } from '@/src/components/AppText';
import { MeerkatMascot, type MascotMood } from '@/src/components/MeerkatMascot';
import { QuestScreenFrame } from '@/src/components/quest/QuestScreenFrame';
import { categories } from '@/src/content/categories';
import { getQuestStageRect } from '@/src/content/questStageLayout';
import { quests } from '@/src/content/quests';
import {
  getEarnedStarCount,
  getNextQuest,
  type QuestBackgroundAsset,
} from '@/src/features/quests/questProgress';
import { useQuestProgress } from '@/src/features/quests/useQuestProgress';
import { colors } from '@/src/theme/colors';

const appleCountScreen = require('../assets/images/quests/apple-count/apple-count-screen.png');
const mathCaveBackground = require('../assets/images/quests/math-cave-background.png');

const questBackgroundSources: Record<QuestBackgroundAsset, number> = {
  'math-cave-background': mathCaveBackground,
};

export default function QuestPlayScreen() {
  const { questId } = useLocalSearchParams<{ questId?: string }>();
  const router = useRouter();
  const { height, width } = useWindowDimensions();
  const { isLoaded, profileProgress, recordAttempt } = useQuestProgress();
  const [feedbackMessage, setFeedbackMessage] = useState('미어루가 땅굴에서 빼꼼 나와 기다려요.');
  const [mascotMood, setMascotMood] = useState<MascotMood>('greeting');
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const quest = useMemo(() => {
    const requestedQuest = quests.find((item) => item.id === questId);

    if (requestedQuest) {
      return requestedQuest;
    }

    return (
      categories
        .map((category) =>
          getNextQuest({
            categoryId: category.id,
            quests,
            progress: profileProgress,
          }),
        )
        .find((item) => item !== null) ?? quests[0]
    );
  }, [profileProgress, questId]);
  const category = categories.find((item) => item.id === quest.categoryId);
  const step = quest.steps[0];
  const questTitle = `${(category?.title ?? '탐험 지역').replace(/\s+/g, '')} ${quest.level}단계`;
  const earnedStars = getEarnedStarCount({ quests, progress: profileProgress });

  const handleChoicePress = async (choiceId: string) => {
    if (!isLoaded || isCompleted) {
      return;
    }

    const answeredCorrectly = choiceId === step.correctChoiceId;
    const nextProgress = await recordAttempt(quest.id, answeredCorrectly);
    const attempts = nextProgress?.attempts ?? 1;

    setSelectedChoiceId(choiceId);

    if (answeredCorrectly) {
      setIsCompleted(true);
      setMascotMood('clap');
      setFeedbackMessage(step.successMessage);
      return;
    }

    setMascotMood(attempts >= 2 ? 'thinking' : 'hint');
    setFeedbackMessage(
      attempts >= 2
        ? `우리 같이 생각해보자. ${step.hintText}`
        : `괜찮아, 다시 해보자. ${step.hintText}`,
    );
  };

  if (quest.visualLayout === 'apple-count') {
    return (
      <AppleCountQuestScreen
        backgroundSource={
          quest.backgroundAsset ? questBackgroundSources[quest.backgroundAsset] : appleCountScreen
        }
        height={height}
        isCompleted={isCompleted}
        onBack={() => router.back()}
        onHome={() => router.push('/' as Href)}
        onReward={() => router.push(`/reward?questId=${quest.id}` as Href)}
        questTitle={questTitle}
        stars={earnedStars}
        width={width}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <MeerkatMascot mood={mascotMood} />
        <View style={styles.panel}>
          <Text style={styles.eyebrow}>
            {category?.title ?? '탐험 지역'} {quest.level}단계
          </Text>
          <Text style={styles.title}>{quest.title}</Text>
          <Text style={styles.prompt}>{quest.introduction}</Text>
          <Text style={styles.instruction}>{step.instructionText}</Text>

          <View style={styles.choiceGrid}>
            {step.choices.map((choice) => {
              const isSelected = selectedChoiceId === choice.id;
              const isCorrectChoice = choice.id === step.correctChoiceId;

              return (
                <Pressable
                  accessibilityRole="button"
                  key={choice.id}
                  onPress={() => handleChoicePress(choice.id)}
                  style={({ pressed }) => [
                    styles.choice,
                    isSelected && styles.choiceSelected,
                    isCompleted && isCorrectChoice && styles.choiceCorrect,
                    pressed && !isCompleted && styles.choicePressed,
                  ]}>
                  <Text style={styles.choiceText}>{choice.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.feedback, isCompleted && styles.feedbackSuccess]}>
            {isLoaded ? feedbackMessage : '탐험 기록을 준비하고 있어요.'}
          </Text>

          {isCompleted ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push(`/reward?questId=${quest.id}` as Href)}
              style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}>
              <Text style={styles.primaryButtonText}>보상 받기</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}

function AppleCountQuestScreen({
  backgroundSource,
  height,
  isCompleted,
  onBack,
  onHome,
  onReward,
  questTitle,
  stars,
  width,
}: {
  backgroundSource: number;
  height: number;
  isCompleted: boolean;
  onBack: () => void;
  onHome: () => void;
  onReward: () => void;
  questTitle: string;
  stars: number;
  width: number;
}) {
  const handleNext = isCompleted ? onReward : () => undefined;

  return (
    <QuestScreenFrame
      backgroundSource={backgroundSource}
      height={height}
      onBack={onBack}
      onHome={onHome}
      onNext={handleNext}
      onPrevious={onBack}
      onReward={onReward}
      questTitle={questTitle}
      stars={stars}
      width={width}>
      {(stage) => (
        <View
          style={[styles.questContentBackdrop, getQuestStageRect(stage, questContentBackdropRect)]}
        />
      )}
    </QuestScreenFrame>
  );
}

const questContentBackdropRect = { height: 504, left: 52, top: 124, width: 1261 };

const styles = StyleSheet.create({
  questContentBackdrop: {
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    borderRadius: 32,
    overflow: 'hidden',
    position: 'absolute',
  },
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  container: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 22,
    justifyContent: 'center',
    padding: 20,
  },
  panel: {
    backgroundColor: colors.surface,
    borderColor: colors.white,
    borderRadius: 8,
    borderWidth: 4,
    gap: 12,
    maxWidth: 680,
    padding: 18,
    width: '62%',
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
    lineHeight: 24,
  },
  instruction: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 28,
  },
  choiceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    paddingVertical: 4,
  },
  choice: {
    alignItems: 'center',
    backgroundColor: colors.skySoft,
    borderColor: colors.white,
    borderRadius: 8,
    borderWidth: 4,
    justifyContent: 'center',
    minHeight: 74,
    minWidth: 136,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  choicePressed: {
    transform: [{ scale: 0.97 }],
  },
  choiceSelected: {
    borderColor: colors.yellow,
  },
  choiceCorrect: {
    backgroundColor: colors.greenSoft,
    borderColor: colors.green,
  },
  choiceText: {
    color: colors.ink,
    fontSize: 19,
    fontWeight: '900',
    textAlign: 'center',
  },
  feedback: {
    color: colors.muted,
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 24,
    textAlign: 'center',
  },
  feedbackSuccess: {
    color: colors.green,
  },
  primaryButton: {
    alignSelf: 'center',
    backgroundColor: colors.orange,
    borderColor: colors.white,
    borderRadius: 8,
    borderWidth: 3,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  buttonPressed: {
    transform: [{ scale: 0.97 }],
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '900',
  },
});
