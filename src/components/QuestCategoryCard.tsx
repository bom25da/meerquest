import { Link, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { QuestCategory } from '@/src/content/categories';
import type { Quest } from '@/src/features/quests/questProgress';
import { colors } from '@/src/theme/colors';

interface QuestCategoryCardProps {
  category: QuestCategory;
  nextQuest: Quest | null;
  completedCount: number;
  totalCount: number;
  href: Href;
}

export function QuestCategoryCard({
  category,
  nextQuest,
  completedCount,
  totalCount,
  href,
}: QuestCategoryCardProps) {
  const progressLabel = `${completedCount}/${totalCount}`;

  return (
    <Link href={href} asChild>
      <Pressable style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
        <View style={[styles.badge, { backgroundColor: category.accentColor }]} />
        <View style={styles.copy}>
          <Text style={styles.title}>{category.title}</Text>
          <Text style={styles.subtitle}>{category.subtitle}</Text>
          <Text style={styles.nextQuest}>
            {nextQuest ? `다음 퀘스트: ${nextQuest.title}` : '모든 퀘스트를 다시 살펴봐요'}
          </Text>
        </View>
        <View style={styles.progressPill}>
          <Text style={styles.progressText}>{progressLabel}</Text>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.white,
    borderRadius: 8,
    borderWidth: 3,
    flexDirection: 'row',
    gap: 14,
    minHeight: 116,
    padding: 16,
    shadowColor: colors.ink,
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  cardPressed: {
    transform: [{ scale: 0.99 }],
  },
  badge: {
    borderColor: colors.ink,
    borderRadius: 18,
    borderWidth: 3,
    height: 48,
    width: 48,
  },
  copy: {
    flex: 1,
    gap: 5,
  },
  title: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '700',
  },
  nextQuest: {
    color: colors.sky,
    fontSize: 14,
    fontWeight: '800',
  },
  progressPill: {
    alignItems: 'center',
    backgroundColor: colors.greenSoft,
    borderRadius: 8,
    justifyContent: 'center',
    minWidth: 58,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  progressText: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '900',
  },
});
