import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { PaymentMethod } from '../../types/payment';
import { initiatePayment } from '../../services/payment';

interface PaymentMethodOption {
  id: PaymentMethod;
  name: string;
  description: string;
  icon: string;
  iconColor: string;
}

const paymentMethods: PaymentMethodOption[] = [
  {
    id: 'VNPAY',
    name: 'VNPAY',
    description: 'Thanh toán qua VNPAY',
    icon: 'credit-card',
    iconColor: '#0066CC',
  },
  {
    id: 'MOMO',
    name: 'Momo',
    description: 'Ví điện tử Momo',
    icon: 'wallet',
    iconColor: '#A50064',
  },
  {
    id: 'ZALOPAY',
    name: 'ZaloPay',
    description: 'Ví điện tử ZaloPay',
    icon: 'wallet-outline',
    iconColor: '#0068FF',
  },
  {
    id: 'CREDIT_CARD',
    name: 'Thẻ tín dụng',
    description: 'Thẻ quốc tế (Visa, Mastercard)',
    icon: 'credit-card-outline',
    iconColor: '#6B7280',
  },
];

function formatCurrency(amount: number): string {
  return amount.toLocaleString('vi-VN') + ' ₫';
}

function formatDateTime(dateTime: string): string {
  const date = new Date(dateTime);
  return date.toLocaleDateString('vi-VN', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }) + ' • ' + date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function PaymentScreen() {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Mock booking data - in real app, this would come from navigation params or Redux
  const bookingData = {
    bookingId: 'BK-' + Date.now(),
    from: 'HCM City',
    to: 'Da Lat',
    departureTime: '2026-01-15T08:00:00',
    busType: 'VIP Limousine 24 seats',
    passengerCount: 2,
    totalAmount: 500000,
  };

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
  };

  const handlePayNow = async () => {
    if (!selectedMethod) {
      Alert.alert('Lỗi', 'Vui lòng chọn phương thức thanh toán');
      return;
    }

    setIsProcessing(true);

    try {
      const response = await initiatePayment(
        bookingData.bookingId,
        selectedMethod,
        bookingData.totalAmount
      );

      if (response.success && response.paymentUrl) {
        // Check if URL can be opened
        const supported = await Linking.canOpenURL(response.paymentUrl);

        if (supported) {
          // Redirect to payment gateway (banking app or mobile browser)
          await Linking.openURL(response.paymentUrl);
        } else {
          throw new Error('Cannot open payment URL');
        }
      } else {
        throw new Error('Invalid payment response');
      }
    } catch (error) {
      setIsProcessing(false);
      Alert.alert(
        'Lỗi thanh toán',
        error instanceof Error ? error.message : 'Có lỗi xảy ra khi xử lý thanh toán',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Checkout</Text>
        <Text style={styles.headerSubtitle}>Chọn phương thức thanh toán</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Order Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Thông tin chuyến đi</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tuyến đường:</Text>
            <Text style={styles.summaryValue}>
              {bookingData.from} → {bookingData.to}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Thời gian khởi hành:</Text>
            <Text style={styles.summaryValue}>{formatDateTime(bookingData.departureTime)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Loại xe:</Text>
            <Text style={styles.summaryValue}>{bookingData.busType}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Số hành khách:</Text>
            <Text style={styles.summaryValue}>{bookingData.passengerCount}</Text>
          </View>

          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Tổng tiền:</Text>
            <Text style={styles.totalValue}>{formatCurrency(bookingData.totalAmount)}</Text>
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.paymentMethodsCard}>
          <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>

          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.methodItem,
                selectedMethod === method.id && styles.methodItemSelected,
              ]}
              onPress={() => handlePaymentMethodSelect(method.id)}
              disabled={isProcessing}
              activeOpacity={0.7}
            >
              <View style={styles.methodContent}>
                <View style={[styles.iconContainer, { backgroundColor: method.iconColor + '15' }]}>
                  <MaterialCommunityIcons name={method.icon} size={28} color={method.iconColor} />
                </View>
                <View style={styles.methodInfo}>
                  <Text style={styles.methodName}>{method.name}</Text>
                  <Text style={styles.methodDescription}>{method.description}</Text>
                </View>
              </View>
              <View
                style={[
                  styles.radioButton,
                  selectedMethod === method.id && styles.radioButtonSelected,
                ]}
              >
                {selectedMethod === method.id && <View style={styles.radioButtonInner} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Security Notice */}
        <View style={styles.securityNotice}>
          <MaterialCommunityIcons name="shield-check" size={20} color="#0066CC" />
          <Text style={styles.securityText}>
            <Text style={styles.securityBold}>Thanh toán an toàn: </Text>
            Bạn sẽ được chuyển đến cổng thanh toán của đối tác. Chúng tôi không lưu trữ thông tin thẻ của bạn.
          </Text>
        </View>
      </ScrollView>

      {/* Footer with Pay Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.payButton,
            (!selectedMethod || isProcessing) && styles.payButtonDisabled,
          ]}
          onPress={handlePayNow}
          disabled={!selectedMethod || isProcessing}
          activeOpacity={0.8}
        >
          {isProcessing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#FFFFFF" size="small" />
              <Text style={styles.payButtonText}>Đang xử lý...</Text>
            </View>
          ) : (
            <Text style={styles.payButtonText}>
              Thanh toán {formatCurrency(bookingData.totalAmount)}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Full-Screen Loader Overlay */}
      {isProcessing && (
        <View style={styles.loaderOverlay}>
          <View style={styles.loaderContent}>
            <ActivityIndicator size="large" color="#F97316" />
            <Text style={styles.loaderText}>Đang xử lý thanh toán...</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  summaryValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
    marginTop: 4,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F97316',
  },
  paymentMethodsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  methodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  methodItemSelected: {
    borderColor: '#F97316',
    backgroundColor: '#FFF7ED',
  },
  methodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  methodDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: '#F97316',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#F97316',
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  securityText: {
    fontSize: 12,
    color: '#1E40AF',
    marginLeft: 8,
    flex: 1,
  },
  securityBold: {
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  payButton: {
    backgroundColor: '#F97316',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  payButtonDisabled: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0,
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loaderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  loaderContent: {
    backgroundColor: '#FFFFFF',
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 16,
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
});
