import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { format } from 'date-fns';
import Icon from 'react-native-vector-icons/Feather';

const mockBookings = [
  {
    id: 'b1',
    route: 'HCM → Da Lat',
    date: '2026-01-20T08:00:00Z',
    status: 'Upcoming',
    price: '350.000đ',
  },
  {
    id: 'b2',
    route: 'HCM → Vung Tau',
    date: '2025-12-15T10:00:00Z',
    status: 'Completed',
    price: '200.000đ',
  },
];

const BookingHistoryScreen = () => {
  const renderItem = ({ item }: { item: typeof mockBookings[0] }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.routeText}>{item.route}</Text>
        <Text style={[styles.statusText, item.status === 'Upcoming' ? styles.upcoming : styles.completed]}>
          {item.status}
        </Text>
      </View>
      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Icon name="calendar" size={14} color="#6b7280" />
          <Text style={styles.infoText}>{format(new Date(item.date), 'EEE, dd MMM yyyy')}</Text>
        </View>
        <Text style={styles.priceText}>{item.price}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={mockBookings}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="ticket" size={48} color="#9ca3af" />
            <Text style={styles.emptyText}>No bookings found</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  routeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  upcoming: {
    backgroundColor: '#eff6ff',
    color: '#3b82f6',
  },
  completed: {
    backgroundColor: '#f0fdf4',
    color: '#22c55e',
  },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 64,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
});

export default BookingHistoryScreen;
