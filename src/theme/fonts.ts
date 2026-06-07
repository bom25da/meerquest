import { Text, TextInput, type TextStyle } from 'react-native';

export const fontFamilies = {
  kkukkukk: 'MemomentKkukkukk',
} as const;

export const kkukkukkTextStyle = {
  fontFamily: fontFamilies.kkukkukk,
  fontWeight: '400',
} satisfies Pick<TextStyle, 'fontFamily' | 'fontWeight'>;

type ComponentWithDefaultStyle<T> = T & {
  defaultProps?: {
    style?: unknown;
  };
};

let hasAppliedFontDefaults = false;

export function applyKkukkukkFontDefaults() {
  if (hasAppliedFontDefaults) {
    return;
  }

  const textComponent = Text as ComponentWithDefaultStyle<typeof Text>;
  textComponent.defaultProps = textComponent.defaultProps ?? {};
  textComponent.defaultProps.style = [kkukkukkTextStyle, textComponent.defaultProps.style].filter(Boolean);

  const textInputComponent = TextInput as ComponentWithDefaultStyle<typeof TextInput>;
  textInputComponent.defaultProps = textInputComponent.defaultProps ?? {};
  textInputComponent.defaultProps.style = [
    kkukkukkTextStyle,
    textInputComponent.defaultProps.style,
  ].filter(Boolean);

  hasAppliedFontDefaults = true;
}
