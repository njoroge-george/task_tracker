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
    // Lime green scale (primary brand color)
    primary: {
      50: "#f7fee7",   // Very light lime
      100: "#ecfccb",  // Light lime
      200: "#d9f99d",  // Lighter lime
      300: "#bef264",  // Medium light lime
      400: "#a3e635",  // Medium lime
      500: "#84cc16",  // Primary lime (main brand)
      600: "#65a30d",  // Darker lime
      700: "#4d7c0f",  // Dark lime
      800: "#3f6212",  // Very dark lime
      900: "#365314",  // Deepest lime
    },
    // Clean black and white backgrounds
    background: {
      primary: "#ffffff",     // Pure white for main content
      secondary: "#fafafa",   // Subtle gray for sections
      tertiary: "#f5f5f5",    // Slightly darker gray
    },
    // Black-based text colors
    text: {
      primary: "#000000",     // Pure black for main text
      secondary: "#262626",   // Dark gray for secondary text
      tertiary: "#525252",    // Medium gray for tertiary text
      muted: "#737373",       // Light gray for disabled/subtle text
    },
    // Subtle borders
    border: {
      light: "#e5e5e5",       // Light gray border
      medium: "#d4d4d4",      // Medium gray border
      dark: "#a3a3a3",        // Darker gray border
    },
    // Card styling
    card: {
      background: "#ffffff",
      border: "#e5e5e5",
      shadow: "rgba(0, 0, 0, 0.08)",  // Subtle shadow
      foreground: "#000000",
    },
    // Status colors
    status: {
      success: "#84cc16",     // Lime green for success
      warning: "#f59e0b",     // Amber for warnings
      error: "#ef4444",       // Red for errors
      info: "#84cc16",        // Lime for information
    },
    // Accent colors (Lime and Black palette)
    accent: {
      blue: "#84cc16",        // Primary lime
      sky: "#a3e635",         // Lighter lime
      indigo: "#65a30d",      // Darker lime
      contrastText: "#000000",  // Black text on lime
    },
  },
  dark: {
    primary: {
      50: "#f7fee7",
      100: "#ecfccb",
      200: "#d9f99d",
      300: "#bef264",
      400: "#a3e635",
      500: "#84cc16",
      600: "#65a30d",
      700: "#4d7c0f",
      800: "#3f6212",
      900: "#365314",
    },
    background: {
      primary: "#0f172a",     // Dark navy blue (slate-900)
      secondary: "#1e293b",   // Slightly lighter navy (slate-800)
      tertiary: "#334155",    // Medium navy (slate-700)
    },
    text: {
      primary: "#f8fafc",     // Very light text (slate-50)
      secondary: "#e2e8f0",   // Light gray text (slate-200)
      tertiary: "#cbd5e1",    // Medium gray text (slate-300)
      muted: "#94a3b8",       // Muted gray text (slate-400)
    },
    border: {
      light: "#334155",       // Slate-700
      medium: "#475569",      // Slate-600
      dark: "#64748b",        // Slate-500
    },
    card: {
      background: "#1e293b",  // Navy blue (slate-800)
      border: "#334155",      // Slate-700
      shadow: "rgba(132, 204, 22, 0.1)",  // Lime glow
      foreground: "#f8fafc",  // Light text (slate-50)
    },
    status: {
      success: "#84cc16",      // Lime green for success
      warning: "#f59e0b",      // Amber for warnings
      error: "#ef4444",        // Red for errors
      info: "#84cc16",         // Lime for information
    },
    accent: {
      blue: "#84cc16",         // Primary lime
      sky: "#a3e635",          // Lighter lime
      indigo: "#65a30d",       // Darker lime
      contrastText: "#0f172a", // Navy blue text on lime
    },
  },
};

export const lightTheme = themeTokens.light;
export const darkTheme = themeTokens.dark;

export type Theme = ThemeDefinition;
export type ThemeColors = keyof Theme["primary"];
