/** Design tokens: white surfaces on cream paper, one forest-green accent, warm ink for text. */
export const colors = {
  paper: '#faf6ec',
  paperDeep: '#f3ecdb',
  surface: '#ffffff',
  line: '#e6dcc6',
  lineStrong: '#d3c6a8',
  ink: '#25221c',
  inkMuted: '#655f52',
  accent: '#1f5f4a',
  accentHover: '#184c3b',
  accentSoft: '#e4efe7',
  danger: '#a63a2b',
  dangerSoft: '#f8e6e1',
  warning: '#8a5a12',
  warningSoft: '#f7ecd2',
} as const;

/** Single corner-radius scale used by every component. */
export const radius = { control: 8, surface: 12 } as const;

export const layout = { sidebarWidth: 248, contentMaxWidth: 1280 } as const;

export const fonts = {
  sans: '"Geist Variable", system-ui, -apple-system, "Segoe UI", sans-serif',
  mono: '"Geist Mono Variable", ui-monospace, "SFMono-Regular", monospace',
} as const;
