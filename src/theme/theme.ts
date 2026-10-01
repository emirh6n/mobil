import { palette } from './colors';
import { typography } from './typography';

export const spacing = {
  xs: 4,      // 0.25rem
  sm: 8,      // 0.5rem
  md: 16,     // 1rem
  lg: 24,     // 1.5rem
  xl: 32,     // 2rem
  gutterSm: 8,
  gutter: 16,
  margin: 16,
  marginTablet: 32,
};

export const rounded = {
  sm: 4,
  default: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const theme = {
  colors: palette,
  typography,
  spacing,
  rounded,
};
