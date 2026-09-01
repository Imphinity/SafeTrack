import React, { createContext, useContext, useState } from 'react';
import { lightTheme, darkTheme } from '../constants/colors';

type ThemeContextType = {
    isDark: boolean;
    colors: typeof lightTheme;
    toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
    isDark: false,
    colors: lightTheme,
    toggleTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isDark, setIsDark] = useState(false);

    const toggleTheme = () => setIsDark((prev) => !prev);
    const colors = isDark ? darkTheme : lightTheme;

    return (
        <ThemeContext.Provider value={{ isDark, colors, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);