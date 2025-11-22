import { createTheme, type ThemeOptions } from "@mui/material/styles";
import { themeTokens, type ThemeMode } from "./theme";

declare module "@mui/material/styles" {
  interface TypeBackground {
    secondary: string;
    tertiary: string;
  }
}

export type ColorMode = ThemeMode;

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
        paper: tokens.card.background,
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
        contrastText: tokens.accent.contrastText,
      },
      warning: {
        main: tokens.status.warning,
        contrastText: tokens.accent.contrastText,
      },
      error: {
        main: tokens.status.error,
        contrastText: tokens.accent.contrastText,
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
      fontFamily:
        'var(--font-geist-sans), system-ui, -apple-system, "Helvetica", "Arial", sans-serif',
      h1: { fontWeight: 700 },
      h2: { fontWeight: 700 },
      h3: { fontWeight: 700 },
      button: { textTransform: "none", fontWeight: 600 },
    },
    components: {
      MuiButton: {
        defaultProps: {
          variant: "contained",
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            borderRadius: 999,
          },
          contained: {
            color: tokens.accent.contrastText,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            border: `1px solid ${tokens.card.border}`,
            backgroundColor: tokens.card.background,
            boxShadow:
              mode === "dark"
                ? "0 12px 24px rgba(15, 23, 42, 0.45)"
                : "0 12px 24px rgba(15, 23, 42, 0.12)",
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
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
