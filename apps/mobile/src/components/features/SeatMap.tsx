import React from 'react';
import { View, StyleSheet, FlatList, Text, Dimensions } from 'react-native';
import { Seat, SeatStatus, SeatType } from './Seat';

export interface SeatData {
  id: string;
  status: SeatStatus;
  type: SeatType;
}

interface SeatMapProps {
  busType: 'Standard' | 'Limousine';
  seats: SeatData[];
  selectedSeats: string[];
  onSeatSelect: (id: string) => void;
}

export const SeatMap: React.FC<SeatMapProps> = ({ busType, seats, selectedSeats, onSeatSelect }) => {
  const numColumns = busType === 'Limousine' ? 3 : 4;
  
  const renderItem = ({ item }: { item: SeatData }) => (
    <Seat
      id={item.id}
      status={selectedSeats.includes(item.id) ? 'selected' : item.status}
      type={item.type}
      onPress={onSeatSelect}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.driverSection}>
        <Text style={styles.driverText}>DRIVERS / FRONT</Text>
      </View>
      
      <FlatList
        data={seats}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        contentContainerStyle={styles.listContent}
        scrollEnabled={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  driverSection: {
    width: '60%',
    height: 30,
    backgroundColor: '#E5E7EB',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  driverText: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '600',
    letterSpacing: 1,
  },
  listContent: {
    alignItems: 'center',
  }
});
