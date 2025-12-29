// Theme colors for the bna-ui components
// Based on the existing Theme.ts structure

export const Colors = {
  light: {
    // Main colors
    primary: '#6241E8',
    secondary: '#795CEB',
    background: '#FFFFFF',
    surface: '#F8F9FA',
    card: '#FFFFFF',
    
    // Text colors
    text: '#000000',
    textMuted: 'rgba(0,0,0,0.6)',
    
    // UI colors
    border: '#E5E7EB',
    icon: '#6B7280',
    
    // Status colors
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
  },
  dark: {
    // Main colors (using your existing dark theme)
    primary: '#6241E8',
    secondary: '#795CEB',
    background: '#000000',
    surface: '#181121',
    card: '#181121',
    
    // Text colors
    text: '#FFFFFF',
    textMuted: 'rgba(255,255,255,0.6)',
    
    // UI colors
    border: '#1E1E1E',
    icon: 'rgba(255,255,255,0.6)',
    
    // Status colors
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
  },
};

export type ColorsType = typeof Colors.light & typeof Colors.dark;