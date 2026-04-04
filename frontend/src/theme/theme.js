// Enhanced Theme System - Phase 1+2+3: Professional Adoption Platform Redesign
// All original tokens preserved. New tokens marked with // NEW

export const theme = {
  colors: {
    // Brand colors — warmed from cold teal to rich terracotta-tinged teal
    primary: '#2a9d8f',
    primaryHover: '#21867a',
    primaryLight: '#52b5aa',
    primaryDark: '#1a6b60',

    secondary: '#3d2c2c',        // warm espresso (was cold navy #2c3e50)
    secondaryHover: '#2b1f1f',
    secondaryLight: '#5c4444',
    secondaryDark: '#1e1414',

    // Semantic colors (unchanged)
    success: '#27ae60',
    successHover: '#229954',
    successLight: '#52be80',

    warning: '#f39c12',
    warningHover: '#d68910',
    warningLight: '#f5b041',

    danger: '#e74c3c',
    dangerHover: '#c0392b',
    dangerLight: '#ec7063',

    info: '#3498db',
    infoHover: '#2980b9',
    infoLight: '#5dade2',

    // NEW: Adoption status tokens
    statusAvailable: '#2a9d8f',
    statusAvailableLight: '#e8f5f4',
    statusAvailableText: '#1a6b60',
    statusAdopted: '#6c757d',
    statusAdoptedLight: '#f0f0f0',
    statusAdoptedText: '#495057',
    statusPending: '#f39c12',
    statusPendingLight: '#fff8e7',
    statusPendingText: '#8a5700',
    statusFostered: '#9b59b6',
    statusFosteredLight: '#f5eeff',
    statusFosteredText: '#6c3483',

    // NEW: Warm surface tokens
    cream: '#faf8f5',
    creamDark: '#f4f1ec',
    creamDeep: '#ede9e2',
    warmBorder: '#e2ddd7',

    // NEW: Terracotta CTA accent
    accent: '#e76f51',
    accentHover: '#cf5c3d',
    accentLight: '#fde8e2',
    accentText: '#ffffff',

    // Neutral scale (unchanged)
    neutral: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
    },

    // Surface colors — warmed
    white: '#ffffff',
    light: '#faf8f5',
    lightHover: '#f0ede8',
    gray: '#6c757d',
    grayLight: '#adb5bd',
    dark: '#3d2c2c',
    black: '#1a1212',

    // UI surface colors — warmed
    background: '#faf8f5',
    surface: '#ffffff',
    surfaceHover: '#faf8f5',
    border: '#e2ddd7',
    borderLight: '#ede9e2',
    borderDark: '#c8c2bb',

    // Text colors
    text: {
      primary: '#2d2220',
      secondary: '#6b5e59',
      tertiary: '#a39490',
      inverse: '#ffffff',
      link: '#2a9d8f',
      linkHover: '#1a6b60',
    },

    focus: '#2a9d8f',
    focusRing: 'rgba(42, 157, 143, 0.25)',
    overlay: 'rgba(61, 44, 44, 0.5)',
    overlayLight: 'rgba(61, 44, 44, 0.2)',
  },

  // NEW: Font stack updated to warm, editorial pairing
  fonts: {
    heading: '"Playfair Display", "Georgia", serif',
    body: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    mono: '"Fira Code", "Courier New", monospace',
  },

  // Fluid typography using clamp() — all original sizes preserved
  fontSizes: {
    xs:    'clamp(0.6875rem, 0.65rem + 0.2vw, 0.75rem)',
    sm:    'clamp(0.8125rem, 0.75rem + 0.3vw, 0.875rem)',
    base:  'clamp(0.9375rem, 0.875rem + 0.3vw, 1rem)',
    lg:    'clamp(1.0625rem, 1rem + 0.3vw, 1.125rem)',
    xl:    'clamp(1.1875rem, 1.125rem + 0.3vw, 1.25rem)',
    '2xl': 'clamp(1.375rem, 1.25rem + 0.625vw, 1.5rem)',
    '3xl': 'clamp(1.75rem, 1.5rem + 1.25vw, 1.875rem)',
    '4xl': 'clamp(2rem, 1.75rem + 1.25vw, 2.25rem)',
    '5xl': 'clamp(2.5rem, 2rem + 2.5vw, 3rem)',
    '6xl': 'clamp(3rem, 2.5rem + 2.5vw, 3.75rem)',
    // NEW: hero size for homepage headline
    hero:  'clamp(2.75rem, 1rem + 5vw, 4.5rem)',
  },

  fontWeights: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },

  lineHeights: {
    tight: 1.1,
    snug: 1.25,
    normal: 1.5,
    relaxed: 1.625,
    loose: 1.75,
  },

  letterSpacings: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },

  // Consistent spacing scale (4px base unit) — unchanged
  spacing: {
    0: '0',
    px: '1px',
    0.5: '0.125rem',
    1: '0.25rem',
    1.5: '0.375rem',
    2: '0.5rem',
    2.5: '0.625rem',
    3: '0.75rem',
    3.5: '0.875rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    7: '1.75rem',
    8: '2rem',
    9: '2.25rem',
    10: '2.5rem',
    12: '3rem',
    14: '3.5rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    28: '7rem',
    32: '8rem',
  },

  // Border radius — unchanged
  borderRadius: {
    none: '0',
    sm: '0.25rem',
    base: '0.5rem',
    md: '0.625rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.25rem',
    '3xl': '1.5rem',
    full: '9999px',
  },

  // Shadows — warm-tinted (was pure black rgba)
  shadows: {
    none: 'none',
    xs: '0 1px 2px 0 rgba(61, 44, 44, 0.05)',
    sm: '0 1px 3px 0 rgba(61, 44, 44, 0.08), 0 1px 2px -1px rgba(61, 44, 44, 0.06)',
    base: '0 4px 6px -1px rgba(61, 44, 44, 0.08), 0 2px 4px -2px rgba(61, 44, 44, 0.06)',
    md: '0 10px 20px -4px rgba(61, 44, 44, 0.1), 0 4px 6px -4px rgba(61, 44, 44, 0.06)',
    lg: '0 20px 32px -8px rgba(61, 44, 44, 0.12), 0 8px 10px -6px rgba(61, 44, 44, 0.06)',
    xl: '0 32px 56px -12px rgba(61, 44, 44, 0.18)',
    '2xl': '0 32px 56px -12px rgba(61, 44, 44, 0.25)',
    // NEW: warm card-specific shadows
    card: '0 2px 8px rgba(61,44,44,0.07), 0 8px 24px rgba(61,44,44,0.06)',
    cardHover: '0 6px 16px rgba(61,44,44,0.1), 0 16px 40px rgba(61,44,44,0.09)',
    inner: 'inset 0 2px 4px 0 rgba(61, 44, 44, 0.05)',
    outline: '0 0 0 3px rgba(42, 157, 143, 0.25)',
    focus: '0 0 0 3px rgba(42, 157, 143, 0.25)',
  },

  // Transitions — original preserved + NEW spring
  transitions: {
    fast: '0.15s cubic-bezier(0.4, 0, 0.2, 1)',
    base: '0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    slower: '0.5s cubic-bezier(0.4, 0, 0.2, 1)',
    // NEW: spring easing for card lift animations
    spring: '0.4s cubic-bezier(0.16, 1, 0.3, 1)',
  },

  easings: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    // NEW
    spring: 'cubic-bezier(0.16, 1, 0.3, 1)',
  },

  // Breakpoints — unchanged
  breakpoints: {
    xs: '475px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },

  containerSizes: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1400px',
    full: '100%',
  },
};
