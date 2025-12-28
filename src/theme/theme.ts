export type ThemeMode = "light" | "dark";

type PrimaryScale = {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
};

type BackgroundTokens = {
  primary: string;
  secondary: string;
  tertiary: string;
};

type TextTokens = {
  primary: string;
  secondary: string;
  tertiary: string;
  muted: string;
};

type BorderTokens = {
  light: string;
  medium: string;
  dark: string;
};

type CardTokens = {
  background: string;
  border: string;
  shadow: string;
  foreground: string;
};

type StatusTokens = {
  success: string;
  warning: string;
  error: string;
  info: string;
};

type AccentTokens = {
  blue: string;
  sky: string;
  indigo: string;
  contrastText: string;
};

export type ThemeDefinition = {
  primary: PrimaryScale;
  background: BackgroundTokens;
  text: TextTokens;
  border: BorderTokens;
  card: CardTokens;
  status: StatusTokens;
  accent: AccentTokens;
};

export const themeTokens: Record<ThemeMode, ThemeDefinition> = {
  light: {
    primary: {
      50: "#eef2ff",
      100: "#e0e7ff",
      200: "#c7d2fe",
      300: "#a5b4fc",
      400: "#818cf8",
      500: "#6366f1",
      600: "#4f46e5",
      700: "#4338ca",
      800: "#3730a3",
      900: "#312e81",
    },
    background: {
      primary: "#ffffffff",
      secondary: "#f8f9ff",
      tertiary: "#eef1ff",
    },
    text: {
      primary: "#0f172a",
      secondary: "#1f2358",
      tertiary: "#312e81",
      muted: "#475569",
    },
    border: {
      light: "#e0e7ff",
      medium: "#cbd5f5",
      dark: "#94a3d3",
    },
    card: {
      background: "#ffffffff",
      border: "#e0e7ff",
      shadow: "rgba(79, 70, 229, 0.08)",
      foreground: "#0f172a",
    },
    status: {
      success: "#22c55e",
      warning: "#f97316",
      error: "#ef4444",
      info: "#3b82f6",
    },
    accent: {
      blue: "#4f46e5",
      sky: "#818cf8",
      indigo: "#312e81",
      contrastText: "#ffffff",
    },
  },
  dark: {
    primary: {
      50: "#c7d2fe",
      100: "#a5b4fc",
      200: "#818cf8",
      300: "#6366f1",
      400: "#4f46e5",
      500: "#4338ca",
      600: "#3730a3",
      700: "#312e81",
      800: "#26205c",
      900: "#1b1540",
    },
    background: {
      primary: "#040c1a",
      secondary: "#0b1533",
      tertiary: "#17203f",
    },
    text: {
      primary: "#e0e7ff",
      secondary: "#cbd5ff",
      tertiary: "#a5b4fc",
      muted: "#818cf8",
    },
    border: {
      light: "#1f2a44",
      medium: "#2c3a5f",
      dark: "#3b4d7a",
    },
    card: {
      background: "#19314dff",
      border: "#1f3e44ff",
      shadow: "rgba(3, 7, 18, 0.46)",
      foreground: "#e0e7ff",
    },
    status: {
      success: "#22c55e",
      warning: "#f97316",
      error: "#ef4444",
      info: "#38bdf8",
    },
    accent: {
      blue: "#4f46e5",
      sky: "#818cf8",
      indigo: "#312e81",
      contrastText: "#e0e7ff",
    },
  },
};

export const lightTheme = themeTokens.light;
export const darkTheme = themeTokens.dark;

export type Theme = ThemeDefinition;
export type ThemeColors = keyof Theme["primary"];
