"use client";

import { createContext, useContext, ReactNode } from "react";

export type PageTheme = 
  | "dashboard"    // Blue theme
  | "activity"     // Cyan theme
  | "tasks"        // Blue theme
  | "projects"     // Cyan theme
  | "discussions"  // Red theme
  | "playground"   // Purple theme
  | "board"        // Indigo theme
  | "calendar"     // Orange theme
  | "messages"     // Green theme
  | "analytics"    // Teal theme
  | "team"         // Pink theme
  | "settings"     // Gray theme
  | "default";     // Default theme

interface PageThemeContextType {
  pageTheme: PageTheme;
}

const PageThemeContext = createContext<PageThemeContextType>({
  pageTheme: "default",
});

export const usePageTheme = () => useContext(PageThemeContext);

interface PageThemeProviderProps {
  children: ReactNode;
  theme: PageTheme;
}

export function PageThemeProvider({ children, theme }: PageThemeProviderProps) {
  return (
    <PageThemeContext.Provider value={{ pageTheme: theme }}>
      <div className={`page-theme-${theme}`} data-page-theme={theme}>
        {children}
      </div>
    </PageThemeContext.Provider>
  );
}
