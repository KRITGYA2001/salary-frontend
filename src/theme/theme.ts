import { createTheme } from '@mui/material/styles';
import { colors, fonts, radius } from './tokens';

/** A small fractal-noise tile that gives the cream background a paper grain. */
const PAPER_GRAIN = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.35  0 0 0 0 0.28  0 0 0 0 0.16  0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`;

export const theme = createTheme({
  cssVariables: true,
  palette: {
    mode: 'light',
    primary: { main: colors.accent, dark: colors.accentHover, light: colors.accentSoft, contrastText: '#ffffff' },
    error: { main: colors.danger, light: colors.dangerSoft },
    warning: { main: colors.warning, light: colors.warningSoft },
    text: { primary: colors.ink, secondary: colors.inkMuted },
    background: { default: colors.paper, paper: colors.surface },
    divider: colors.line,
  },
  shape: { borderRadius: radius.control },
  typography: {
    fontFamily: fonts.sans,
    h1: { fontSize: '1.875rem', fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.15 },
    h2: { fontSize: '1.25rem', fontWeight: 600, letterSpacing: '-0.01em' },
    h3: { fontSize: '1rem', fontWeight: 600 },
    body1: { fontSize: '0.9375rem', lineHeight: 1.6 },
    body2: { fontSize: '0.875rem', lineHeight: 1.55 },
    button: { textTransform: 'none', fontWeight: 600, letterSpacing: 0 },
    overline: { fontFamily: fonts.mono, letterSpacing: '0.06em' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: colors.paper, fontFeatureSettings: '"tnum" 1, "cv11" 1' },
        // The grain sits on a fixed, click-through layer so it never repaints with scrolling content.
        'body::before': {
          content: '""',
          position: 'fixed',
          inset: 0,
          zIndex: -1,
          pointerEvents: 'none',
          backgroundImage: PAPER_GRAIN,
          opacity: 0.16,
        },
        '*:focus-visible': { outline: `2px solid ${colors.accent}`, outlineOffset: 2 },
        '@media (prefers-reduced-motion: reduce)': {
          '*, *::before, *::after': { animationDuration: '0.01ms !important', transitionDuration: '0.01ms !important' },
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { '&:active': { transform: 'translateY(1px)' } },
        contained: { '&:hover': { backgroundColor: colors.accentHover } },
        outlined: {
          borderColor: colors.lineStrong,
          color: colors.ink,
          '&:hover': { borderColor: colors.ink, backgroundColor: colors.surface },
        },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { backgroundImage: 'none', border: `1px solid ${colors.line}`, borderRadius: radius.surface },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { backgroundColor: colors.surface, '& fieldset': { borderColor: colors.lineStrong } },
      },
    },
    MuiChip: { styleOverrides: { root: { fontWeight: 500, borderRadius: radius.control } } },
    MuiSkeleton: { defaultProps: { animation: 'wave' } },
  },
});
