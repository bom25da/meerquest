import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText as Text } from '@/src/components/AppText';
import { categories } from '@/src/content/categories';
import { quests } from '@/src/content/quests';
import {
  getHighestCompletedLevel,
  getReviewRecommendation,
} from '@/src/features/quests/questProgress';
import { useQuestProgress } from '@/src/features/quests/useQuestProgress';
import { colors } from '@/src/theme/colors';

export default function GuardianScreen() {
  const { isLoaded, profileProgress } = useQuestProgress();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>보호자 진행도</Text>
        <Text style={styles.subtitle}>카테고리별 최고 단계와 복습 추천을 확인해요.</Text>
        {!isLoaded ? <Text style={styles.loadingText}>진행 기록을 불러오고 있어요.</Text> : null}

        {categories.map((category) => {
          const categoryQuests = quests.filter((quest) => quest.categoryId === category.id);
          const completedCount = categoryQuests.filter(
            (quest) =>
              profileProgress.find((item) => item.questId === quest.id)?.status === 'completed',
          ).length;
          const highestLevel = getHighestCompletedLevel({
            categoryId: category.id,
            quests,
            progress: profileProgress,
          });
          const reviewQuest = getReviewRecommendation({
            categoryId: category.id,
            quests,
            progress: profileProgress,
          });

          return (
            <View key={category.id} style={styles.card}>
              <View style={[styles.accent, { backgroundColor: category.accentColor }]} />
              <View style={styles.cardCopy}>
                <Text style={styles.categoryTitle}>{category.title}</Text>
                <Text style={styles.metric}>
                  완료한 퀘스트: {completedCount}/{categoryQuests.length}
                </Text>
                <Text style={styles.metric}>최고 완료 단계: {highestLevel || 0}</Text>
                <Text style={styles.review}>
                  복습 추천: {reviewQuest ? reviewQuest.title : '오늘은 추천 복습이 없어요'}
                </Text>
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
    gap: 14,
    maxWidth: 780,
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
    marginBottom: 10,
  },
  loadingText: {
    color: colors.sky,
    fontSize: 15,
    fontWeight: '900',
  },
  card: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.white,
    borderRadius: 8,
    borderWidth: 3,
    flexDirection: 'row',
    gap: 14,
    padding: 16,
  },
  accent: {
    borderRadius: 8,
    height: 56,
    width: 16,
  },
  cardCopy: {
    flex: 1,
    gap: 5,
  },
  categoryTitle: {
    color: colors.ink,
    fontSize: 21,
    fontWeight: '900',
  },
  metric: {
    color: colors.sky,
    fontSize: 15,
    fontWeight: '800',
  },
  review: {
    color: colors.muted,
    fontSize: 15,
    fontWeight: '700',
  },
});
