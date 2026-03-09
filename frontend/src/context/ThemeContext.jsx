/**
 * frontend/src/context/ThemeContext.jsx
 */

import { createContext, useContext, useState } from "react";

export const COLORS = {
  light: {
    bg:         "#ffffff",
    sidebar:    "#f2c7c7",
    sent:       "#ffb7cd",
    received:   "#d5f3d8",
    text:       "#1a1a1a",
    subtext:    "#777",
    accentHex:  "#00bcd4",
    border:     "#e8c4c4",
    inputBg:    "#fdf0f0",
    panelBg:    "#fdf5f5",
    overlay:    "rgba(255,240,240,0.95)",
  },
  dark: {
    bg:         "#121212",
    sidebar:    "#1c1c1c",
    sent:       "#c2185b",
    received:   "#2e7d32",
    text:       "#ffffff",
    subtext:    "#aaa",
    accentHex:  "#00e5ff",
    border:     "#2a2a2a",
    inputBg:    "#1e1e1e",
    panelBg:    "#181818",
    overlay:    "rgba(18,18,18,0.97)",
  },
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");
  const toggle = () => setTheme(t => t === "light" ? "dark" : "light");
  return (
    <ThemeContext.Provider value={{ theme, toggle, C: COLORS[theme] }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
