import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { BookingDetails } from '../../types/booking';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 32;

interface TicketWalletScreenProps {
  navigation: any;
}

function formatDateTime(dateTime: string): string {
  const date = new Date(dateTime);
  return date.toLocaleString('vi-VN', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
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

function isActiveTicket(booking: BookingDetails): boolean {
  const now = new Date();
  const departureTime = new Date(booking.route.departureTime);
  return departureTime > now && booking.status === 'CONFIRMED' && booking.paymentStatus === 'PAID';
}

export default function TicketWalletScreen({ navigation }: TicketWalletScreenProps) {
  const [activeTickets, setActiveTickets] = useState<BookingDetails[]>([]);
  const [pastTickets, setPastTickets] = useState<BookingDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showPastTickets, setShowPastTickets] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  async function fetchTickets() {
    try {
      const mockBookings: BookingDetails[] = [
        {
          id: '1',
          bookingCode: 'VXV2024001',
          status: 'CONFIRMED',
          createdAt: '2024-01-10T08:00:00Z',
          route: {
            id: 'r1',
            from: 'TP. Hồ Chí Minh',
            to: 'Đà Lạt',
            departureTime: '2024-01-20T07:00:00Z',
            arrivalTime: '2024-01-20T14:00:00Z',
            duration: '7h',
          },
          operator: {
            id: 'op1',
            name: 'Phương Trang',
            logoUrl: '',
          },
          busType: 'Giường nằm VIP',
          licensePlate: '51B-12345',
          passengers: [
            {
              fullName: 'Nguyễn Văn A',
              phone: '0901234567',
              email: 'nguyenvana@example.com',
              seatNumber: 'A1',
            },
          ],
          ticketPrice: 250000,
          serviceFee: 10000,
          totalPrice: 260000,
          paymentMethod: 'VNPAY',
          paymentStatus: 'PAID',
          transactionId: 'TXN123456',
        },
        {
          id: '2',
          bookingCode: 'VXV2024002',
          status: 'CONFIRMED',
          createdAt: '2024-01-05T10:00:00Z',
          route: {
            id: 'r2',
            from: 'Hà Nội',
            to: 'Hải Phòng',
            departureTime: '2024-01-15T09:00:00Z',
            arrivalTime: '2024-01-15T11:30:00Z',
            duration: '2h 30m',
          },
          operator: {
            id: 'op2',
            name: 'Mai Linh',
            logoUrl: '',
          },
          busType: 'Limousine',
          licensePlate: '29A-98765',
          passengers: [
            {
              fullName: 'Trần Thị B',
              phone: '0912345678',
              seatNumber: 'B2',
            },
          ],
          ticketPrice: 180000,
          serviceFee: 8000,
          totalPrice: 188000,
          paymentMethod: 'MOMO',
          paymentStatus: 'PAID',
          transactionId: 'TXN789012',
        },
      ];

      const active: BookingDetails[] = [];
      const past: BookingDetails[] = [];

      mockBookings.forEach(booking => {
        if (isActiveTicket(booking)) {
          active.push(booking);
        } else {
          past.push(booking);
        }
      });

      active.sort((a, b) => 
        new Date(a.route.departureTime).getTime() - new Date(b.route.departureTime).getTime()
      );

      past.sort((a, b) => 
        new Date(b.route.departureTime).getTime() - new Date(a.route.departureTime).getTime()
      );

      setActiveTickets(active);
      setPastTickets(past);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải danh sách vé');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function handleRefresh() {
    setRefreshing(true);
    fetchTickets();
  }

  function handleTicketPress(booking: BookingDetails) {
    navigation.navigate('Ticket', { bookingId: booking.id });
  }

  function renderTicketCard(booking: BookingDetails, isActive: boolean = true) {
    const allSeats = booking.passengers.map(p => p.seatNumber).join(', ');
    
    return (
      <TouchableOpacity
        key={booking.id}
        style={styles.ticketCardWrapper}
        onPress={() => handleTicketPress(booking)}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={isActive ? ['#F97316', '#EA580C', '#C2410C'] : ['#9CA3AF', '#6B7280', '#4B5563']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.ticketCard}
        >
          <View style={styles.perforationLeft} />
          <View style={styles.perforationRight} />
          
          <View style={styles.ticketHeader}>
            <View style={styles.ticketBadge}>
              <MaterialCommunityIcons 
                name={isActive ? 'ticket-confirmation' : 'ticket-outline'} 
                size={20} 
                color="#FFFFFF" 
              />
              <Text style={styles.ticketBadgeText}>
                {isActive ? 'Vé đang hoạt động' : 'Vé đã sử dụng'}
              </Text>
            </View>
            <Text style={styles.ticketCode}>{booking.bookingCode}</Text>
          </View>

          <View style={styles.routeContainer}>
            <View style={styles.locationContainer}>
              <Text style={styles.locationText}>{booking.route.from}</Text>
              <Text style={styles.timeText}>{formatDateTime(booking.route.departureTime)}</Text>
            </View>
            
            <View style={styles.routeArrowContainer}>
              <MaterialCommunityIcons name="arrow-right-thick" size={32} color="#FFFFFF" />
              <Text style={styles.durationText}>{booking.route.duration}</Text>
            </View>
            
            <View style={[styles.locationContainer, styles.locationRight]}>
              <Text style={styles.locationText}>{booking.route.to}</Text>
              <Text style={styles.timeText}>{formatDateTime(booking.route.arrivalTime)}</Text>
            </View>
          </View>

          <View style={styles.dashedDivider}>
            <View style={styles.dashedLine} />
          </View>

          <View style={styles.ticketDetails}>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="bus" size={18} color="#FFFFFF" />
              <Text style={styles.detailText}>{booking.operator.name}</Text>
            </View>
            
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="seat-passenger" size={18} color="#FFFFFF" />
              <Text style={styles.detailText}>Ghế {allSeats}</Text>
            </View>
            
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="cash" size={18} color="#FFFFFF" />
              <Text style={styles.detailText}>{formatCurrency(booking.totalPrice)}</Text>
            </View>
          </View>

          <View style={styles.ticketFooter}>
            <MaterialCommunityIcons name="qrcode" size={40} color="#FFFFFF" />
            <Text style={styles.tapToViewText}>Nhấn để xem chi tiết</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <MaterialCommunityIcons name="ticket" size={48} color="#F97316" />
          <Text style={styles.loadingText}>Đang tải ví vé...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.header}>
          <MaterialCommunityIcons name="wallet" size={32} color="#F97316" />
          <Text style={styles.headerTitle}>Ví vé của tôi</Text>
          <Text style={styles.headerSubtitle}>
            Quản lý và xem tất cả các vé của bạn
          </Text>
        </View>

        {activeTickets.length === 0 && pastTickets.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="ticket-outline" size={80} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>Chưa có vé nào</Text>
            <Text style={styles.emptyMessage}>
              Đặt vé đầu tiên của bạn để bắt đầu hành trình
            </Text>
            <TouchableOpacity 
              style={styles.bookNowButton}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.bookNowText}>Đặt vé ngay</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {activeTickets.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons name="ticket-confirmation" size={24} color="#10B981" />
                  <Text style={styles.sectionTitle}>Vé đang hoạt động</Text>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{activeTickets.length}</Text>
                  </View>
                </View>
                {activeTickets.map(ticket => renderTicketCard(ticket, true))}
              </View>
            )}

            {pastTickets.length > 0 && (
              <View style={styles.section}>
                <TouchableOpacity
                  style={styles.sectionHeader}
                  onPress={() => setShowPastTickets(!showPastTickets)}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons name="history" size={24} color="#6B7280" />
                  <Text style={[styles.sectionTitle, styles.pastTitle]}>Vé đã sử dụng</Text>
                  <View style={[styles.badge, styles.pastBadge]}>
                    <Text style={styles.badgeText}>{pastTickets.length}</Text>
                  </View>
                  <MaterialCommunityIcons 
                    name={showPastTickets ? 'chevron-up' : 'chevron-down'} 
                    size={24} 
                    color="#6B7280" 
                  />
                </TouchableOpacity>
                
                {showPastTickets && pastTickets.map(ticket => renderTicketCard(ticket, false))}
              </View>
            )}
          </>
        )}

        <View style={styles.footer}>
          <MaterialCommunityIcons name="information" size={16} color="#6B7280" />
          <Text style={styles.footerText}>
            Vé sẽ tự động chuyển sang "Đã sử dụng" sau khi chuyến xe khởi hành
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
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 12,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
  bookNowButton: {
    backgroundColor: '#F97316',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 24,
  },
  bookNowText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  section: {
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
  },
  pastTitle: {
    color: '#6B7280',
  },
  badge: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  pastBadge: {
    backgroundColor: '#6B7280',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  ticketCardWrapper: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  ticketCard: {
    width: CARD_WIDTH,
    borderRadius: 16,
    padding: 20,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  perforationLeft: {
    position: 'absolute',
    left: -12,
    top: '50%',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    transform: [{ translateY: -12 }],
  },
  perforationRight: {
    position: 'absolute',
    right: -12,
    top: '50%',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    transform: [{ translateY: -12 }],
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  ticketBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ticketBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  ticketCode: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  locationContainer: {
    flex: 1,
  },
  locationRight: {
    alignItems: 'flex-end',
  },
  locationText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  timeText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
  },
  routeArrowContainer: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: 11,
    marginTop: 4,
  },
  dashedDivider: {
    height: 1,
    marginVertical: 16,
    overflow: 'hidden',
  },
  dashedLine: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.4)',
    borderStyle: 'dashed',
  },
  ticketDetails: {
    gap: 12,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  ticketFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.3)',
  },
  tapToViewText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 16,
    marginTop: 8,
  },
  footerText: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
    lineHeight: 18,
  },
});
