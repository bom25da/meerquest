import { Link, useRouter } from 'expo-router';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { QuestCategoryCard } from '@/src/components/QuestCategoryCard';
import { categories } from '@/src/content/categories';
import { quests, sampleProgress } from '@/src/content/quests';
import { getNextQuest } from '@/src/features/quests/questProgress';
import { colors } from '@/src/theme/colors';

const heroMeerkatWindow = require('../assets/images/home/hero-meerkat-window.png');

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={[styles.container, isTablet && styles.tabletContainer]}>
        <View style={[styles.hero, isTablet && styles.tabletHero]}>
          <View style={styles.heroCopy}>
            <View style={styles.brandRow}>
              <Text style={styles.eyebrow}>MeerQuest</Text>
              <View style={styles.leafMark}>
                <View style={styles.leafOne} />
                <View style={styles.leafTwo} />
              </View>
            </View>
            <Text style={styles.title}>{`미어캣 친구와 배움\n퀘스트를 떠나요`}</Text>
            <Text style={styles.subtitle}>오늘은 수학 동굴부터 살짝 파고 들어가 볼까요?</Text>
            <Pressable
              onPress={() => router.push('/quest-map')}
              style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}
            >
              <Text style={styles.primaryButtonText}>퀘스트 맵 보기</Text>
              <MapIcon />
            </Pressable>
          </View>
          <HeroMeerkatWindow isTablet={isTablet} />
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
                style={isTablet ? styles.tabletCategoryCard : styles.categoryCard}
                totalCount={categoryQuests.length}
              />
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MapIcon() {
  return (
    <View style={styles.mapIcon}>
      <View style={styles.mapFoldLeft} />
      <View style={styles.mapFoldMiddle} />
      <View style={styles.mapPin} />
    </View>
  );
}

function HeroMeerkatWindow({ isTablet }: { isTablet: boolean }) {
  return (
    <View style={[styles.windowAssetWrap, isTablet && styles.tabletWindowAssetWrap]}>
      <Image
        resizeMode="contain"
        source={heroMeerkatWindow}
        style={[styles.windowAsset, isTablet && styles.tabletWindowAsset]}
      />
      <Text style={styles.windowLabel}>빼꼼!</Text>
    </View>
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
    maxWidth: 1120,
    width: '100%',
  },
  hero: {
    backgroundColor: colors.surfaceStrong,
    borderColor: '#FFEFC7',
    borderRadius: 8,
    borderWidth: 2,
    gap: 22,
    overflow: 'hidden',
    padding: 26,
    shadowColor: colors.sand,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
  },
  tabletHero: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 24,
    justifyContent: 'space-between',
    minHeight: 282,
    paddingHorizontal: 34,
    paddingVertical: 26,
  },
  heroCopy: {
    flex: 1,
    gap: 14,
    maxWidth: 620,
    zIndex: 1,
  },
  brandRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  eyebrow: {
    color: colors.green,
    fontSize: 32,
    fontWeight: '900',
  },
  leafMark: {
    height: 22,
    position: 'relative',
    width: 26,
  },
  leafOne: {
    backgroundColor: colors.green,
    borderRadius: 10,
    height: 16,
    left: 5,
    position: 'absolute',
    top: 1,
    transform: [{ rotate: '-35deg' }],
    width: 10,
  },
  leafTwo: {
    backgroundColor: '#A4C96B',
    borderRadius: 10,
    height: 14,
    left: 14,
    position: 'absolute',
    top: 8,
    transform: [{ rotate: '36deg' }],
    width: 9,
  },
  title: {
    color: colors.ink,
    fontSize: 32,
    fontWeight: '900',
    lineHeight: 40,
    maxWidth: 700,
  },
  subtitle: {
    color: colors.ink,
    fontSize: 21,
    fontWeight: '700',
    lineHeight: 29,
  },
  primaryButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.orange,
    borderRadius: 24,
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
    minHeight: 60,
    paddingHorizontal: 18,
    shadowColor: '#9C4B24',
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.32,
    shadowRadius: 10,
    elevation: 4,
  },
  primaryButtonPressed: {
    transform: [{ scale: 0.98 }],
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 19,
    fontWeight: '900',
  },
  mapIcon: {
    borderColor: colors.white,
    borderRadius: 4,
    borderWidth: 2,
    height: 25,
    position: 'relative',
    width: 25,
  },
  mapFoldLeft: {
    backgroundColor: colors.white,
    height: 18,
    left: 7,
    opacity: 0.65,
    position: 'absolute',
    top: 3,
    transform: [{ rotate: '14deg' }],
    width: 2,
  },
  mapFoldMiddle: {
    backgroundColor: colors.white,
    height: 16,
    left: 15,
    opacity: 0.65,
    position: 'absolute',
    top: 4,
    transform: [{ rotate: '-14deg' }],
    width: 2,
  },
  mapPin: {
    backgroundColor: colors.white,
    borderRadius: 6,
    height: 8,
    position: 'absolute',
    right: 3,
    top: -5,
    width: 8,
  },
  windowAssetWrap: {
    alignItems: 'center',
    alignSelf: 'center',
    flexShrink: 0,
    gap: 2,
    maxWidth: '100%',
  },
  tabletWindowAssetWrap: {
    marginLeft: 8,
  },
  windowAsset: {
    height: 205,
    width: 280,
  },
  tabletWindowAsset: {
    height: 242,
    width: 330,
  },
  windowLabel: {
    alignSelf: 'center',
    color: colors.ink,
    fontSize: 17,
    fontWeight: '900',
    paddingVertical: 4,
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
    columnGap: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 24,
  },
  tabletGrid: {
    columnGap: 20,
    rowGap: 28,
  },
  categoryCard: {
    flexBasis: '47%',
  },
  tabletCategoryCard: {
    flexBasis: '23%',
  },
});
