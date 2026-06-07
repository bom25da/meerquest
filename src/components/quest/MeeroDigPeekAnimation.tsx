import { useEffect, useState } from 'react';
import { Image, type ImageSourcePropType, type ImageStyle, type StyleProp } from 'react-native';

const meeroDigPeekFrames: ImageSourcePropType[] = [
  require('../../../assets/images/characters/animations/meero-dig-peek/meero-dig-peek-01.png'),
  require('../../../assets/images/characters/animations/meero-dig-peek/meero-dig-peek-02.png'),
  require('../../../assets/images/characters/animations/meero-dig-peek/meero-dig-peek-03.png'),
  require('../../../assets/images/characters/animations/meero-dig-peek/meero-dig-peek-04.png'),
  require('../../../assets/images/characters/animations/meero-dig-peek/meero-dig-peek-05.png'),
];

const defaultFrameMs = 190;

interface MeeroDigPeekAnimationProps {
  frameMs?: number;
  style?: StyleProp<ImageStyle>;
}

export function MeeroDigPeekAnimation({
  frameMs = defaultFrameMs,
  style,
}: MeeroDigPeekAnimationProps) {
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setFrameIndex((currentFrameIndex) => (currentFrameIndex + 1) % meeroDigPeekFrames.length);
    }, frameMs);

    return () => clearInterval(intervalId);
  }, [frameMs]);

  return (
    <Image
      accessibilityLabel="땅굴에서 빼꼼 올라오는 미어루"
      resizeMode="contain"
      source={meeroDigPeekFrames[frameIndex]}
      style={style}
    />
  );
}
