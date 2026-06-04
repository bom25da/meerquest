const fs = require('fs');
const path = require('path');
const { withFinalizedMod } = require('@expo/config-plugins');

const MAX_WIDTH_ID = 'MQResponsiveSplashMaxWidth';
const MAX_HEIGHT_ID = 'MQResponsiveSplashMaxHeight';
const ASPECT_RATIO_ID = 'MQResponsiveSplashAspectRatio';
const DEFAULT_MAX_SIZE_RATIO = 0.8;

function makeSplashStoryboardResponsive(storyboard, options = {}) {
  const maxSizeRatio = formatRatio(options.maxSizeRatio ?? options.widthRatio ?? DEFAULT_MAX_SIZE_RATIO);
  const cleanedStoryboard = removeExistingResponsiveConstraints(storyboard);
  const storyboardWithAspectRatio = injectAspectRatioConstraint(cleanedStoryboard);

  return injectMaxSizeConstraints(storyboardWithAspectRatio, maxSizeRatio);
}

function withResponsiveSplashScreen(config, options = {}) {
  return withFinalizedMod(config, [
    'ios',
    async (modConfig) => {
      const storyboardPath = findSplashStoryboardPath(modConfig.modRequest.platformProjectRoot);
      const storyboard = fs.readFileSync(storyboardPath, 'utf8');
      const nextStoryboard = makeSplashStoryboardResponsive(storyboard, options);

      fs.writeFileSync(storyboardPath, nextStoryboard);

      return modConfig;
    },
  ]);
}

function injectAspectRatioConstraint(storyboard) {
  return storyboard.replace(
    /(<imageView\b[^>]*id="EXPO-SplashScreen"[^>]*>)([\s\S]*?)(\s*<\/imageView>)/,
    (_match, openingTag, body, closingTag) => {
      const aspectConstraint = `<constraint firstAttribute="width" secondItem="EXPO-SplashScreen" secondAttribute="height" multiplier="1:1" id="${ASPECT_RATIO_ID}"/>`;

      if (body.includes('<constraints>')) {
        return `${openingTag}${body.replace(
          /(\s*<\/constraints>)/,
          `\n                                    ${aspectConstraint}$1`,
        )}${closingTag}`;
      }

      return `${openingTag}${body.replace(
        /(\s*<rect\b[^>]*\/>)/,
        `$1
                                <constraints>
                                    ${aspectConstraint}
                                </constraints>`,
      )}${closingTag}`;
    },
  );
}

function injectMaxSizeConstraints(storyboard, maxSizeRatio) {
  const constraints = `
                            <constraint firstItem="EXPO-SplashScreen" firstAttribute="width" relation="lessThanOrEqual" secondItem="EXPO-ContainerView" secondAttribute="width" multiplier="${maxSizeRatio}" id="${MAX_WIDTH_ID}"/>
                            <constraint firstItem="EXPO-SplashScreen" firstAttribute="height" relation="lessThanOrEqual" secondItem="EXPO-ContainerView" secondAttribute="height" multiplier="${maxSizeRatio}" id="${MAX_HEIGHT_ID}"/>`;

  return storyboard.replace(
    /(<constraints>\s*)([\s\S]*?firstAttribute="centerX"[\s\S]*?firstAttribute="centerY"[\s\S]*?)(\s*<\/constraints>)/,
    (_match, openingTag, existingConstraints, closingTag) =>
      `${openingTag}${existingConstraints}${constraints}${closingTag}`,
  );
}

function removeExistingResponsiveConstraints(storyboard) {
  return [MAX_WIDTH_ID, MAX_HEIGHT_ID, ASPECT_RATIO_ID].reduce(
    (result, id) => result.replace(new RegExp(`\\s*<constraint[^>]+id="${id}"[^>]*/>`, 'g'), ''),
    storyboard,
  );
}

function findSplashStoryboardPath(platformProjectRoot) {
  const entries = fs.readdirSync(platformProjectRoot, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const candidate = path.join(platformProjectRoot, entry.name, 'SplashScreen.storyboard');
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error(`Splash screen storyboard was not found under ${platformProjectRoot}`);
}

function formatRatio(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue) || numericValue <= 0 || numericValue > 1) {
    return String(DEFAULT_MAX_SIZE_RATIO);
  }

  return String(numericValue);
}

module.exports = withResponsiveSplashScreen;
module.exports.makeSplashStoryboardResponsive = makeSplashStoryboardResponsive;
