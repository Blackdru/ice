export const colors = {
  background: '#0F0F23',
  backgroundLight: '#1A1D3A',
  primary: '#00E5FF',
  primaryLight: '#1E2A4A',
  card: '#1A1D3A',
  textPrimary: '#FFFFFF',
  textSecondary: '#A0AEC0',
  textTertiary: '#718096',
  border: '#2D3748',
  shadow: '#000000',
  favorite: '#FF6B9D',
  favoriteLight: '#2D2640',
  success: '#10B981',
  white: '#FFFFFF',
  overlay: 'rgba(0,0,0,0.04)',
  accent: '#00E5FF',

  // Gradient palette — use these instead of hardcoding hex values
  gradientPink: '#FF6B9D',
  gradientPurple: '#C471ED',
  gradientCyan: '#00E5FF',
  gradientOrange: '#FF8C42',
  gradientYellow: '#FFD93D',
  gradientCyanAlt: '#00D9FF',
};

/** Standard 3-color gradient used for borders, backgrounds, etc. */
export const gradientMain: [string, string, string] = ['#FF6B9D', '#C471ED', '#00E5FF'];

/** Warm gradient for favorites / hearts */
export const gradientWarm: [string, string] = ['#FF6B9D', '#FF8C42'];

export const categoryColors: Record<string, {bg: string; accent: string}> = {
  deep: {bg: '#2D3561', accent: '#00E5FF'},
  funny: {bg: '#3D3020', accent: '#FFD93D'},
  first_date: {bg: '#3D2035', accent: '#FF6B9D'},
  couples: {bg: '#3D2020', accent: '#FF6B9D'},
  friends: {bg: '#203D2A', accent: '#10B981'},
  party: {bg: '#2D2561', accent: '#C471ED'},
  hypothetical: {bg: '#352D61', accent: '#C471ED'},
  personal_growth: {bg: '#20353D', accent: '#00E5FF'},
  weird: {bg: '#3D3520', accent: '#FFD93D'},
  random: {bg: '#2D2D35', accent: '#A0AEC0'},
};
