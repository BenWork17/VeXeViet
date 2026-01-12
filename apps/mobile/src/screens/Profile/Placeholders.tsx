import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const PlaceholderScreen = ({ title }: { title: string }) => (
  <View style={styles.container}>
    <Text style={styles.text}>{title} Screen</Text>
    <Text style={styles.subtext}>Tính năng đang được phát triển</Text>
  </View>
);

export const EditProfileScreen = () => <PlaceholderScreen title="Edit Profile" />;
export const ChangePasswordScreen = () => <PlaceholderScreen title="Change Password" />;
export const SettingsScreen = () => <PlaceholderScreen title="Settings" />;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' },
  text: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  subtext: { fontSize: 14, color: '#6b7280', marginTop: 8 },
});
