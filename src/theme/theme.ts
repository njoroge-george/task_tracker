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
      50: "#eff6ff",
      100: "#dbeafe",
      200: "#bfdbfe",
      300: "#93c5fd",
      400: "#60a5fa",
      500: "#3b82f6",
      600: "#2563eb",
      700: "#1d4ed8",
      800: "#1e40af",
      900: "#1e3a8a",
    },
    background: {
      primary: "#ffffff",
      secondary: "#f9fafb",
      tertiary: "#f3f4f6",
    },
    text: {
      primary: "#111827",
      secondary: "#374151",
      tertiary: "#4b5563",
      muted: "#6b7280",
    },
    border: {
      light: "#e5e7eb",
      medium: "#d1d5db",
      dark: "#9ca3af",
    },
    card: {
      background: "#ffffff",
      border: "#e5e7eb",
      shadow: "rgba(0, 0, 0, 0.1)",
      foreground: "#111827",
    },
    status: {
      success: "#10b981",
      warning: "#f59e0b",
      error: "#ef4444",
      info: "#0ea5e9",
    },
    accent: {
      blue: "#3b82f6",
      sky: "#0ea5e9",
      indigo: "#6366f1",
      contrastText: "#ffffff",
    },
  },
  dark: {
    primary: {
      50: "#eff6ff",
      100: "#dbeafe",
      200: "#bfdbfe",
      300: "#93c5fd",
      400: "#60a5fa",
      500: "#3b82f6",
      600: "#2563eb",
      700: "#1d4ed8",
      800: "#1e40af",
      900: "#1e3a8a",
    },
    background: {
      primary: "#111827",
      secondary: "#1f2937",
      tertiary: "#374151",
    },
    text: {
      primary: "#f3f4f6",
      secondary: "#d1d5db",
      tertiary: "#9ca3af",
      muted: "#6b7280",
    },
    border: {
      light: "#374151",
      medium: "#4b5563",
      dark: "#6b7280",
    },
    card: {
      background: "#1f2937",
      border: "#374151",
      shadow: "rgba(0, 0, 0, 0.3)",
      foreground: "#f3f4f6",
    },
    status: {
      success: "#34d399",
      warning: "#fbbf24",
      error: "#f87171",
      info: "#38bdf8",
    },
    accent: {
      blue: "#60a5fa",
      sky: "#38bdf8",
      indigo: "#818cf8",
      contrastText: "#0b1120",
    },
  },
};

export const lightTheme = themeTokens.light;
export const darkTheme = themeTokens.dark;

export type Theme = ThemeDefinition;
export type ThemeColors = keyof Theme["primary"];
