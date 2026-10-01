import { TextStyle } from 'react-native';

export const fontFamilies = {
  regular: 'Inter-Regular',
  medium: 'Inter-Medium',
  semiBold: 'Inter-SemiBold',
  bold: 'Inter-Bold',
};

export const typography: Record<string, TextStyle> = {
  displayLg: {
    fontFamily: fontFamilies.bold,
    fontSize: 44,
    lineHeight: 52,
    letterSpacing: -0.88, // -0.02em
  },
  headlineLg: {
    fontFamily: fontFamilies.bold,
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.32, // -0.01em
  },
  headlineLgMobile: {
    fontFamily: fontFamilies.bold,
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: -0.26, // -0.01em
  },
  headlineMd: {
    fontFamily: fontFamilies.semiBold,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: 0,
  },
  titleLg: {
    fontFamily: fontFamilies.semiBold,
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: 0,
  },
  titleMd: {
    fontFamily: fontFamilies.semiBold,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 0.16, // 0.01em
  },
  bodyLg: {
    fontFamily: fontFamilies.regular,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.16, // 0.01em
  },
  bodyMd: {
    fontFamily: fontFamilies.regular,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.28, // 0.02em
  },
  bodySm: {
    fontFamily: fontFamilies.regular,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.24, // 0.02em
  },
  labelLg: {
    fontFamily: fontFamilies.semiBold,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.14, // 0.01em
  },
  labelMd: {
    fontFamily: fontFamilies.medium,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.48, // 0.04em
  },
  labelSm: {
    fontFamily: fontFamilies.medium,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.55, // 0.05em
  },
};
