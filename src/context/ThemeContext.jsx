import { createContext, useContext, useState } from "react";

// Create the context
const ThemeContext = createContext();

// Provider to wrap your app
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("light"); // default theme

  const toggleDarkMode = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const setCustomTheme = (newTheme) => {
    setTheme(newTheme); // e.g., "light", "dark", "blue", etc.
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleDarkMode, setCustomTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook to use theme in any component
export const useTheme = () => useContext(ThemeContext);
