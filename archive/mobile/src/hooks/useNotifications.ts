import { useState, useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface NotificationPermissionStatus {
  granted: boolean;
  canAskAgain: boolean;
  status: string;
}

export function useNotifications() {
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermissionStatus>({
    granted: false,
    canAskAgain: true,
    status: 'undetermined',
  });
  const [expoPushToken, setExpoPushToken] = useState<string>('');
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      if (token) {
        setExpoPushToken(token);
      }
    });

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  async function registerForPushNotificationsAsync(): Promise<string | undefined> {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#F97316',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    const granted = finalStatus === 'granted';
    setPermissionStatus({
      granted,
      canAskAgain: finalStatus !== 'denied',
      status: finalStatus,
    });

    if (!granted) {
      console.warn('Failed to get push token for push notification!');
      return undefined;
    }

    try {
      token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log('Expo Push Token:', token);
    } catch (error) {
      console.error('Error getting push token:', error);
    }

    return token;
  }

  async function scheduleTripReminder(
    departureTime: string,
    bookingCode: string,
    from: string,
    to: string,
    seatNumbers: string
  ): Promise<string | null> {
    if (!permissionStatus.granted) {
      console.warn('Notification permission not granted');
      return null;
    }

    try {
      const departureDate = new Date(departureTime);
      const reminderTime = new Date(departureDate.getTime() - 60 * 60 * 1000);
      const now = new Date();

      if (reminderTime <= now) {
        console.warn('Reminder time is in the past, not scheduling');
        return null;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🚌 Nhắc nhở chuyến đi',
          body: `Chuyến xe ${from} → ${to} sẽ khởi hành sau 1 giờ. Ghế: ${seatNumbers}`,
          data: { 
            bookingCode,
            type: 'trip_reminder',
            from,
            to,
            departureTime,
          },
          sound: 'default',
          badge: 1,
        },
        trigger: {
          date: reminderTime,
        },
      });

      console.log('Notification scheduled:', notificationId, 'for', reminderTime);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  }

  async function cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log('Notification cancelled:', notificationId);
    } catch (error) {
      console.error('Error cancelling notification:', error);
    }
  }

  async function cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('All notifications cancelled');
    } catch (error) {
      console.error('Error cancelling all notifications:', error);
    }
  }

  async function requestPermissions(): Promise<boolean> {
    const { status } = await Notifications.requestPermissionsAsync();
    const granted = status === 'granted';
    
    setPermissionStatus({
      granted,
      canAskAgain: status !== 'denied',
      status,
    });

    return granted;
  }

  return {
    permissionStatus,
    expoPushToken,
    scheduleTripReminder,
    cancelNotification,
    cancelAllNotifications,
    requestPermissions,
  };
}
