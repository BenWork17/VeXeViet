import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Share,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useOfflineTickets } from '../../hooks/useOfflineTickets';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { OfflineBanner } from '../../components/OfflineBanner';
import { Ticket } from '../../types/ticket';

interface RouteParams {
  ticketId: string;
}

export function TicketDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { ticketId } = route.params as RouteParams;
  const { tickets } = useOfflineTickets();
  const { isConnected } = useNetworkStatus();
  const [ticket, setTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    const found = tickets.find(t => t.id === ticketId);
    setTicket(found || null);
  }, [tickets, ticketId]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleShare = async () => {
    if (!ticket) return;
    try {
      await Share.share({
        message: `Vé xe VeXeViet\nMã vé: ${ticket.ticketCode}\nTuyến: ${ticket.route.origin} → ${ticket.route.destination}\nNgày: ${formatDate(ticket.route.departureTime)}\nGiờ: ${formatTime(ticket.route.departureTime)}\nGhế: ${ticket.seatNumber}`,
        title: 'Chia sẻ vé xe',
      });
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể chia sẻ vé');
    }
  };

  if (!ticket) {
    return (
      <View style={styles.notFoundContainer}>
        <Text style={styles.notFoundText}>Không tìm thấy vé</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <OfflineBanner />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.ticketContainer}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Vé xe khách</Text>
            <Text style={styles.ticketCode}>{ticket.ticketCode}</Text>
          </View>

          <View style={styles.qrSection}>
            <View style={styles.qrPlaceholder}>
              <Text style={styles.qrText}>QR</Text>
              <Text style={styles.qrCode}>{ticket.qrCode}</Text>
            </View>
            <Text style={styles.qrHint}>Xuất trình mã QR khi lên xe</Text>
          </View>

          <View style={styles.routeSection}>
            <View style={styles.routePoint}>
              <View style={styles.dot} />
              <View style={styles.routeInfo}>
                <Text style={styles.routeLabel}>Điểm đón</Text>
                <Text style={styles.routeCity}>{ticket.route.origin}</Text>
                <Text style={styles.routeAddress}>{ticket.route.pickupPoint}</Text>
                <Text style={styles.routeTime}>{formatTime(ticket.route.departureTime)}</Text>
              </View>
            </View>
            <View style={styles.routeLine} />
            <View style={styles.routePoint}>
              <View style={[styles.dot, styles.dotDestination]} />
              <View style={styles.routeInfo}>
                <Text style={styles.routeLabel}>Điểm trả</Text>
                <Text style={styles.routeCity}>{ticket.route.destination}</Text>
                <Text style={styles.routeAddress}>{ticket.route.dropoffPoint}</Text>
                <Text style={styles.routeTime}>{formatTime(ticket.route.arrivalTime)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Thông tin hành trình</Text>
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Ngày khởi hành</Text>
                <Text style={styles.infoValue}>{formatDate(ticket.route.departureTime)}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Số ghế</Text>
                <Text style={styles.infoValue}>{ticket.seatNumber}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Nhà xe</Text>
                <Text style={styles.infoValue}>{ticket.route.busOperator}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Loại xe</Text>
                <Text style={styles.infoValue}>{ticket.route.busType}</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Thông tin hành khách</Text>
            <View style={styles.passengerInfo}>
              <Text style={styles.passengerName}>{ticket.passenger.fullName}</Text>
              <Text style={styles.passengerDetail}>{ticket.passenger.phone}</Text>
              {ticket.passenger.email && (
                <Text style={styles.passengerDetail}>{ticket.passenger.email}</Text>
              )}
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.priceSection}>
            <Text style={styles.priceLabel}>Giá vé</Text>
            <Text style={styles.priceValue}>
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(ticket.price)}
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Text style={styles.shareButtonText}>Chia sẻ vé</Text>
          </TouchableOpacity>
        </View>

        {!isConnected && (
          <Text style={styles.offlineNote}>
            Bạn đang xem vé đã lưu offline
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  scrollContent: {
    padding: 16,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  notFoundText: {
    fontSize: 18,
    color: '#6b7280',
    marginBottom: 16,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#2563eb',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  ticketContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    backgroundColor: '#2563eb',
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  ticketCode: {
    fontSize: 14,
    color: '#93c5fd',
    marginTop: 4,
    fontFamily: 'monospace',
  },
  qrSection: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f9fafb',
  },
  qrPlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrText: {
    fontSize: 48,
    fontWeight: '700',
    color: '#d1d5db',
  },
  qrCode: {
    fontSize: 10,
    color: '#9ca3af',
    marginTop: 8,
    fontFamily: 'monospace',
  },
  qrHint: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  routeSection: {
    padding: 20,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22c55e',
    marginTop: 4,
    marginRight: 12,
  },
  dotDestination: {
    backgroundColor: '#ef4444',
  },
  routeLine: {
    width: 2,
    height: 40,
    backgroundColor: '#e5e7eb',
    marginLeft: 5,
    marginVertical: 4,
  },
  routeInfo: {
    flex: 1,
  },
  routeLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 2,
  },
  routeCity: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  routeAddress: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  routeTime: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2563eb',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 20,
  },
  infoSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  infoItem: {
    width: '50%',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  passengerInfo: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
  },
  passengerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  passengerDetail: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f9ff',
  },
  priceLabel: {
    fontSize: 16,
    color: '#1f2937',
  },
  priceValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2563eb',
  },
  actions: {
    marginTop: 16,
  },
  shareButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  shareButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  offlineNote: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
});
