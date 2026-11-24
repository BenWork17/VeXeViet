import { registerRootComponent } from 'expo';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import ProfileScreen from './src/screens/Profile/ProfileScreen';
import BookingHistoryScreen from './src/screens/Profile/BookingHistoryScreen';
import TicketWalletScreen from './src/screens/Profile/TicketWalletScreen';
import TicketScreen from './src/screens/Booking/TicketScreen';
import { EditProfileScreen, ChangePasswordScreen } from './src/screens/Profile/Placeholders';
import { SettingsScreen } from './src/screens/Settings/SettingsScreen';
import { ErrorBoundary } from './src/components/error/ErrorBoundary';
import { ThemeProvider } from './src/theme/ThemeProvider';
import { useTheme } from './src/hooks/useTheme';
import { lightColors, darkColors } from './src/theme/colors';

const Stack = createStackNavigator();

const LightNavigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: lightColors.primary,
    background: lightColors.background,
    card: lightColors.card,
    text: lightColors.foreground,
    border: lightColors.border,
    notification: lightColors.primary,
  },
};

const DarkNavigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: darkColors.primary,
    background: darkColors.background,
    card: darkColors.card,
    text: darkColors.foreground,
    border: darkColors.border,
    notification: darkColors.primary,
  },
};

function AppNavigator() {
  const { isDark, colors } = useTheme();
  const navigationTheme = isDark ? DarkNavigationTheme : LightNavigationTheme;

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator 
        initialRouteName="TicketWallet"
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.card,
          },
          headerTintColor: colors.foreground,
          headerTitleStyle: {
            color: colors.foreground,
          },
        }}
      >
        <Stack.Screen 
          name="Profile" 
          component={ProfileScreen} 
          options={{ title: 'Tài khoản' }}
        />
        <Stack.Screen 
          name="BookingHistory" 
          component={BookingHistoryScreen} 
          options={{ title: 'Lịch sử đặt vé' }}
        />
        <Stack.Screen 
          name="TicketWallet" 
          component={TicketWalletScreen} 
          options={{ title: 'Ví vé' }}
        />
        <Stack.Screen 
          name="Ticket" 
          component={TicketScreen} 
          options={{ title: 'Chi tiết vé' }}
        />
        <Stack.Screen 
          name="EditProfile" 
          component={EditProfileScreen} 
          options={{ title: 'Chỉnh sửa thông tin' }}
        />
        <Stack.Screen 
          name="ChangePassword" 
          component={ChangePasswordScreen} 
          options={{ title: 'Đổi mật khẩu' }}
        />
        <Stack.Screen 
          name="Settings" 
          component={SettingsScreen} 
          options={{ title: 'Cài đặt' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <SafeAreaProvider>
          <AppNavigator />
        </SafeAreaProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

registerRootComponent(App);
