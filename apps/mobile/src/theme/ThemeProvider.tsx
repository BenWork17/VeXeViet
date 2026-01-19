import React, { createContext, useCallback, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeMode, ThemeColors, ThemeContextValue, Theme } from './types';
import { lightColors, darkColors } from './colors';

const THEME_STORAGE_KEY = '@vexeviet/theme_mode';

const defaultTheme: Theme = {
  mode: 'system',
  isDark: false,
  colors: lightColors,
};

const defaultContextValue: ThemeContextValue = {
  theme: defaultTheme,
  themeMode: 'system',
  setThemeMode: () => {},
  colors: lightColors,
  isDark: false,
};

export const ThemeContext = createContext<ThemeContextValue>(defaultContextValue);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [isLoaded, setIsLoaded] = useState(false);

  const getEffectiveIsDark = useCallback(
    (mode: ThemeMode): boolean => {
      if (mode === 'system') {
        return systemColorScheme === 'dark';
      }
      return mode === 'dark';
    },
    [systemColorScheme]
  );

  const isDark = getEffectiveIsDark(themeMode);
  const colors: ThemeColors = isDark ? darkColors : lightColors;

  const theme: Theme = {
    mode: themeMode,
    isDark,
    colors,
  };

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (storedMode && ['light', 'dark', 'system'].includes(storedMode)) {
          setThemeModeState(storedMode as ThemeMode);
        }
      } catch (error) {
        console.warn('Failed to load theme preference:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadTheme();
  }, []);

  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      setThemeModeState(mode);
    } catch (error) {
      console.warn('Failed to save theme preference:', error);
    }
  }, []);

  const contextValue: ThemeContextValue = {
    theme,
    themeMode,
    setThemeMode,
    colors,
    isDark,
  };

  if (!isLoaded) {
    return null;
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}
