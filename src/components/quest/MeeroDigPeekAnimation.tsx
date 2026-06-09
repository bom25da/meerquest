import { useEffect, useState } from 'react';
import { Image, type ImageSourcePropType, type ImageStyle, type StyleProp } from 'react-native';

const meeroDigPeekFrames: ImageSourcePropType[] = [
  require('../../../assets/images/characters/animations/meero-dig-peek-smooth/meero-dig-peek-smooth-01.png'),
  require('../../../assets/images/characters/animations/meero-dig-peek-smooth/meero-dig-peek-smooth-02.png'),
  require('../../../assets/images/characters/animations/meero-dig-peek-smooth/meero-dig-peek-smooth-03.png'),
  require('../../../assets/images/characters/animations/meero-dig-peek-smooth/meero-dig-peek-smooth-04.png'),
  require('../../../assets/images/characters/animations/meero-dig-peek-smooth/meero-dig-peek-smooth-05.png'),
  require('../../../assets/images/characters/animations/meero-dig-peek-smooth/meero-dig-peek-smooth-06.png'),
  require('../../../assets/images/characters/animations/meero-dig-peek-smooth/meero-dig-peek-smooth-07.png'),
  require('../../../assets/images/characters/animations/meero-dig-peek-smooth/meero-dig-peek-smooth-08.png'),
  require('../../../assets/images/characters/animations/meero-dig-peek-smooth/meero-dig-peek-smooth-09.png'),
  require('../../../assets/images/characters/animations/meero-dig-peek-smooth/meero-dig-peek-smooth-10.png'),
  require('../../../assets/images/characters/animations/meero-dig-peek-smooth/meero-dig-peek-smooth-11.png'),
  require('../../../assets/images/characters/animations/meero-dig-peek-smooth/meero-dig-peek-smooth-12.png'),
];

const defaultFrameMs = 75;

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
