import {Platform, TextStyle} from 'react-native';

const fontFamily = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'System',
});

export const typography: Record<string, TextStyle> = {
  h1: {
    fontFamily,
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  h2: {
    fontFamily,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
    letterSpacing: -0.3,
  },
  h3: {
    fontFamily,
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  body: {
    fontFamily,
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  bodyMedium: {
    fontFamily,
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
  },
  caption: {
    fontFamily,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  captionMedium: {
    fontFamily,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  small: {
    fontFamily,
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
  question: {
    fontFamily,
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 34,
    letterSpacing: -0.2,
  },
  followUp: {
    fontFamily,
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 26,
  },
};
