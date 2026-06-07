import { Link, type Href } from 'expo-router';
import {
  Image,
  type ImageSourcePropType,
  Pressable,
  StyleSheet,
  type StyleProp,
  View,
  type ViewStyle,
} from 'react-native';

import { AppText as Text } from '@/src/components/AppText';
import type { QuestCategory, QuestCategoryIllustration } from '@/src/content/categories';
import type { Quest } from '@/src/features/quests/questProgress';
import { colors } from '@/src/theme/colors';

interface QuestCategoryCardProps {
  category: QuestCategory;
  nextQuest: Quest | null;
  completedCount: number;
  totalCount: number;
  href: Href;
  style?: StyleProp<ViewStyle>;
}

const categoryImages: Record<QuestCategoryIllustration, ImageSourcePropType> = {
  cave: require('../../assets/images/home/category-math-cave.png'),
  hill: require('../../assets/images/home/category-language-hill.png'),
  playground: require('../../assets/images/home/category-social-playground.png'),
  desert: require('../../assets/images/home/category-safety-desert.png'),
};

export function QuestCategoryCard({
  category,
  nextQuest,
  completedCount,
  totalCount,
  href,
  style,
}: QuestCategoryCardProps) {
  const progressPercent = totalCount > 0 ? Math.min(100, (completedCount / totalCount) * 100) : 0;
  const hasProgress = progressPercent > 0;

  return (
    <Link href={href} asChild>
      <Pressable
        accessibilityLabel={`${category.title}, ${category.subtitle}, ${
          nextQuest ? `다음 퀘스트 ${nextQuest.title}` : '모든 퀘스트 완료'
        }, 진행 ${completedCount}/${totalCount}`}
        style={({ pressed }) => [styles.card, style, pressed && styles.cardPressed]}
      >
        <Image
          resizeMode="contain"
          source={categoryImages[category.illustration]}
          style={styles.illustration}
        />
        <View style={styles.copy}>
          <Text style={styles.title}>{category.title}</Text>
          <Text style={styles.subtitle}>{category.subtitle}</Text>
          <Text style={styles.nextQuest}>
            {nextQuest ? `다음 퀘스트: ${nextQuest.title}` : '모든 퀘스트를 다시 살펴봐요'}
          </Text>
        </View>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: category.accentColor,
                width: `${progressPercent}%`,
              },
            ]}
          >
            {hasProgress ? <Text style={styles.progressStar}>★</Text> : null}
          </View>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    gap: 8,
    minHeight: 276,
    paddingBottom: 4,
  },
  cardPressed: {
    transform: [{ scale: 0.99 }],
  },
  illustration: {
    height: 126,
    width: '100%',
  },
  copy: {
    alignItems: 'center',
    gap: 4,
    minHeight: 92,
    width: '100%',
  },
  title: {
    color: colors.ink,
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 34,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 20,
    textAlign: 'center',
  },
  nextQuest: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 19,
    textAlign: 'center',
  },
  progressTrack: {
    backgroundColor: '#EADDBF',
    borderRadius: 999,
    height: 15,
    marginTop: 2,
    overflow: 'visible',
    width: '100%',
  },
  progressFill: {
    alignItems: 'flex-end',
    borderRadius: 999,
    height: '100%',
    justifyContent: 'center',
  },
  progressStar: {
    color: colors.yellow,
    fontSize: 25,
    lineHeight: 25,
    marginRight: -12,
    textShadowColor: colors.ink,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
});
