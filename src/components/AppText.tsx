import { Text as NativeText, type TextProps } from 'react-native';

import { kkukkukkTextStyle } from '@/src/theme/fonts';

export function AppText({ style, ...props }: TextProps) {
  return <NativeText {...props} style={[kkukkukkTextStyle, style]} />;
}
