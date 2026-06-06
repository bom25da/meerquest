import { useRouter, type Href } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { categories } from '@/src/content/categories';
import { quests } from '@/src/content/quests';
import { getUnlockedQuests } from '@/src/features/quests/questProgress';
import { useQuestProgress } from '@/src/features/quests/useQuestProgress';
import { colors } from '@/src/theme/colors';

export default function QuestMapScreen() {
  const router = useRouter();
  const { isLoaded, profileProgress } = useQuestProgress();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>퀘스트 맵</Text>
        <Text style={styles.subtitle}>완료한 퀘스트 다음에는 조금 더 깊은 땅굴이 열려요.</Text>
        {!isLoaded ? <Text style={styles.loadingText}>탐험 기록을 준비하고 있어요.</Text> : null}

        {categories.map((category) => {
          const categoryQuests = quests.filter((quest) => quest.categoryId === category.id);
          const unlockedIds = new Set(
            getUnlockedQuests({
              categoryId: category.id,
              quests,
              progress: profileProgress,
            }).map((quest) => quest.id),
          );

          return (
            <View key={category.id} style={styles.categorySection}>
              <Text style={[styles.categoryTitle, { color: category.accentColor }]}>
                {category.title}
              </Text>
              <View style={styles.questList}>
                {categoryQuests.map((quest) => {
                  const progress = profileProgress.find((item) => item.questId === quest.id);
                  const isCompleted = progress?.status === 'completed';
                  const isUnlocked = unlockedIds.has(quest.id);

                  return (
                    <View
                      key={quest.id}
                      style={[
                        styles.questRow,
                        !isUnlocked && styles.questRowLocked,
                        isCompleted && styles.questRowCompleted,
                      ]}>
                      <View style={styles.levelBadge}>
                        <Text style={styles.levelText}>{quest.level}</Text>
                      </View>
                      <View style={styles.questCopy}>
                        <Text style={styles.questTitle}>{quest.title}</Text>
                        <Text style={styles.questStatus}>
                          {isCompleted ? '완료' : isUnlocked ? '도전 가능' : '잠김'}
                        </Text>
                      </View>
                      {isUnlocked && isLoaded ? (
                        <Pressable
                          accessibilityRole="button"
                          onPress={() =>
                            router.push(`/quest-play?questId=${quest.id}` as Href)
                          }
                          style={({ pressed }) => [
                            styles.playButton,
                            pressed && styles.playButtonPressed,
                          ]}>
                          <Text style={styles.playButtonText}>
                            {isCompleted ? '다시' : '시작'}
                          </Text>
                        </Pressable>
                      ) : null}
                    </View>
                  );
                })}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  container: {
    alignSelf: 'center',
    gap: 18,
    maxWidth: 860,
    padding: 20,
    paddingBottom: 40,
    width: '100%',
  },
  title: {
    color: colors.ink,
    fontSize: 32,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.muted,
    fontSize: 16,
    fontWeight: '700',
  },
  loadingText: {
    color: colors.sky,
    fontSize: 15,
    fontWeight: '900',
  },
  categorySection: {
    gap: 10,
  },
  categoryTitle: {
    fontSize: 22,
    fontWeight: '900',
  },
  questList: {
    gap: 10,
  },
  questRow: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.white,
    borderRadius: 8,
    borderWidth: 3,
    flexDirection: 'row',
    gap: 12,
    minHeight: 82,
    padding: 14,
  },
  questRowLocked: {
    opacity: 0.55,
  },
  questRowCompleted: {
    backgroundColor: colors.greenSoft,
  },
  levelBadge: {
    alignItems: 'center',
    backgroundColor: colors.surfaceStrong,
    borderRadius: 8,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  levelText: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '900',
  },
  questCopy: {
    flex: 1,
  },
  questTitle: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: '900',
  },
  questStatus: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 3,
  },
  playButton: {
    backgroundColor: colors.orange,
    borderRadius: 8,
    minWidth: 62,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  playButtonPressed: {
    transform: [{ scale: 0.97 }],
  },
  playButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '900',
    textAlign: 'center',
  },
});
