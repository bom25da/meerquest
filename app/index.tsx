import type { Href } from "expo-router";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback } from "react";
import type { ImageSourcePropType } from "react-native";
import {
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { AppText as Text } from "@/src/components/AppText";
import type {
  HomeLearningRegion,
  HomeNavigationIcon,
  HomeNavigationItem,
  HomeRegionBackground,
  HomeSectionHeaderIcon,
} from "@/src/content/home";
import {
  getHomeViewportLayout,
  homeEntrySpeechText,
  homeHero,
  homeLandscapeLayout,
  homeLearningRegions,
  homeNavigationItems,
  homeNavigationStyle,
  homeRegionCardStyle,
  homeSectionHeader,
} from "@/src/content/home";
import { supertonic3SpeechService } from "@/src/features/speech/supertonic3Speech";
import { meerQuestBrightSpeechDefaults } from "@/src/features/speech/supertonic3VoiceProfile";
import { colors } from "@/src/theme/colors";

const meerquestWordmark = require("../assets/images/brand/meerquest-wordmark.png");
const meeroCharacter = require("../assets/images/brand/meero-character.png");

const homeHeroImages = {
  "home-adventure-background": require("../assets/images/home/home-adventure-background.png"),
  "home-adventure-background-clean": require("../assets/images/home/home-adventure-background-clean.png"),
  "home-adventure-background-no-text": require("../assets/images/home/home-adventure-background-no-text.png"),
  "home-banner": require("../assets/images/home/home-banner.png"),
} as const;

const homeHeroCtaImages = {
  "quest-map-button": require("../assets/images/home/quest-map-button.png"),
} as const;

const heroSpeechBubble = require("../assets/images/home/hero-speech-bubble.png");

const regionBackgrounds: Record<HomeRegionBackground, ImageSourcePropType> = {
  "category-math-background": require("../assets/images/home/category-math-background.png"),
  "category-language-background": require("../assets/images/home/category-language-background.png"),
  "category-social-background": require("../assets/images/home/category-social-background.png"),
  "category-safety-background": require("../assets/images/home/category-safety-background.png"),
};

const sectionHeaderIcons: Record<HomeSectionHeaderIcon, ImageSourcePropType> = {
  sprout: require("../assets/images/home/sprout.png"),
};

const navigationIcons: Record<HomeNavigationIcon, ImageSourcePropType> = {
  "nav-home": require("../assets/images/navigation/nav-home.png"),
  "nav-quest-map": require("../assets/images/navigation/nav-quest-map.png"),
  "nav-reward": require("../assets/images/navigation/nav-reward.png"),
  "nav-guardian": require("../assets/images/navigation/nav-guardian.png"),
};

export default function HomeScreen() {
  const { height, width } = useWindowDimensions();
  const isCompact =
    width < homeLandscapeLayout.compactBreakpoint ||
    height < homeLandscapeLayout.compactHeightBreakpoint;
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const containerWidth = Math.min(width, homeLandscapeLayout.maxContentWidth);
  const containerHorizontalPadding = isCompact
    ? homeLandscapeLayout.screenPadding.compact
    : homeLandscapeLayout.screenPadding.regular;
  const bodyWidth = containerWidth - containerHorizontalPadding * 2;
  const { heroHeight, regionCardHeight, regionCardWidth } =
    getHomeViewportLayout({
      bodyWidth,
      bottomInset: insets.bottom,
      height,
      isCompact,
    });
  const heroCtaLayout = isCompact
    ? homeHero.cta.layout.compact
    : homeHero.cta.layout.regular;
  useFocusEffect(
    useCallback(() => {
      void supertonic3SpeechService.speakText(homeEntrySpeechText, {
        ...meerQuestBrightSpeechDefaults,
      });
    }, []),
  );

  const navigateToToolbarRoute = (route: string) => {
    if (route === "/") {
      return;
    }

    router.push(route as Href);
  };

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.container,
            isCompact && styles.compactContainer,
          ]}
        >
          <View style={styles.topBar}>
            <Image
              resizeMode="contain"
              source={meerquestWordmark}
              style={[styles.wordmark, isCompact && styles.compactWordmark]}
            />

            <View
              style={[styles.topStatus, isCompact && styles.compactTopStatus]}
            >
              <View
                style={[
                  styles.avatarBadge,
                  isCompact && styles.compactAvatarBadge,
                ]}
              >
                <Image
                  resizeMode="cover"
                  source={meeroCharacter}
                  style={[
                    styles.avatarImage,
                    isCompact && styles.compactAvatarImage,
                  ]}
                />
              </View>
              <View
                style={[
                  styles.pointBadge,
                  isCompact && styles.compactPointBadge,
                ]}
              >
                <Text
                  style={[
                    styles.pointStar,
                    isCompact && styles.compactPointStar,
                  ]}
                >
                  ★
                </Text>
                <Text
                  style={[
                    styles.pointText,
                    isCompact && styles.compactPointText,
                  ]}
                >
                  25
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.landscapeBody}>
            <View style={styles.heroColumn}>
              <ImageBackground
                accessibilityLabel={homeHero.alt}
                imageStyle={styles.heroBannerImage}
                resizeMode={homeHero.resizeMode}
                source={homeHeroImages[homeHero.image]}
                style={[
                  styles.heroCard,
                  {
                    borderWidth: homeHero.frameBorderWidth,
                    height: heroHeight,
                  },
                ]}
              >
                <View
                  accessibilityLabel={homeHero.speechText.replace(/\n/g, " ")}
                  style={[
                    styles.speechBubble,
                    isCompact && styles.compactSpeechBubble,
                  ]}
                >
                  <Image
                    resizeMode="contain"
                    source={heroSpeechBubble}
                    style={styles.speechBubbleImage}
                  />
                  <Text
                    adjustsFontSizeToFit
                    numberOfLines={2}
                    style={[
                      styles.speechText,
                      isCompact && styles.compactSpeechText,
                    ]}
                  >
                    {homeHero.speechText}
                  </Text>
                </View>
                <Pressable
                  accessibilityLabel={homeHero.cta.label}
                  accessibilityRole="button"
                  onPress={() => router.push(homeHero.cta.route)}
                  style={({ pressed }) => [
                    styles.heroButton,
                    heroCtaLayout,
                    pressed && styles.pressed,
                  ]}
                >
                  <Image
                    resizeMode="contain"
                    source={homeHeroCtaImages[homeHero.cta.image]}
                    style={styles.heroButtonImage}
                  />
                </Pressable>
              </ImageBackground>
            </View>

            <View style={styles.regionColumn}>
              <View style={styles.sectionHeader}>
                <Image
                  resizeMode="contain"
                  source={sectionHeaderIcons[homeSectionHeader.icon]}
                  style={styles.sectionHeaderIcon}
                />
                <Text style={styles.sectionTitle}>
                  {homeSectionHeader.title}
                </Text>
              </View>

              <View style={styles.regionGrid}>
                {homeLearningRegions.map((region) => (
                  <RegionCard
                    background={regionBackgrounds[region.background]}
                    key={region.id}
                    height={regionCardHeight}
                    isCompact={isCompact}
                    onPress={() =>
                      !region.locked && router.push(region.route as Href)
                    }
                    region={region}
                    width={regionCardWidth}
                  />
                ))}
              </View>
            </View>
          </View>
        </ScrollView>
        <BottomNavigation
          bottomInset={insets.bottom}
          isCompact={isCompact}
          items={homeNavigationItems}
          onNavigate={navigateToToolbarRoute}
        />
      </View>
    </SafeAreaView>
  );
}

function RegionCard({
  background,
  height,
  isCompact,
  onPress,
  region,
  width,
}: {
  background: ImageSourcePropType;
  height: number;
  isCompact: boolean;
  onPress: () => void;
  region: HomeLearningRegion;
  width: number;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: region.locked }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.regionCard,
        isCompact && styles.compactRegionCard,
        { height, width },
        pressed && !region.locked && styles.pressed,
      ]}
    >
      <ImageBackground
        imageStyle={styles.regionBackgroundImage}
        resizeMode="cover"
        source={background}
        style={styles.regionBackgroundFill}
      />
      <View style={styles.regionOverlay} />
      <View
        style={[styles.regionContent, isCompact && styles.compactRegionContent]}
      >
        <Text
          style={[styles.regionTitle, isCompact && styles.compactRegionTitle]}
        >
          {region.title}
        </Text>
        {region.locked ? <LockBadge /> : <StarRating count={region.stars} />}
      </View>
    </Pressable>
  );
}

function StarRating({ count }: { count: number }) {
  return (
    <View style={styles.starRating}>
      {[0, 1, 2].map((index) => (
        <Text
          key={index}
          style={[
            styles.ratingStar,
            index < count ? styles.ratingStarActive : styles.ratingStarIdle,
          ]}
        >
          ★
        </Text>
      ))}
    </View>
  );
}

function LockBadge() {
  return (
    <View style={styles.lockBadge}>
      <View style={styles.lockShackle} />
      <View style={styles.lockBody}>
        <View style={styles.lockDot} />
      </View>
    </View>
  );
}

function BottomNavigation({
  bottomInset,
  isCompact,
  items,
  onNavigate,
}: {
  bottomInset: number;
  isCompact: boolean;
  items: HomeNavigationItem[];
  onNavigate: (route: string) => void;
}) {
  return (
    <View
      style={[
        styles.bottomNav,
        isCompact && styles.compactBottomNav,
        { marginBottom: Math.max(bottomInset, 8) },
      ]}
    >
      {items.map((item) => (
        <Pressable
          key={item.id}
          accessibilityRole="button"
          accessibilityState={{ selected: item.active }}
          onPress={() => onNavigate(item.route)}
          style={({ pressed }) => [
            styles.navItem,
            isCompact && styles.compactNavItem,
            item.active && styles.activeNavItem,
            pressed && !item.active && styles.pressed,
          ]}
        >
          <View
            style={[styles.navIconWrap, isCompact && styles.compactNavIconWrap]}
          >
            <Image
              resizeMode="contain"
              source={navigationIcons[item.icon]}
              style={[
                styles.navImage,
                isCompact && styles.compactNavImage,
                !item.active && styles.inactiveNavImage,
              ]}
            />
          </View>
          <Text
            style={[
              item.active ? styles.activeNavLabel : styles.navLabel,
              isCompact && styles.compactNavLabel,
            ]}
          >
            {item.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const textShadow = {
  textShadowColor: "rgba(105, 64, 25, 0.3)",
  textShadowOffset: { width: 0, height: 2 },
  textShadowRadius: 2,
};

const cardShadow = {
  elevation: 4,
  shadowColor: "#A86B24",
  shadowOffset: { width: 0, height: 7 },
  shadowOpacity: 0.18,
  shadowRadius: 12,
};

const styles = StyleSheet.create({
  activeNavItem: {
    alignItems: "center",
    backgroundColor: homeNavigationStyle.activeBackgroundColor,
    borderRadius: 24,
    justifyContent: "center",
    shadowColor: "#D67B2B",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.14,
    shadowRadius: 10,
  },
  activeNavLabel: {
    color: homeNavigationStyle.activeLabelColor,
    fontSize: 13,
    fontWeight: "900",
  },
  avatarBadge: {
    alignItems: "center",
    backgroundColor: "#FFF7DF",
    borderColor: colors.white,
    borderRadius: 30,
    borderWidth: 3,
    height: 60,
    justifyContent: "center",
    overflow: "hidden",
    width: 60,
    ...cardShadow,
  },
  avatarImage: {
    height: 76,
    marginTop: 14,
    width: 54,
  },
  compactAvatarBadge: {
    borderRadius: 27,
    borderWidth: 3,
    height: 54,
    width: 54,
  },
  compactAvatarImage: {
    height: 70,
    marginTop: 13,
    width: 50,
  },
  compactBottomNav: {
    borderRadius: 22,
    minHeight: 48,
    paddingHorizontal: 8,
    paddingVertical: 3,
    width: "70%",
  },
  bottomNav: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "#FFFEFA",
    borderRadius: 26,
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 8,
    maxWidth: homeLandscapeLayout.bottomNavigationMaxWidth,
    minHeight: homeLandscapeLayout.bottomNavigationMinHeight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    width: "70%",
    elevation: 8,
    shadowColor: "#C98735",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
  },
  cloud: {
    backgroundColor: "rgba(255, 255, 255, 0.86)",
    borderRadius: 18,
    height: 22,
    position: "absolute",
    width: 78,
  },
  cloudLeft: {
    left: 28,
    top: 70,
  },
  cloudRight: {
    right: 36,
    top: 64,
  },
  compactContainer: {
    paddingHorizontal: homeLandscapeLayout.screenPadding.compact,
  },
  compactPointBadge: {
    borderRadius: 24,
    gap: 5,
    minHeight: 48,
    paddingHorizontal: 10,
  },
  compactPointStar: {
    fontSize: 28,
    lineHeight: 31,
  },
  compactPointText: {
    fontSize: 20,
  },
  compactHeroCard: {
    minHeight: 306,
  },
  compactHeroMascot: {
    bottom: 2,
    height: 238,
    left: 8,
    width: 166,
  },
  compactQuestEyebrow: {
    fontSize: 17,
  },
  compactQuestMascot: {
    height: 44,
    width: 34,
  },
  compactQuestTitle: {
    fontSize: 19,
  },
  compactRegionTitle: {
    fontSize: 22,
    lineHeight: 26,
  },
  compactRegionCard: {
    minHeight: 88,
  },
  compactRegionContent: {
    minHeight: 88,
    paddingBottom: 6,
    paddingTop: 6,
  },
  compactSpeechBubble: {
    left: "26%",
    top: "22%",
    width: "17.2%",
  },
  compactSpeechText: {
    fontSize: 19,
    lineHeight: 26,
  },
  compactStartButton: {
    borderRadius: 23,
    minHeight: 44,
    minWidth: 88,
    paddingHorizontal: 10,
  },
  compactStartButtonText: {
    fontSize: 22,
  },
  compactTodayQuest: {
    gap: 8,
    minHeight: 50,
    paddingHorizontal: 8,
  },
  compactTopStatus: {
    gap: 6,
  },
  compactWordmark: {
    height: 46,
    width: 200,
  },
  container: {
    alignSelf: "center",
    gap: homeLandscapeLayout.contentGap,
    maxWidth: homeLandscapeLayout.maxContentWidth,
    padding: homeLandscapeLayout.screenPadding.regular,
    paddingBottom: 10,
    width: "100%",
  },
  heroButton: {
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
  },
  heroButtonImage: {
    height: "100%",
    width: "100%",
  },
  heroColumn: {
    gap: 10,
    minWidth: 0,
    width: "100%",
  },
  homeIcon: {
    alignItems: "center",
    height: 26,
    justifyContent: "flex-end",
    width: 28,
  },
  homeIconBody: {
    alignItems: "center",
    borderRadius: 3,
    borderWidth: 3,
    height: 16,
    justifyContent: "flex-end",
    width: 20,
  },
  homeIconDoor: {
    borderRadius: 2,
    height: 8,
    marginBottom: 1,
    width: 6,
  },
  homeIconRoof: {
    borderBottomWidth: 12,
    borderLeftColor: "transparent",
    borderLeftWidth: 13,
    borderRightColor: "transparent",
    borderRightWidth: 13,
    height: 0,
    marginBottom: -2,
    width: 0,
  },
  heroCard: {
    backgroundColor: "#FFD46B",
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
    width: "100%",
    ...cardShadow,
  },
  landscapeBody: {
    alignItems: "stretch",
    flexDirection: "column",
    gap: homeLandscapeLayout.bodyGap,
  },
  heroBannerImage: {
    borderRadius: 12,
  },
  heroHill: {
    backgroundColor: "#FFE592",
    borderRadius: 120,
    bottom: -78,
    height: 154,
    position: "absolute",
    width: 260,
  },
  heroHillLeft: {
    left: -30,
  },
  heroHillMiddle: {
    left: 232,
  },
  heroHillRight: {
    right: -32,
  },
  heroMascot: {
    bottom: 0,
    height: 300,
    left: 30,
    position: "absolute",
    width: 214,
  },
  heroPlant: {
    backgroundColor: "#86B936",
    borderRadius: 10,
    bottom: 18,
    height: 82,
    position: "absolute",
    transform: [{ rotate: "-16deg" }],
    width: 18,
  },
  heroPlantLeft: {
    left: 22,
  },
  heroPlantRight: {
    right: 24,
    transform: [{ rotate: "18deg" }],
  },
  lockBadge: {
    alignItems: "center",
    height: 44,
    justifyContent: "center",
    marginTop: 2,
    width: 44,
  },
  lockBody: {
    alignItems: "center",
    backgroundColor: "rgba(151, 122, 63, 0.78)",
    borderColor: colors.white,
    borderRadius: 8,
    borderWidth: 3,
    height: 30,
    justifyContent: "center",
    marginTop: -6,
    width: 30,
  },
  lockDot: {
    backgroundColor: colors.white,
    borderRadius: 3,
    height: 7,
    width: 7,
  },
  lockShackle: {
    borderColor: colors.white,
    borderRadius: 10,
    borderWidth: 3,
    height: 21,
    width: 22,
  },
  mapIcon: {
    height: 42,
    position: "relative",
    width: 50,
  },
  mapPanel: {
    borderColor: colors.white,
    borderRadius: 3,
    borderWidth: 3,
    height: 34,
    position: "absolute",
    top: 8,
    width: 20,
  },
  mapPanelLeft: {
    backgroundColor: "#9BD165",
    left: 0,
    transform: [{ rotate: "-6deg" }],
  },
  mapPanelMiddle: {
    backgroundColor: "#FFEB80",
    left: 15,
    transform: [{ rotate: "6deg" }],
  },
  mapPanelRight: {
    backgroundColor: "#63B5E7",
    left: 30,
    transform: [{ rotate: "-6deg" }],
  },
  mapPin: {
    alignItems: "center",
    backgroundColor: "#F5672A",
    borderColor: colors.white,
    borderRadius: 14,
    borderWidth: 3,
    height: 28,
    justifyContent: "center",
    left: 28,
    position: "absolute",
    top: 0,
    width: 28,
  },
  mapPinCore: {
    backgroundColor: colors.white,
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  guardianAdult: {
    alignItems: "center",
    position: "absolute",
    bottom: 0,
    left: 6,
  },
  guardianBody: {
    backgroundColor: "#7DBD46",
    borderColor: "#5B412A",
    borderRadius: 7,
    borderWidth: 2,
    height: 18,
    width: 21,
  },
  guardianChild: {
    alignItems: "center",
    bottom: 0,
    position: "absolute",
    right: 4,
  },
  guardianChildBody: {
    backgroundColor: "#F6C546",
    borderColor: "#5B412A",
    borderRadius: 6,
    borderWidth: 2,
    height: 15,
    width: 18,
  },
  guardianChildHead: {
    backgroundColor: "#F7C799",
    borderColor: "#5B412A",
    borderRadius: 7,
    borderWidth: 2,
    height: 14,
    marginBottom: -2,
    width: 14,
  },
  guardianHead: {
    backgroundColor: "#F1B47B",
    borderColor: "#5B412A",
    borderRadius: 8,
    borderWidth: 2,
    height: 16,
    marginBottom: -2,
    width: 16,
  },
  guardianIcon: {
    height: 32,
    position: "relative",
    width: 38,
  },
  navIconWrap: {
    alignItems: "center",
    height: 40,
    justifyContent: "center",
    width: 52,
  },
  compactNavIconWrap: {
    height: 26,
    width: 40,
  },
  navImage: {
    height: 39,
    width: 39,
  },
  compactNavImage: {
    height: 25,
    width: 25,
  },
  navItem: {
    alignItems: "center",
    borderRadius: 24,
    flex: 1,
    gap: 2,
    justifyContent: "center",
    minHeight: 58,
    minWidth: homeNavigationStyle.minimumTouchTarget,
    paddingHorizontal: 4,
    paddingVertical: 7,
  },
  compactNavItem: {
    gap: 1,
    minHeight: 42,
    paddingVertical: 3,
  },
  navLabel: {
    color: homeNavigationStyle.inactiveLabelColor,
    fontSize: 12,
    fontWeight: "900",
  },
  compactNavLabel: {
    fontSize: 9,
  },
  inactiveNavImage: {
    opacity: homeNavigationStyle.inactiveIconOpacity,
  },
  pointBadge: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 24,
    flexDirection: "row",
    gap: 7,
    minHeight: 48,
    paddingHorizontal: 12,
    ...cardShadow,
  },
  pointStar: {
    color: "#FFC72F",
    fontSize: 30,
    fontWeight: "900",
    lineHeight: 34,
    textShadowColor: "rgba(177, 113, 22, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 2,
  },
  pointText: {
    color: colors.ink,
    fontSize: 23,
    fontWeight: "900",
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  progressPill: {
    alignItems: "center",
    backgroundColor: "rgba(62, 58, 55, 0.78)",
    borderRadius: 18,
    height: 30,
    justifyContent: "center",
    minWidth: 72,
    paddingHorizontal: 14,
  },
  rewardBase: {
    backgroundColor: "#9B6A20",
    borderRadius: 3,
    height: 5,
    marginTop: 1,
    width: 29,
  },
  rewardCup: {
    alignItems: "center",
    backgroundColor: "#F4B72F",
    borderColor: "#9B6A20",
    borderRadius: 5,
    borderWidth: 2,
    height: 22,
    justifyContent: "center",
    width: 27,
  },
  rewardHandle: {
    borderColor: "#9B6A20",
    borderRadius: 8,
    borderWidth: 2,
    height: 15,
    position: "absolute",
    top: 5,
    width: 12,
  },
  rewardHandleLeft: {
    left: 0,
  },
  rewardHandleRight: {
    right: 0,
  },
  rewardIcon: {
    alignItems: "center",
    height: 34,
    justifyContent: "center",
    position: "relative",
    width: 38,
  },
  rewardStar: {
    backgroundColor: "#FFE37B",
    borderRadius: 4,
    height: 8,
    transform: [{ rotate: "45deg" }],
    width: 8,
  },
  rewardStem: {
    backgroundColor: "#9B6A20",
    height: 8,
    width: 8,
  },
  progressText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: "800",
  },
  questCopy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  questEyebrow: {
    color: "#61408D",
    fontSize: 19,
    fontWeight: "900",
  },
  questMascot: {
    height: 58,
    width: 44,
  },
  questTitle: {
    color: "#5A3790",
    fontSize: 22,
    fontWeight: "900",
    lineHeight: 27,
  },
  ratingStar: {
    fontSize: 28,
    fontWeight: "900",
    lineHeight: 31,
    marginHorizontal: 2,
    textShadowColor: "rgba(96, 67, 24, 0.24)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 2,
  },
  ratingStarActive: {
    color: "#FFD333",
  },
  ratingStarIdle: {
    color: "#CFD2CE",
  },
  regionCard: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderColor: colors.white,
    borderRadius: homeRegionCardStyle.borderRadius,
    borderWidth: homeRegionCardStyle.borderWidth,
    minHeight: 104,
    overflow: "hidden",
    ...cardShadow,
  },
  regionBackgroundFill: {
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  regionContent: {
    alignItems: "center",
    alignSelf: "stretch",
    flex: 1,
    gap: 4,
    justifyContent: "center",
    height: "100%",
    minHeight: 104,
    overflow: "hidden",
    paddingBottom: 8,
    paddingHorizontal: 10,
    paddingTop: 10,
    position: "relative",
    width: "100%",
  },
  regionBackgroundImage: {
    borderRadius: homeRegionCardStyle.borderRadius,
  },
  regionGrid: {
    columnGap: homeLandscapeLayout.regionGridGap,
    flexDirection: "row",
    flexWrap: "nowrap",
    justifyContent: "space-between",
    rowGap: homeLandscapeLayout.regionGridGap,
  },
  regionOverlay: {
    backgroundColor: "rgba(44, 28, 15, 0.18)",
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  regionTitle: {
    color: colors.white,
    fontSize: 28,
    fontWeight: "900",
    lineHeight: 34,
    ...textShadow,
  },
  regionColumn: {
    gap: 8,
    minWidth: 0,
    width: "100%",
  },
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  screen: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 4,
  },
  sectionHeaderIcon: {
    height: 32,
    width: 27,
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: "900",
    lineHeight: 29,
  },
  speechBubble: {
    alignItems: "center",
    aspectRatio: 512 / 353,
    justifyContent: "center",
    left: "26%",
    position: "absolute",
    top: "22%",
    width: "17.2%",
  },
  speechBubbleImage: {
    bottom: 0,
    height: "100%",
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
    width: "100%",
  },
  speechText: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: "900",
    left: "12%",
    lineHeight: 29,
    position: "absolute",
    textAlign: "center",
    top: "24%",
    width: "76%",
    zIndex: 1,
  },
  starRating: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    minHeight: 40,
  },
  startButton: {
    alignItems: "center",
    backgroundColor: "#7DCA32",
    borderColor: colors.white,
    borderRadius: 28,
    borderWidth: 4,
    minHeight: 52,
    justifyContent: "center",
    minWidth: 126,
    paddingHorizontal: 18,
    shadowColor: "#497E1C",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
  },
  startButtonText: {
    color: colors.white,
    fontSize: 25,
    fontWeight: "900",
    ...textShadow,
  },
  todayQuest: {
    alignItems: "center",
    backgroundColor: "#E5CDFB",
    borderColor: colors.white,
    borderRadius: 12,
    borderWidth: 3,
    flexDirection: "row",
    gap: 10,
    minHeight: 60,
    paddingHorizontal: 10,
    paddingVertical: 4,
    ...cardShadow,
  },
  topBar: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  topStatus: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  toolbarMapIcon: {
    height: 32,
    position: "relative",
    width: 38,
  },
  toolbarMapPanel: {
    borderColor: colors.white,
    borderRadius: 3,
    borderWidth: 2,
    height: 27,
    position: "absolute",
    top: 8,
    width: 16,
  },
  toolbarMapPanelLeft: {
    backgroundColor: "#87C95D",
    left: 1,
    transform: [{ rotate: "-6deg" }],
  },
  toolbarMapPanelMiddle: {
    backgroundColor: "#FFE175",
    left: 13,
    transform: [{ rotate: "5deg" }],
  },
  toolbarMapPanelRight: {
    backgroundColor: "#55AEE2",
    left: 25,
    transform: [{ rotate: "-5deg" }],
  },
  toolbarMapPin: {
    alignItems: "center",
    backgroundColor: "#F2672C",
    borderColor: colors.white,
    borderRadius: 12,
    borderWidth: 2,
    height: 24,
    justifyContent: "center",
    left: 23,
    position: "absolute",
    top: 0,
    width: 24,
  },
  toolbarMapPinCore: {
    backgroundColor: colors.white,
    borderRadius: 4,
    height: 7,
    width: 7,
  },
  wordmark: {
    height: 50,
    maxWidth: "58%",
    width: 220,
  },
});
