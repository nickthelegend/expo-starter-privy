export const Theme = {
  colors: {
    primary: '#6241E8',
    secondary: '#795CEB',
    background: '#000000',
    surface: '#181121',
    border: '#1E1E1E',
    text: '#FFFFFF',
    textMuted: 'rgba(255,255,255,0.6)',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
  },
  gradients: {
    primary: ['#6241E8', '#795CEB'],
    dark: ['#000000', '#181121'],
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
  shadows: {
    glow: {
      shadowColor: '#6241E8',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 5,
    },
  },
};

export type ThemeType = typeof Theme;
