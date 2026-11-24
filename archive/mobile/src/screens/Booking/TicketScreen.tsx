import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { getBookingById } from '../../services/bookingService';
import { BookingDetails } from '../../types/booking';
import { useNotifications } from '../../hooks/useNotifications';

interface TicketScreenProps {
  route: {
    params: {
      bookingId: string;
    };
  };
  navigation: any;
}

function formatDateTime(dateTime: string): string {
  const date = new Date(dateTime);
  return date.toLocaleString('vi-VN', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

export default function TicketScreen({ route, navigation }: TicketScreenProps) {
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { scheduleTripReminder, permissionStatus } = useNotifications();

  const bookingId = route.params.bookingId;

  useEffect(() => {
    async function fetchBooking() {
      if (!bookingId) {
        setError('Không tìm thấy mã đặt vé');
        setLoading(false);
        return;
      }

      try {
        const data = await getBookingById(bookingId);
        setBooking(data);
        
        if (data.paymentStatus === 'PAID' && permissionStatus.granted) {
          const allSeats = data.passengers.map(p => p.seatNumber).join(', ');
          await scheduleTripReminder(
            data.route.departureTime,
            data.bookingCode,
            data.route.from,
            data.route.to,
            allSeats
          );
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không thể tải thông tin vé');
      } finally {
        setLoading(false);
      }
    }

    fetchBooking();
  }, [bookingId, permissionStatus.granted]);

  const handleShare = async () => {
    if (!booking) return;

    const firstPassenger = booking.passengers[0];
    const allSeats = booking.passengers.map((p) => p.seatNumber).join(', ');

    const message = `🎫 VÉ XE VeXeViet

Mã vé: ${booking.bookingCode}

🚌 Thông tin chuyến đi:
${booking.route.from} → ${booking.route.to}
Khởi hành: ${formatDateTime(booking.route.departureTime)}
Loại xe: ${booking.busType}
Biển số: ${booking.licensePlate}

👤 Hành khách: ${firstPassenger.fullName}
📞 SĐT: ${firstPassenger.phone}
💺 Số ghế: ${allSeats}

💰 Tổng tiền: ${formatCurrency(booking.totalPrice)}
✅ Trạng thái: ${booking.paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Chờ thanh toán'}

📱 Vui lòng xuất trình mã vé khi lên xe.
`;

    try {
      await Share.share({
        message,
        title: `Vé xe ${booking.bookingCode}`,
      });
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể chia sẻ vé');
    }
  };

  const handleBackToHome = () => {
    // Reset navigation stack to go back to home
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Đang tải thông tin vé...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !booking) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle" size={64} color="#EF4444" />
          <Text style={styles.errorTitle}>Lỗi</Text>
          <Text style={styles.errorMessage}>{error || 'Không tìm thấy thông tin vé'}</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={handleBackToHome}>
            <Text style={styles.primaryButtonText}>Về trang chủ</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const firstPassenger = booking.passengers[0];
  const allSeats = booking.passengers.map((p) => p.seatNumber).join(', ');

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Success Banner */}
        <View style={styles.successBanner}>
          <MaterialCommunityIcons name="check-circle" size={48} color="#10B981" />
          <Text style={styles.successTitle}>Đặt vé thành công!</Text>
          <Text style={styles.successMessage}>Chúc bạn có một chuyến đi vui vẻ 🚌</Text>
        </View>

        {/* Ticket Card */}
        <View style={styles.ticketCard}>
          {/* Notch Decorations */}
          <View style={styles.notchLeft} />
          <View style={styles.notchRight} />

          {/* Header */}
          <View style={styles.ticketHeader}>
            <View style={styles.operatorInfo}>
              {booking.operator.logoUrl ? (
                <View style={styles.operatorLogo}>
                  <MaterialCommunityIcons name="bus" size={32} color="#F97316" />
                </View>
              ) : (
                <View style={styles.operatorLogo}>
                  <MaterialCommunityIcons name="bus" size={32} color="#F97316" />
                </View>
              )}
              <View>
                <Text style={styles.operatorName}>{booking.operator.name}</Text>
                <Text style={styles.busType}>{booking.busType}</Text>
              </View>
            </View>
            <View style={styles.bookingCodeContainer}>
              <Text style={styles.bookingCodeLabel}>Mã vé</Text>
              <Text style={styles.bookingCode}>{booking.bookingCode}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Route Info */}
          <View style={styles.routeSection}>
            <View style={styles.routeLocation}>
              <Text style={styles.locationLabel}>Điểm đi</Text>
              <Text style={styles.locationName}>{booking.route.from}</Text>
              <Text style={styles.locationTime}>{formatDateTime(booking.route.departureTime)}</Text>
            </View>
            <View style={styles.routeArrow}>
              <MaterialCommunityIcons name="arrow-right" size={32} color="#F97316" />
              <Text style={styles.duration}>{booking.route.duration}</Text>
            </View>
            <View style={[styles.routeLocation, styles.routeLocationRight]}>
              <Text style={styles.locationLabel}>Điểm đến</Text>
              <Text style={styles.locationName}>{booking.route.to}</Text>
              <Text style={styles.locationTime}>{formatDateTime(booking.route.arrivalTime)}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Passenger & Ticket Details */}
          <View style={styles.detailsSection}>
            <View style={styles.detailColumn}>
              <Text style={styles.detailSectionTitle}>THÔNG TIN HÀNH KHÁCH</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Tên:</Text>
                <Text style={styles.detailValue}>{firstPassenger.fullName}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>SĐT:</Text>
                <Text style={styles.detailValue}>{firstPassenger.phone}</Text>
              </View>
              {firstPassenger.email && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Email:</Text>
                  <Text style={styles.detailValue}>{firstPassenger.email}</Text>
                </View>
              )}
            </View>
            <View style={styles.detailColumn}>
              <Text style={styles.detailSectionTitle}>CHI TIẾT VÉ</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Số ghế:</Text>
                <Text style={[styles.detailValue, styles.seatNumber]}>{allSeats}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Số hành khách:</Text>
                <Text style={styles.detailValue}>{booking.passengers.length}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Biển số xe:</Text>
                <Text style={styles.detailValue}>{booking.licensePlate}</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          {/* QR Code */}
          <View style={styles.qrSection}>
            <Text style={styles.qrTitle}>MÃ QR VÉ</Text>
            <View style={styles.qrCodeContainer}>
              <QRCode value={booking.bookingCode} size={180} />
            </View>
            <View style={styles.qrInstructions}>
              <MaterialCommunityIcons name="information" size={20} color="#6B7280" />
              <Text style={styles.qrInstructionText}>
                Vui lòng xuất trình mã QR này cho tài xế khi lên xe
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Price Footer */}
          <View style={styles.priceFooter}>
            <View>
              <Text style={styles.priceLabel}>Tổng tiền</Text>
              <Text style={styles.priceValue}>{formatCurrency(booking.totalPrice)}</Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                booking.paymentStatus === 'PAID' ? styles.paidBadge : styles.pendingBadge,
              ]}
            >
              <MaterialCommunityIcons
                name={booking.paymentStatus === 'PAID' ? 'check' : 'clock-outline'}
                size={16}
                color="#FFFFFF"
              />
              <Text style={styles.statusText}>
                {booking.paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Chờ thanh toán'}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <MaterialCommunityIcons name="share-variant" size={20} color="#F97316" />
            <Text style={styles.shareButtonText}>Chia sẻ vé</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.homeButton} onPress={handleBackToHome}>
            <Text style={styles.homeButtonText}>Về trang chủ</Text>
          </TouchableOpacity>
        </View>

        {/* Support Info */}
        <View style={styles.supportCard}>
          <Text style={styles.supportText}>
            Cần hỗ trợ? Liên hệ <Text style={styles.supportBold}>1900-xxxx</Text> hoặc{' '}
            <Text style={styles.supportLink}>support@vexeviet.com</Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    padding: 16,
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
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#EF4444',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  successBanner: {
    backgroundColor: '#ECFDF5',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
    marginTop: 12,
    marginBottom: 4,
  },
  successMessage: {
    fontSize: 16,
    color: '#059669',
  },
  ticketCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    position: 'relative',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  notchLeft: {
    position: 'absolute',
    left: -12,
    top: '50%',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    marginTop: -12,
  },
  notchRight: {
    position: 'absolute',
    right: -12,
    top: '50%',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    marginTop: -12,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  operatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  operatorLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  operatorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  busType: {
    fontSize: 14,
    color: '#6B7280',
  },
  bookingCodeContainer: {
    alignItems: 'flex-end',
  },
  bookingCodeLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  bookingCode: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F97316',
    fontFamily: 'monospace',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
    borderStyle: 'dashed',
  },
  routeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  routeLocation: {
    flex: 1,
  },
  routeLocationRight: {
    alignItems: 'flex-end',
  },
  locationLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  locationName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  locationTime: {
    fontSize: 14,
    color: '#6B7280',
  },
  routeArrow: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  duration: {
    fontSize: 12,
    color: '#F97316',
    marginTop: 4,
  },
  detailsSection: {
    flexDirection: 'row',
    gap: 16,
  },
  detailColumn: {
    flex: 1,
  },
  detailSectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#6B7280',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'right',
    flex: 1,
  },
  seatNumber: {
    color: '#F97316',
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  qrSection: {
    alignItems: 'center',
  },
  qrTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6B7280',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  qrCodeContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  qrInstructions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    paddingHorizontal: 16,
  },
  qrInstructionText: {
    fontSize: 13,
    color: '#6B7280',
    flex: 1,
    textAlign: 'center',
  },
  priceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F97316',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  paidBadge: {
    backgroundColor: '#10B981',
  },
  pendingBadge: {
    backgroundColor: '#F59E0B',
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#F97316',
  },
  shareButtonText: {
    color: '#F97316',
    fontSize: 16,
    fontWeight: 'bold',
  },
  homeButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  homeButtonText: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#F97316',
    paddingVertical: 16,
    paddingHorizontal: 32,
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
  supportCard: {
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
