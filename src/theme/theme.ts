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
    // Professional Blue scale (primary brand color)
    primary: {
      50: "#eff6ff",   // Very light blue
      100: "#dbeafe",  // Light blue
      200: "#bfdbfe",  // Lighter blue
      300: "#93c5fd",  // Medium light blue
      400: "#60a5fa",  // Medium blue
      500: "#2563eb",  // Primary blue (main brand)
      600: "#1d4ed8",  // Darker blue
      700: "#1e40af",  // Dark blue
      800: "#1e3a8a",  // Very dark blue
      900: "#172554",  // Deepest blue
    },
    // Clean, professional backgrounds
    background: {
      primary: "#ffffff",     // Pure white for main content
      secondary: "#f8fafc",   // Subtle blue-gray for sections
      tertiary: "#f1f5f9",    // Slightly darker blue-gray
    },
    // Professional text colors
    text: {
      primary: "#0f172a",     // Deep slate for main text
      secondary: "#334155",   // Medium slate for secondary text
      tertiary: "#64748b",    // Lighter slate for tertiary text
      muted: "#94a3b8",       // Muted slate for disabled/subtle text
    },
    // Refined borders
    border: {
      light: "#e2e8f0",       // Light slate border
      medium: "#cbd5e1",      // Medium slate border
      dark: "#94a3b8",        // Darker slate border
    },
    // Card styling
    card: {
      background: "#ffffff",
      border: "#e2e8f0",
      shadow: "rgba(15, 23, 42, 0.08)",  // Subtle shadow
      foreground: "#0f172a",
    },
    // Status colors (professional palette)
    status: {
      success: "#059669",     // Professional green
      warning: "#d97706",     // Amber/orange for warnings
      error: "#dc2626",       // Professional red
      info: "#0891b2",        // Cyan for information
    },
    // Accent colors (Red/Blue/Cyan professional palette)
    accent: {
      blue: "#2563eb",        // Primary blue
      sky: "#0891b2",         // Cyan/teal
      indigo: "#dc2626",      // Red accent (replaces purple)
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
