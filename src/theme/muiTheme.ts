import { createTheme, type ThemeOptions } from "@mui/material/styles";
import { themeTokens, type ThemeMode } from "./theme";

declare module "@mui/material/styles" {
  interface TypeBackground {
    secondary: string;
    tertiary: string;
  }
}

export type ColorMode = ThemeMode;

// Geist font family configuration
const fontFamily = [
  'var(--font-geist-sans)',
  '-apple-system',
  'BlinkMacSystemFont',
  '"Segoe UI"',
  'Roboto',
  '"Helvetica Neue"',
  'Arial',
  'sans-serif',
].join(',');

const monoFontFamily = [
  'var(--font-geist-mono)',
  'Menlo',
  'Monaco',
  'Consolas',
  '"Liberation Mono"',
  '"Courier New"',
  'monospace',
].join(',');

const toRgbChannels = (color: string): string => {
  if (!color) return color;

  if (color.startsWith("rgb")) {
    const match = color.match(/rgba?\(([^)]+)\)/i);
    if (match && match[1]) {
      const [r = "0", g = "0", b = "0"] = match[1]
        .split(",")
        .map((part) => part.trim());
      return `${r} ${g} ${b}`;
    }
    return color;
  }

  const hex = color.replace("#", "");
  if (hex.length === 3) {
    const r = parseInt(hex[0] + hex[0], 16);
    const g = parseInt(hex[1] + hex[1], 16);
    const b = parseInt(hex[2] + hex[2], 16);
    return `${r} ${g} ${b}`;
  }

  if (hex.length === 6) {
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `${r} ${g} ${b}`;
  }

  return color;
};

const buildCssVariables = (mode: ThemeMode) => {
  const tokens = themeTokens[mode];

  return {
    "--color-primary-50": toRgbChannels(tokens.primary[50]),
    "--color-primary-100": toRgbChannels(tokens.primary[100]),
    "--color-primary-200": toRgbChannels(tokens.primary[200]),
    "--color-primary-300": toRgbChannels(tokens.primary[300]),
    "--color-primary-400": toRgbChannels(tokens.primary[400]),
    "--color-primary-500": toRgbChannels(tokens.primary[500]),
    "--color-primary-600": toRgbChannels(tokens.primary[600]),
    "--color-primary-700": toRgbChannels(tokens.primary[700]),
    "--color-primary-800": toRgbChannels(tokens.primary[800]),
    "--color-primary-900": toRgbChannels(tokens.primary[900]),
    "--background": toRgbChannels(tokens.background.primary),
    "--background-secondary": toRgbChannels(tokens.background.secondary),
    "--background-tertiary": toRgbChannels(tokens.background.tertiary),
    "--foreground": toRgbChannels(tokens.text.primary),
    "--foreground-secondary": toRgbChannels(tokens.text.secondary),
    "--foreground-tertiary": toRgbChannels(tokens.text.tertiary),
    "--foreground-muted": toRgbChannels(tokens.text.muted),
    "--border": toRgbChannels(tokens.border.light),
    "--border-medium": toRgbChannels(tokens.border.medium),
    "--border-dark": toRgbChannels(tokens.border.dark),
    "--card": toRgbChannels(tokens.card.background),
    "--card-background": toRgbChannels(tokens.card.background),
    "--card-border": toRgbChannels(tokens.card.border),
    "--card-foreground": toRgbChannels(tokens.card.foreground),
    "--status-success": toRgbChannels(tokens.status.success),
    "--status-warning": toRgbChannels(tokens.status.warning),
    "--status-error": toRgbChannels(tokens.status.error),
    "--status-info": toRgbChannels(tokens.status.info),
    "--accent": toRgbChannels(tokens.accent.blue),
    "--accent-primary": toRgbChannels(tokens.accent.blue),
    "--accent-foreground": toRgbChannels(tokens.accent.contrastText),
    "--accent-contrast": toRgbChannels(tokens.accent.contrastText),
    "--accent-secondary": toRgbChannels(tokens.accent.sky),
    "--popover": toRgbChannels(tokens.card.background),
    "--popover-foreground": toRgbChannels(tokens.card.foreground),
    "--secondary": toRgbChannels(tokens.background.secondary),
    "--secondary-foreground": toRgbChannels(tokens.text.secondary),
    "--muted": toRgbChannels(tokens.background.tertiary),
    "--muted-foreground": toRgbChannels(tokens.text.muted),
    "--destructive": toRgbChannels(tokens.status.error),
    "--destructive-foreground": toRgbChannels(tokens.accent.contrastText),
    "--input": toRgbChannels(tokens.border.medium),
    "--ring": toRgbChannels(tokens.primary[500]),
    "--primary": toRgbChannels(tokens.primary[500]),
    "--primary-foreground": toRgbChannels(tokens.accent.contrastText),
    "--radius": "0.5rem",
  } as Record<string, string>;
};

export function getMuiTheme(mode: ColorMode = "light") {
  const tokens = themeTokens[mode];

  const themeOptions: ThemeOptions = {
    palette: {
      mode,
      primary: {
        light: tokens.primary[300],
        main: tokens.primary[500],
        dark: tokens.primary[700],
        contrastText: tokens.accent.contrastText,
      },
      secondary: {
        light: tokens.accent.sky,
        main: tokens.accent.blue,
        dark: tokens.primary[700],
        contrastText: tokens.accent.contrastText,
      },
      background: {
        default: tokens.background.primary,
        paper: tokens.background.secondary,
        secondary: tokens.background.secondary,
        tertiary: tokens.background.tertiary,
      },
      text: {
        primary: tokens.text.primary,
        secondary: tokens.text.secondary,
      },
      divider: tokens.border.medium,
      success: {
        main: tokens.status.success,
        contrastText: '#ffffff',
      },
      warning: {
        main: tokens.status.warning,
        contrastText: '#1f2937',
      },
      error: {
        main: tokens.status.error,
        contrastText: '#ffffff',
      },
      info: {
        main: tokens.status.info,
        contrastText: tokens.accent.contrastText,
      },
    },
    shape: {
      borderRadius: 8,
    },
    typography: {
      fontFamily,
      h1: { 
        fontWeight: 700,
        letterSpacing: '-0.025em',
      },
      h2: { 
        fontWeight: 700,
        letterSpacing: '-0.025em',
      },
      h3: { 
        fontWeight: 700,
        letterSpacing: '-0.02em',
      },
      h4: {
        fontWeight: 600,
        letterSpacing: '-0.01em',
      },
      h5: {
        fontWeight: 600,
      },
      h6: {
        fontWeight: 600,
      },
      button: { 
        textTransform: "none", 
        fontWeight: 600,
        letterSpacing: '0.01em',
      },
      body1: {
        letterSpacing: '0.01em',
      },
      body2: {
        letterSpacing: '0.01em',
      },
    },
    components: {
      MuiButton: {
        defaultProps: {
          variant: "contained",
          disableElevation: false,
        },
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: 'none',
            fontWeight: 600,
            padding: '8px 16px',
          },
          contained: {
            backgroundColor: tokens.primary[500],
            color: tokens.accent.contrastText,
            '&:hover': {
              backgroundColor: tokens.primary[600],
            },
          },
          outlined: {
            borderColor: tokens.border.medium,
            color: tokens.text.primary,
            '&:hover': {
              borderColor: tokens.primary[500],
              backgroundColor: mode === 'light' ? tokens.primary[50] : tokens.background.tertiary,
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            border: `1px solid ${tokens.border.light}`,
            backgroundColor: tokens.card.background,
            boxShadow: mode === 'dark'
              ? '0 4px 20px rgba(0, 0, 0, 0.45)'
              : '0 2px 12px rgba(79, 70, 229, 0.08)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            backgroundColor: mode === 'light' ? tokens.card.background : tokens.background.secondary,
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              backgroundColor: mode === 'light' ? tokens.card.background : tokens.background.primary,
              '& fieldset': {
                borderColor: tokens.border.medium,
              },
              '&:hover fieldset': {
                borderColor: tokens.primary[500],
              },
              '&.Mui-focused fieldset': {
                borderColor: tokens.primary[500],
              },
            },
            '& .MuiInputLabel-root': {
              color: tokens.text.secondary,
            },
            '& .MuiInputBase-input': {
              color: tokens.text.primary,
            },
          },
        },
      },
    },
  };

  const theme = createTheme(themeOptions);

  theme.components = {
    ...theme.components,
    MuiCssBaseline: {
      defaultProps: {
        enableColorScheme: true,
      },
      styleOverrides: {
        ":root": {
          colorScheme: mode,
          ...buildCssVariables(mode),
        },
        "*": {
          boxSizing: "border-box",
        },
        body: {
          backgroundColor: theme.palette.background.default,
          color: theme.palette.text.primary,
          fontFamily: theme.typography.fontFamily,
          transition: "background-color 0.3s ease, color 0.3s ease",
        },
        a: {
          color: theme.palette.primary.main,
        },
      },
    },
  };

  return theme;
}

export default getMuiTheme;
