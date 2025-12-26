"use client";

import { useEffect, useState } from "react";
import { IconButton } from "@mui/material";
import { useTheme as useNextTheme } from "next-themes";
import { useTheme } from "@mui/material/styles";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const muiTheme = useTheme();
  const { theme, setTheme, resolvedTheme } = useNextTheme();

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = theme === "system" ? resolvedTheme : theme;

  if (!mounted) {
    return (
      <IconButton
        color="primary"
        size="large"
        aria-label="Toggle theme"
        sx={{
          width: 40,
          height: 40,
          border: `1px solid ${muiTheme.palette.divider}`,
          backgroundColor:
            muiTheme.palette.mode === "dark"
              ? "rgba(255,255,255,0.04)"
              : "rgba(99,102,241,0.08)",
        }}
        disabled
      >
        <Sun size={20} color={muiTheme.palette.text.primary} />
      </IconButton>
    );
  }

  const iconColor =
    currentTheme === "dark"
      ? muiTheme.palette.warning.light
      : muiTheme.palette.text.primary;

  return (
    <IconButton
      color="primary"
      size="large"
      onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
      sx={{
        width: 40,
        height: 40,
        border: `1px solid ${muiTheme.palette.divider}`,
        backgroundColor:
          muiTheme.palette.mode === "dark"
            ? "rgba(255,255,255,0.04)"
            : "rgba(99,102,241,0.08)",
      }}
      title={`Switch to ${currentTheme === "dark" ? "light" : "dark"} mode`}
      aria-label={`Switch to ${currentTheme === "dark" ? "light" : "dark"} mode`}
    >
      {currentTheme === "dark" ? (
        <Sun size={20} color={iconColor} />
      ) : (
        <Moon size={20} color={iconColor} />
      )}
    </IconButton>
  );
}
