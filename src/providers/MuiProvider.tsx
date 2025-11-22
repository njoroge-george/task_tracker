"use client";

import * as React from "react";
import { ThemeProvider as MuiThemeProvider, CssBaseline } from "@mui/material";
import { CacheProvider } from "@emotion/react";
import { useTheme as useNextTheme } from "next-themes";
import getMuiTheme, { type ColorMode } from "@/theme/muiTheme";
import createEmotionCache from "@/lib/emotion-cache";

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

export default function MuiProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);
  const { theme, resolvedTheme } = useNextTheme();
  const current = (theme === "system" ? resolvedTheme : theme) as ColorMode | undefined;
  const muiTheme = React.useMemo(() => getMuiTheme(current ?? "light"), [current]);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by not rendering theme-dependent content until mounted
  if (!mounted) {
    return (
      <CacheProvider value={clientSideEmotionCache}>
        <MuiThemeProvider theme={getMuiTheme("light")}>
          <CssBaseline />
          {children}
        </MuiThemeProvider>
      </CacheProvider>
    );
  }

  return (
    <CacheProvider value={clientSideEmotionCache}>
      <MuiThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </CacheProvider>
  );
}
