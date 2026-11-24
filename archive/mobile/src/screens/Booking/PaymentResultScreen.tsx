import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { PaymentResultParams } from '../../types/payment';

export default function PaymentResultScreen() {
  const [result, setResult] = useState<PaymentResultParams | null>(null);

  useEffect(() => {
    // In a real app, this would parse deep link params
    // For now, we'll simulate a successful payment
    setTimeout(() => {
      setResult({
        status: 'success',
        transactionId: 'TXN-' + Date.now(),
        bookingId: 'BK-' + Date.now(),
      });
    }, 500);
  }, []);

  if (!result) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Đang kiểm tra trạng thái thanh toán...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isSuccess = result.status === 'success';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Icon */}
        <View
          style={[
            styles.iconContainer,
            isSuccess ? styles.successIconContainer : styles.failedIconContainer,
          ]}
        >
          <MaterialCommunityIcons
            name={isSuccess ? 'check-circle' : 'close-circle'}
            size={80}
            color={isSuccess ? '#10B981' : '#EF4444'}
          />
        </View>

        {/* Title */}
        <Text style={styles.title}>
          {isSuccess ? 'Thanh toán thành công!' : 'Thanh toán thất bại'}
        </Text>

        {/* Message */}
        <Text style={styles.message}>
          {isSuccess
            ? 'Vé của bạn đã được đặt thành công. Chúng tôi đã gửi thông tin vé qua email.'
            : result.message || 'Giao dịch không thành công. Vui lòng thử lại.'}
        </Text>

        {/* Transaction Details */}
        {(result.transactionId || result.bookingId) && (
          <View style={styles.detailsCard}>
            {result.bookingId && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Mã đặt vé:</Text>
                <Text style={styles.detailValue}>{result.bookingId}</Text>
              </View>
            )}
            {result.transactionId && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Mã giao dịch:</Text>
                <Text style={[styles.detailValue, styles.transactionId]}>
                  {result.transactionId}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          {isSuccess ? (
            <>
              <TouchableOpacity 
                style={styles.primaryButton}
                onPress={() => {
                  // Navigate to ticket screen with bookingId
                  // navigation.navigate('Ticket', { bookingId: result.bookingId });
                }}
              >
                <Text style={styles.primaryButtonText}>Xem vé</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={() => {
                  // navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
                }}
              >
                <Text style={styles.secondaryButtonText}>Về trang chủ</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity 
                style={styles.primaryButton}
                onPress={() => {
                  // navigation.goBack();
                }}
              >
                <Text style={styles.primaryButtonText}>Thử lại</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={() => {
                  // navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
                }}
              >
                <Text style={styles.secondaryButtonText}>Về trang chủ</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Support Info */}
        <View style={styles.supportCard}>
          <Text style={styles.supportText}>
            Cần hỗ trợ? Liên hệ <Text style={styles.supportBold}>1900-xxxx</Text> hoặc{' '}
            <Text style={styles.supportLink}>support@vexeviet.com</Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  container: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 24,
  },
  successIconContainer: {
    // Additional styles for success icon if needed
  },
  failedIconContainer: {
    // Additional styles for failed icon if needed
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  detailsCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  transactionId: {
    fontFamily: 'monospace',
    fontSize: 12,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#F97316',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  secondaryButtonText: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '600',
  },
  supportCard: {
    marginTop: 32,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  supportText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  supportBold: {
    fontWeight: 'bold',
    color: '#111827',
  },
  supportLink: {
    color: '#F97316',
    textDecorationLine: 'underline',
  },
});
