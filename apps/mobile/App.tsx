import { registerRootComponent } from 'expo';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import ProfileScreen from './src/screens/Profile/ProfileScreen';
import BookingHistoryScreen from './src/screens/Profile/BookingHistoryScreen';
import { EditProfileScreen, ChangePasswordScreen, SettingsScreen } from './src/screens/Profile/Placeholders';

const Stack = createStackNavigator();

function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Profile">
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
    </SafeAreaProvider>
  );
}

registerRootComponent(App);
