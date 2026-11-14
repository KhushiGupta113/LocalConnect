import { Text, type StyleProp, type TextProps, type TextStyle } from 'react-native';
import { colors, fontFamilies } from '../constants/theme';

type TextVariant =
  | 'display'
  | 'headlineLg'
  | 'headlineMd'
  | 'headlineSm'
  | 'bodyLg'
  | 'bodyMd'
  | 'bodySm'
  | 'labelLg'
  | 'labelMd'
  | 'labelSm';

type AppTextProps = TextProps & {
  variant?: TextVariant;
  color?: string;
  style?: StyleProp<TextStyle>;
};

const variantStyles: Record<TextVariant, TextStyle> = {
  display: {
    fontFamily: fontFamilies.bold,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.7,
  },
  headlineLg: {
    fontFamily: fontFamilies.semibold,
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.48,
  },
  headlineMd: {
    fontFamily: fontFamilies.semibold,
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: -0.3,
  },
  headlineSm: {
    fontFamily: fontFamilies.bold,
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: -0.18,
  },
  bodyLg: {
    fontFamily: fontFamilies.regular,
    fontSize: 16,
    lineHeight: 24,
  },
  bodyMd: {
    fontFamily: fontFamilies.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  bodySm: {
    fontFamily: fontFamilies.regular,
    fontSize: 13,
    lineHeight: 18,
  },
  labelLg: {
    fontFamily: fontFamilies.semibold,
    fontSize: 14,
    lineHeight: 20,
  },
  labelMd: {
    fontFamily: fontFamilies.semibold,
    fontSize: 12,
    lineHeight: 16,
  },
  labelSm: {
    fontFamily: fontFamilies.medium,
    fontSize: 11,
    lineHeight: 14,
  },
};

export function AppText({
  variant = 'bodyMd',
  color = colors.onSurface,
  style,
  ...rest
}: AppTextProps) {
  return (
    <Text style={[variantStyles[variant], { color }, style]} {...rest} />
  );
}
