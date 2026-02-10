// Enhanced Theme System - Phase 1+2: Professional UI Polish - UPDATED FONT SIZES
// Extended color palette, fluid typography, refined spacing and shadows

export const theme = {
  colors: {
    // Brand colors
    primary: '#1abc9c',
    primaryHover: '#16a085',
    primaryLight: '#48c9b0',
    primaryDark: '#138d75',
    
    secondary: '#2c3e50',
    secondaryHover: '#1a252f',
    secondaryLight: '#34495e',
    secondaryDark: '#1c2833',
    
    // Semantic colors
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
    
    // Neutral scale (50-900)
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
    
    // Surface colors
    white: '#ffffff',
    light: '#f8f9fa',
    lightHover: '#e9ecef',
    gray: '#6c757d',
    grayLight: '#adb5bd',
    dark: '#212529',
    black: '#000000',
    
    // UI surface colors
    background: '#ffffff',
    surface: '#ffffff',
    surfaceHover: '#f8f9fa',
    border: '#dee2e6',
    borderLight: '#e9ecef',
    borderDark: '#adb5bd',
    
    // Text colors
    text: {
      primary: '#212529',
      secondary: '#6c757d',
      tertiary: '#adb5bd',
      inverse: '#ffffff',
      link: '#1abc9c',
      linkHover: '#16a085',
    },
    
    // Focus and interaction states
    focus: '#1abc9c',
    focusRing: 'rgba(26, 188, 156, 0.25)',
    overlay: 'rgba(0, 0, 0, 0.5)',
    overlayLight: 'rgba(0, 0, 0, 0.25)',
  },
  
  // Fluid typography using clamp() for responsive scaling - INCREASED SIZES
  fonts: {
    heading: '"Montserrat", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    body: '"Lato", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: '"Fira Code", "Courier New", monospace',
  },
  
  fontSizes: {
    xs: 'clamp(0.8125rem, 0.75rem + 0.3vw, 0.875rem)',    // 13-14px (was 11-12px)
    sm: 'clamp(0.9375rem, 0.875rem + 0.3vw, 1rem)',       // 15-16px (was 13-14px)
    base: 'clamp(1.0625rem, 1rem + 0.3vw, 1.125rem)',     // 17-18px (was 15-16px)
    lg: 'clamp(1.1875rem, 1.125rem + 0.3vw, 1.25rem)',    // 19-20px (was 17-18px)
    xl: 'clamp(1.3125rem, 1.25rem + 0.3vw, 1.375rem)',    // 21-22px (was 19-20px)
    '2xl': 'clamp(1.5rem, 1.375rem + 0.625vw, 1.625rem)', // 24-26px (was 22-24px)
    '3xl': 'clamp(1.875rem, 1.625rem + 1.25vw, 2rem)',    // 30-32px (was 28-30px)
    '4xl': 'clamp(2.125rem, 1.875rem + 1.25vw, 2.375rem)',// 34-38px (was 32-36px)
    '5xl': 'clamp(2.625rem, 2.125rem + 2.5vw, 3.125rem)', // 42-50px (was 40-48px)
    '6xl': 'clamp(3.125rem, 2.625rem + 2.5vw, 3.875rem)', // 50-62px (was 48-60px)
  },
  
  fontWeights: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  
  // Line heights optimized for readability
  lineHeights: {
    tight: 1.1,
    snug: 1.25,
    normal: 1.5,
    relaxed: 1.625,
    loose: 1.75,
  },
  
  // Letter spacing for headings and UI text
  letterSpacings: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
  
  // Consistent spacing scale (4px base unit)
  spacing: {
    0: '0',
    px: '1px',
    0.5: '0.125rem',   // 2px
    1: '0.25rem',      // 4px
    1.5: '0.375rem',   // 6px
    2: '0.5rem',       // 8px
    2.5: '0.625rem',   // 10px
    3: '0.75rem',      // 12px
    3.5: '0.875rem',   // 14px
    4: '1rem',         // 16px
    5: '1.25rem',      // 20px
    6: '1.5rem',       // 24px
    7: '1.75rem',      // 28px
    8: '2rem',         // 32px
    9: '2.25rem',      // 36px
    10: '2.5rem',      // 40px
    12: '3rem',        // 48px
    14: '3.5rem',      // 56px
    16: '4rem',        // 64px
    20: '5rem',        // 80px
    24: '6rem',        // 96px
    28: '7rem',        // 112px
    32: '8rem',        // 128px
  },
  
  // Refined border radius scale
  borderRadius: {
    none: '0',
    sm: '0.25rem',     // 4px
    base: '0.5rem',    // 8px
    md: '0.625rem',    // 10px
    lg: '0.75rem',     // 12px
    xl: '1rem',        // 16px
    '2xl': '1.25rem',  // 20px
    '3xl': '1.5rem',   // 24px
    full: '9999px',
  },
  
  // Enhanced shadow system with elevation
  shadows: {
    none: 'none',
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
    base: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    md: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
    lg: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    xl: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
    outline: '0 0 0 3px rgba(26, 188, 156, 0.25)',
    focus: '0 0 0 3px rgba(26, 188, 156, 0.25)',
  },
  
  // Refined transitions and timing functions
  transitions: {
    fast: '0.15s cubic-bezier(0.4, 0, 0.2, 1)',
    base: '0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    slower: '0.5s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  
  // Custom easing curves
  easings: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  
  // Responsive breakpoints
  breakpoints: {
    xs: '475px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  
  // Z-index scale for layering
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },
  
  // Container max widths
  containerSizes: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1400px',
    full: '100%',
  },
};
