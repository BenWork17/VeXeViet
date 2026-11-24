import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { ThemeSwitcher } from '../../components/ThemeSwitcher';
import { useTheme } from '../../hooks/useTheme';

export function SettingsScreen() {
  const { colors } = useTheme();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Appearance
        </Text>
        <Text style={[styles.sectionDescription, { color: colors.mutedForeground }]}>
          Choose your preferred theme
        </Text>
        <ThemeSwitcher />
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Notifications
        </Text>
        <Text style={[styles.placeholderText, { color: colors.mutedForeground }]}>
          Notification settings coming soon
        </Text>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Language
        </Text>
        <Text style={[styles.placeholderText, { color: colors.mutedForeground }]}>
          Language settings coming soon
        </Text>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Privacy
        </Text>
        <Text style={[styles.placeholderText, { color: colors.mutedForeground }]}>
          Privacy settings coming soon
        </Text>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          About
        </Text>
        <Text style={[styles.versionText, { color: colors.mutedForeground }]}>
          VeXeViet v1.0.0
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingVertical: 16,
  },
  section: {
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    paddingHorizontal: 16,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  placeholderText: {
    fontSize: 14,
    paddingHorizontal: 16,
  },
  versionText: {
    fontSize: 14,
    paddingHorizontal: 16,
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
  },
});
