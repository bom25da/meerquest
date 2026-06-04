export const colors = {
  background: '#FFF3D6',
  surface: '#FFFDF7',
  surfaceStrong: '#FFE5A5',
  ink: '#3F2D24',
  muted: '#7D6A59',
  orange: '#F27A3D',
  orangeSoft: '#FFD2B8',
  green: '#79B84A',
  greenSoft: '#DFF3CB',
  sky: '#3A9BC4',
  skySoft: '#CFEFFD',
  yellow: '#F7C948',
  rose: '#F8A7A1',
  sand: '#D9A85A',
  burrow: '#8B5E34',
  white: '#FFFFFF',
} as const;

export const categoryColors = {
  math: colors.green,
  language: colors.sky,
  social: colors.orange,
  safety: colors.yellow,
} as const;
