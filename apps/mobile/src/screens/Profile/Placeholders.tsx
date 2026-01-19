import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

const PlaceholderScreen = ({ title }: { title: string }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.text, { color: colors.foreground }]}>{title} Screen</Text>
      <Text style={[styles.subtext, { color: colors.mutedForeground }]}>Tính năng đang được phát triển</Text>
    </View>
  );
};

export const EditProfileScreen = () => <PlaceholderScreen title="Edit Profile" />;
export const ChangePasswordScreen = () => <PlaceholderScreen title="Change Password" />;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' },
  text: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  subtext: { fontSize: 14, color: '#6b7280', marginTop: 8 },
});
