"use client";

import * as React from "react";
import { ThemeProvider as MuiThemeProvider } from "@mui/material";
import { useTheme as useNextTheme } from "next-themes";
import getMuiTheme, { type ColorMode } from "@/theme/muiTheme";
import EmotionRegistry from "@/lib/EmotionRegistry";

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
      <EmotionRegistry>
        <MuiThemeProvider theme={getMuiTheme("light")}>
          {children}
        </MuiThemeProvider>
      </EmotionRegistry>
    );
  }

  return (
    <EmotionRegistry>
      <MuiThemeProvider theme={muiTheme}>
        {children}
      </MuiThemeProvider>
    </EmotionRegistry>
  );
}
