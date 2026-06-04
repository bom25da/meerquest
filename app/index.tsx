import { Link } from 'expo-router';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MeerkatMascot } from '@/src/components/MeerkatMascot';
import { QuestCategoryCard } from '@/src/components/QuestCategoryCard';
import { categories } from '@/src/content/categories';
import { quests, sampleProgress } from '@/src/content/quests';
import { getNextQuest } from '@/src/features/quests/questProgress';
import { colors } from '@/src/theme/colors';

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={[styles.container, isTablet && styles.tabletContainer]}>
        <View style={[styles.hero, isTablet && styles.tabletHero]}>
          <View style={styles.heroCopy}>
            <Text style={styles.eyebrow}>MeerQuest</Text>
            <Text style={styles.title}>미어캣 친구와 배움 퀘스트를 떠나요</Text>
            <Text style={styles.subtitle}>오늘은 수학 동굴부터 살짝 파고 들어가 볼까요?</Text>
            <Link href="/quest-map" style={styles.primaryLink}>
              퀘스트 맵 보기
            </Link>
          </View>
          <MeerkatMascot mood="greeting" />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>탐험 카테고리</Text>
          <Link href="/guardian" style={styles.guardianLink}>
            보호자 보기
          </Link>
        </View>

        <View style={[styles.grid, isTablet && styles.tabletGrid]}>
          {categories.map((category) => {
            const categoryQuests = quests.filter((quest) => quest.categoryId === category.id);
            const completedCount = categoryQuests.filter((quest) =>
              sampleProgress.some(
                (progress) => progress.questId === quest.id && progress.status === 'completed',
              ),
            ).length;

            return (
              <QuestCategoryCard
                key={category.id}
                category={category}
                completedCount={completedCount}
                href="/quest-map"
                nextQuest={getNextQuest({
                  categoryId: category.id,
                  quests,
                  progress: sampleProgress,
                })}
                totalCount={categoryQuests.length}
              />
            );
          })}
        </View>
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
    gap: 24,
    padding: 20,
    paddingBottom: 40,
  },
  tabletContainer: {
    alignSelf: 'center',
    maxWidth: 980,
    width: '100%',
  },
  hero: {
    backgroundColor: colors.surfaceStrong,
    borderColor: colors.white,
    borderRadius: 8,
    borderWidth: 4,
    gap: 18,
    padding: 20,
  },
  tabletHero: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 28,
  },
  heroCopy: {
    flex: 1,
    gap: 10,
  },
  eyebrow: {
    color: colors.green,
    fontSize: 24,
    fontWeight: '900',
  },
  title: {
    color: colors.ink,
    fontSize: 34,
    fontWeight: '900',
    lineHeight: 40,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 24,
  },
  primaryLink: {
    alignSelf: 'flex-start',
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
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: '900',
  },
  guardianLink: {
    color: colors.sky,
    fontSize: 15,
    fontWeight: '900',
  },
  grid: {
    gap: 14,
  },
  tabletGrid: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
