import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useOfflineTickets } from '../../hooks/useOfflineTickets';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { OfflineBanner } from '../../components/OfflineBanner';
import { Ticket } from '../../types/ticket';

function getTicketStatus(ticket: Ticket): 'active' | 'used' | 'expired' {
  if (ticket.status === 'USED') return 'used';
  const departureDate = new Date(ticket.route.departureTime);
  if (departureDate < new Date()) return 'expired';
  return 'active';
}

function getStatusColor(status: 'active' | 'used' | 'expired'): string {
  switch (status) {
    case 'active': return '#22c55e';
    case 'used': return '#6b7280';
    case 'expired': return '#ef4444';
  }
}

function getStatusLabel(status: 'active' | 'used' | 'expired'): string {
  switch (status) {
    case 'active': return 'Sắp khởi hành';
    case 'used': return 'Đã sử dụng';
    case 'expired': return 'Đã hết hạn';
  }
}

interface TicketCardProps {
  ticket: Ticket;
  onPress: () => void;
}

function TicketCard({ ticket, onPress }: TicketCardProps) {
  const status = getTicketStatus(ticket);
  const statusColor = getStatusColor(status);
  const statusLabel = getStatusLabel(status);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
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

  return (
    <TouchableOpacity style={styles.ticketCard} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.ticketHeader}>
        <View style={styles.route}>
          <Text style={styles.cityText}>{ticket.route.origin}</Text>
          <Text style={styles.arrow}>→</Text>
          <Text style={styles.cityText}>{ticket.route.destination}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <Text style={styles.statusText}>{statusLabel}</Text>
        </View>
      </View>

      <View style={styles.ticketBody}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Ngày:</Text>
          <Text style={styles.value}>{formatDate(ticket.route.departureTime)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Giờ:</Text>
          <Text style={styles.value}>{formatTime(ticket.route.departureTime)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Hành khách:</Text>
          <Text style={styles.value}>{ticket.passenger.fullName}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Ghế:</Text>
          <Text style={styles.value}>{ticket.seatNumber}</Text>
        </View>
      </View>

      <View style={styles.ticketFooter}>
        <Text style={styles.bookingCode}>Mã vé: {ticket.ticketCode}</Text>
      </View>
    </TouchableOpacity>
  );
}

function EmptyState() {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>🎫</Text>
      <Text style={styles.emptyTitle}>Chưa có vé nào</Text>
      <Text style={styles.emptyDescription}>
        Vé xe bạn đặt sẽ được lưu tại đây để xem offline
      </Text>
    </View>
  );
}

export function TicketsScreen() {
  const navigation = useNavigation();
  const { tickets, isLoading, refreshTickets } = useOfflineTickets();
  const { isConnected } = useNetworkStatus();

  const handleTicketPress = useCallback((ticket: Ticket) => {
    navigation.navigate('TicketDetail' as never, { ticketId: ticket.id } as never);
  }, [navigation]);

  const renderTicket = useCallback(({ item }: { item: Ticket }) => (
    <TicketCard ticket={item} onPress={() => handleTicketPress(item)} />
  ), [handleTicketPress]);

  const keyExtractor = useCallback((item: Ticket) => item.id, []);

  if (isLoading && tickets.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Đang tải vé...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <OfflineBanner />
      <FlatList
        data={tickets}
        renderItem={renderTicket}
        keyExtractor={keyExtractor}
        contentContainerStyle={tickets.length === 0 ? styles.emptyContainer : styles.listContainer}
        ListEmptyComponent={EmptyState}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refreshTickets}
            colors={['#2563eb']}
            tintColor="#2563eb"
            enabled={isConnected}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  listContainer: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ticketCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#2563eb',
  },
  route: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  arrow: {
    fontSize: 16,
    color: '#ffffff',
    marginHorizontal: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  ticketBody: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#6b7280',
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  ticketFooter: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    padding: 12,
    backgroundColor: '#f9fafb',
  },
  bookingCode: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});
