export const tokens = {
  colors: {
    brand: {
      gold: '#C8A951',
      goldLight: '#E8D48B',
      goldDark: '#A88B39',
      green: '#007749',
      greenBright: '#00A859',
      greenDark: '#005A37',
    },
    bg: {
      deep: '#0A0A0B',
      base: '#111113',
      elevated: '#18181B',
    },
    surface: {
      default: '#1C1C1F',
      hover: '#252529',
      active: '#2D2D32',
      elevated: '#2A2A2E',
    },
    text: {
      primary: '#E8E8E3',
      secondary: '#999994',
      tertiary: '#666663',
      disabled: '#3D3D40',
      inverse: '#0A0A0B',
      onAccent: '#0A0A0B',
    },
    semantic: {
      success: '#00A859',
      successBg: 'rgba(0, 168, 89, 0.1)',
      error: '#DC2626',
      errorBg: 'rgba(220, 38, 38, 0.1)',
      warning: '#F59E0B',
      warningBg: 'rgba(245, 158, 11, 0.1)',
      info: '#3B82F6',
      infoBg: 'rgba(59, 130, 246, 0.1)',
    },
    border: {
      default: '#2D2D30',
      hover: '#3D3D40',
    },
  },
  radius: {
    none: '0',
    xs: '6px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    pill: '9999px',
    full: '50%',
  },
  shadows: {
    sm: '0 1px 2px rgba(0,0,0,0.3)',
    md: '0 4px 12px rgba(0,0,0,0.4)',
    lg: '0 8px 24px rgba(0,0,0,0.5)',
    xl: '0 16px 48px rgba(0,0,0,0.6)',
    glowGold: '0 0 20px rgba(200,169,81,0.15)',
    glowGreen: '0 0 20px rgba(0,119,73,0.15)',
  },
  motion: {
    easeOutExpo: [0.16, 1, 0.3, 1] as const,
    easeInOut: [0.4, 0, 0.2, 1] as const,
    durationFast: 150,
    durationNormal: 250,
    durationSlow: 400,
  },
  fonts: {
    display: "'DM Sans', system-ui, sans-serif",
    body: "'Inter', system-ui, sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', monospace",
  },
} as const;

export type TokenColors = typeof tokens.colors;
export type TokenRadius = typeof tokens.radius;
export type TokenShadows = typeof tokens.shadows;
export type TokenMotion = typeof tokens.motion;
export type TokenFonts = typeof tokens.fonts;
