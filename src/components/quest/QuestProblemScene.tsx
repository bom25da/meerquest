import type { StyleProp, ViewStyle } from 'react-native';
import { Image, StyleSheet, View } from 'react-native';

import { AppText as Text } from '@/src/components/AppText';
import type {
  QuestProblemScene as QuestProblemSceneData,
  QuestProblemSceneItem,
  QuestProblemSceneLayout,
} from '@/src/content/questProblemScenes';
import { colors } from '@/src/theme/colors';

const meeroCharacterImage = require('../../../assets/images/brand/meero-character.png');
const friendCharacterImage = require('../../../assets/images/characters/desert-fox-girl-simple-dress.png');

interface QuestProblemSceneProps {
  scale: number;
  scene: QuestProblemSceneData;
  style: StyleProp<ViewStyle>;
}

export function QuestProblemScene({ scale, scene, style }: QuestProblemSceneProps) {
  return (
    <View
      accessibilityLabel={scene.summary}
      style={[styles.scene, getCategorySceneStyle(scene.categoryId), style]}>
      <View style={styles.sceneBackdropAccent} />
      <View style={styles.itemGrid}>
        {scene.items.map((sceneItem) => (
          <View
            key={sceneItem.id}
            style={[
              styles.itemCard,
              getItemLayoutStyle(scene.layout, scene.items.length, sceneItem),
              sceneItem.role === 'danger' && styles.dangerItemCard,
              sceneItem.role === 'safe' && styles.safeItemCard,
            ]}>
            {renderSceneItemVisual(sceneItem, scale)}
            <Text
              adjustsFontSizeToFit
              numberOfLines={2}
              style={[
                styles.itemLabel,
                { fontSize: 22 * scale, lineHeight: 27 * scale },
              ]}>
              {sceneItem.label}
            </Text>
            {sceneItem.detail ? (
              <Text
                adjustsFontSizeToFit
                numberOfLines={1}
                style={[styles.itemDetail, { fontSize: 14 * scale, lineHeight: 18 * scale }]}>
                {sceneItem.detail}
              </Text>
            ) : null}
          </View>
        ))}
      </View>
    </View>
  );
}

function renderSceneItemVisual(sceneItem: QuestProblemSceneItem, scale: number) {
  if (sceneItem.kind === 'character') {
    const isFriend =
      sceneItem.id.includes('friend') ||
      sceneItem.id.includes('child') ||
      sceneItem.label.includes('친구') ||
      sceneItem.label.includes('아이');

    return (
      <Image
        accessibilityIgnoresInvertColors
        resizeMode="contain"
        source={isFriend ? friendCharacterImage : meeroCharacterImage}
        style={[styles.characterImage, { height: 92 * scale, width: 92 * scale }]}
      />
    );
  }

  if (sceneItem.kind === 'path') {
    const pathWidth = sceneItem.size === 'large' ? '94%' : sceneItem.size === 'small' ? '54%' : '74%';

    return (
      <View style={[styles.pathVisual, { height: 74 * scale }]}>
        <View style={[styles.pathLine, { width: pathWidth }]} />
        <View style={styles.pathStoneRow}>
          {Array.from({ length: sceneItem.size === 'large' ? 5 : 3 }).map((_, index) => (
            <View key={`${sceneItem.id}-stone-${index}`} style={styles.pathStone} />
          ))}
        </View>
      </View>
    );
  }

  if (sceneItem.kind === 'count') {
    const count = Math.min(sceneItem.count ?? 1, 10);

    return (
      <View style={[styles.countGrid, { minHeight: 74 * scale }]}>
        {Array.from({ length: count }).map((_, index) => (
          <View
            key={`${sceneItem.id}-count-${index}`}
            style={[
              styles.countDot,
              sceneItem.label.includes('보석') && styles.gemDot,
              { height: 20 * scale, width: 20 * scale },
            ]}
          />
        ))}
      </View>
    );
  }

  if (sceneItem.kind === 'sequence') {
    return (
      <View style={styles.sequenceRow}>
        {(sceneItem.values ?? [sceneItem.label]).map((value, index) => (
          <View
            key={`${sceneItem.id}-value-${index}`}
            style={[
              styles.sequenceBadge,
              value === '?' && styles.sequenceMissingBadge,
              { height: 42 * scale, minWidth: 42 * scale },
            ]}>
            <Text
              adjustsFontSizeToFit
              numberOfLines={1}
              style={[styles.sequenceValue, { fontSize: 22 * scale, lineHeight: 26 * scale }]}>
              {value}
            </Text>
          </View>
        ))}
      </View>
    );
  }

  return (
    <View
      style={[
        styles.objectVisual,
        sceneItem.kind === 'danger' && styles.dangerVisual,
        sceneItem.kind === 'safe' && styles.safeVisual,
        sceneItem.kind === 'emotion' && styles.emotionVisual,
        sceneItem.kind === 'place' && styles.placeVisual,
        { height: 76 * scale, width: 96 * scale },
      ]}>
      <Text
        adjustsFontSizeToFit
        numberOfLines={1}
        style={[styles.objectVisualText, { fontSize: 24 * scale, lineHeight: 29 * scale }]}>
        {getObjectVisualText(sceneItem)}
      </Text>
    </View>
  );
}

function getObjectVisualText(sceneItem: QuestProblemSceneItem) {
  if (sceneItem.kind === 'danger') {
    return '!';
  }

  if (sceneItem.kind === 'safe') {
    return 'OK';
  }

  if (sceneItem.values?.[0]) {
    return sceneItem.values[0];
  }

  return sceneItem.label.replace(/\s+/g, '').slice(0, 2);
}

function getItemLayoutStyle(
  layout: QuestProblemSceneLayout,
  itemCount: number,
  sceneItem: QuestProblemSceneItem,
) {
  if (layout === 'sequence') {
    return getFlexBasis(itemCount <= 2 ? '45%' : '30%');
  }

  if (layout === 'compare') {
    return getFlexBasis(sceneItem.size === 'large' ? '38%' : '28%');
  }

  if (layout === 'count') {
    return getFlexBasis('29%');
  }

  return getFlexBasis(itemCount <= 2 ? '42%' : '29%');
}

function getFlexBasis(flexBasis: `${number}%`): ViewStyle {
  return { flexBasis };
}

function getCategorySceneStyle(categoryId: QuestProblemSceneData['categoryId']) {
  if (categoryId === 'math') {
    return styles.mathScene;
  }

  if (categoryId === 'language') {
    return styles.languageScene;
  }

  if (categoryId === 'social') {
    return styles.socialScene;
  }

  return styles.safetyScene;
}

const styles = StyleSheet.create({
  characterImage: {
    marginBottom: -2,
  },
  countDot: {
    backgroundColor: '#AEB5B7',
    borderColor: '#6F777B',
    borderRadius: 999,
    borderWidth: 2,
    margin: 3,
  },
  countGrid: {
    alignContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    maxWidth: '78%',
  },
  dangerItemCard: {
    borderColor: colors.rose,
  },
  dangerVisual: {
    backgroundColor: '#FFE0DC',
    borderColor: colors.rose,
  },
  emotionVisual: {
    backgroundColor: '#FFF1B8',
    borderColor: colors.yellow,
  },
  gemDot: {
    backgroundColor: '#65C8F2',
    borderColor: '#1F78A0',
    transform: [{ rotate: '45deg' }],
  },
  itemCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 251, 242, 0.95)',
    borderColor: colors.white,
    borderRadius: 24,
    borderWidth: 4,
    elevation: 7,
    justifyContent: 'center',
    minHeight: '39%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#5F391A',
    shadowOffset: { height: 7, width: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
  },
  itemDetail: {
    color: colors.muted,
    fontWeight: '800',
    includeFontPadding: false,
    marginTop: 2,
    textAlign: 'center',
  },
  itemGrid: {
    alignContent: 'center',
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    justifyContent: 'center',
    padding: 18,
  },
  itemLabel: {
    color: colors.ink,
    fontWeight: '900',
    includeFontPadding: false,
    textAlign: 'center',
  },
  languageScene: {
    backgroundColor: '#DFF6EC',
  },
  mathScene: {
    backgroundColor: '#F6E2B6',
  },
  objectVisual: {
    alignItems: 'center',
    backgroundColor: '#EAF4FF',
    borderColor: colors.sky,
    borderRadius: 22,
    borderWidth: 4,
    justifyContent: 'center',
    marginBottom: 6,
  },
  objectVisualText: {
    color: colors.ink,
    fontWeight: '900',
    includeFontPadding: false,
    textAlign: 'center',
  },
  pathLine: {
    backgroundColor: '#8D8F88',
    borderColor: '#5F635E',
    borderRadius: 999,
    borderWidth: 3,
    height: 24,
  },
  pathStone: {
    backgroundColor: '#B4B7B3',
    borderColor: '#747A76',
    borderRadius: 999,
    borderWidth: 2,
    height: 14,
    width: 22,
  },
  pathStoneRow: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    marginTop: -4,
  },
  pathVisual: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  placeVisual: {
    backgroundColor: '#F4EDFF',
    borderColor: '#9471C8',
  },
  safeItemCard: {
    borderColor: colors.green,
  },
  safeVisual: {
    backgroundColor: colors.greenSoft,
    borderColor: colors.green,
  },
  safetyScene: {
    backgroundColor: '#FFE0B6',
  },
  scene: {
    borderColor: 'rgba(255, 255, 255, 0.86)',
    borderRadius: 28,
    borderWidth: 5,
    overflow: 'hidden',
    position: 'absolute',
  },
  sceneBackdropAccent: {
    backgroundColor: 'rgba(255, 255, 255, 0.24)',
    borderRadius: 999,
    height: '92%',
    left: '-12%',
    position: 'absolute',
    top: '-28%',
    width: '72%',
  },
  sequenceBadge: {
    alignItems: 'center',
    backgroundColor: '#F8F0DD',
    borderColor: '#A9844C',
    borderRadius: 999,
    borderWidth: 3,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  sequenceMissingBadge: {
    backgroundColor: '#FFF9EC',
    borderStyle: 'dashed',
  },
  sequenceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 8,
  },
  sequenceValue: {
    color: colors.ink,
    fontWeight: '900',
    includeFontPadding: false,
    textAlign: 'center',
  },
  socialScene: {
    backgroundColor: '#F7E3F4',
  },
});
