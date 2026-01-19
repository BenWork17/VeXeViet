import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, AccessibilityRole } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useTheme } from '../hooks/useTheme';
import { ThemeMode } from '../theme/types';

interface ThemeOption {
  mode: ThemeMode;
  label: string;
  icon: string;
  description: string;
}

const themeOptions: ThemeOption[] = [
  {
    mode: 'light',
    label: 'Light',
    icon: 'sun',
    description: 'Always use light mode',
  },
  {
    mode: 'dark',
    label: 'Dark',
    icon: 'moon',
    description: 'Always use dark mode',
  },
  {
    mode: 'system',
    label: 'System',
    icon: 'smartphone',
    description: 'Follow system settings',
  },
];

export function ThemeSwitcher() {
  const { themeMode, setThemeMode, colors } = useTheme();

  const handlePress = (mode: ThemeMode) => {
    setThemeMode(mode);
  };

  return (
    <View style={styles.container}>
      {themeOptions.map((option) => {
        const isSelected = themeMode === option.mode;

        return (
          <TouchableOpacity
            key={option.mode}
            style={[
              styles.option,
              {
                backgroundColor: isSelected ? colors.primary : colors.card,
                borderColor: isSelected ? colors.primary : colors.border,
              },
            ]}
            onPress={() => handlePress(option.mode)}
            accessibilityRole={'button' as AccessibilityRole}
            accessibilityLabel={`${option.label} theme`}
            accessibilityHint={option.description}
            accessibilityState={{ selected: isSelected }}
            activeOpacity={0.7}
          >
            <Icon
              name={option.icon}
              size={24}
              color={isSelected ? colors.primaryForeground : colors.foreground}
            />
            <Text
              style={[
                styles.label,
                {
                  color: isSelected ? colors.primaryForeground : colors.foreground,
                },
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  option: {
    flex: 1,
    minHeight: 80,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 2,
    paddingVertical: 16,
    paddingHorizontal: 8,
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
