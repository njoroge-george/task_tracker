import { useTheme as useNextTheme } from "next-themes";
import { themeTokens, type ThemeMode } from "./theme";

export function useTheme() {
  const { theme, setTheme, resolvedTheme } = useNextTheme();
  
  const currentTheme = (theme === "system" ? resolvedTheme : theme) as ThemeMode | undefined;
  const mode = currentTheme ?? "light";
  const colors = themeTokens[mode];
  
  return {
    theme: mode,
    setTheme,
    colors,
    isDark: mode === "dark",
    isLight: mode === "light",
  };
}
