import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView,
  Alert
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { SeatMap, SeatData } from '../../components/features/SeatMap';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// Mock Data
const generateMockSeats = (): SeatData[] => {
  const seats: SeatData[] = [];
  const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
  rows.forEach(row => {
    for (let i = 1; i <= 4; i++) {
      seats.push({
        id: `${row}${i}`,
        status: Math.random() > 0.8 ? 'occupied' : 'available',
        type: row === 'A' ? 'vip' : 'standard'
      });
    }
  });
  return seats;
};

export default function SeatSelectionScreen() {
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const seats = useMemo(() => generateMockSeats(), []);
  const basePrice = 250000;
  const vipSurcharge = 50000;

  const handleSeatSelect = async (id: string) => {
    try {
      if (selectedSeats.includes(id)) {
        setSelectedSeats(prev => prev.filter(s => s !== id));
        await Haptics.selectionAsync();
      } else {
        if (selectedSeats.length >= 5) {
          Alert.alert('Limit reached', 'You can only select up to 5 seats.');
          return;
        }
        setSelectedSeats(prev => [...prev, id]);
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (e) {
      // Haptics might not be available
      setSelectedSeats(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
    }
  };

  const totalPrice = selectedSeats.reduce((total, id) => {
    const seat = seats.find(s => s.id === id);
    return total + basePrice + (seat?.type === 'vip' ? vipSurcharge : 0);
  }, 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Select Seats</Text>
        <Text style={styles.headerSubtitle}>HCM City → Da Lat | 15 Jan, 2026</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.legendContainer}>
          <LegendItem icon="armchair" color="#10B981" label="Available" />
          <LegendItem icon="armchair" color="#D1D5DB" label="Occupied" />
          <LegendItem icon="armchair" color="#3B82F6" label="Selected" />
        </View>

        <View style={styles.mapWrapper}>
          <SeatMap 
            busType="Standard"
            seats={seats}
            selectedSeats={selectedSeats}
            onSeatSelect={handleSeatSelect}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.summaryInfo}>
          <Text style={styles.selectedCount}>
            {selectedSeats.length} Seats Selected: {selectedSeats.join(', ')}
          </Text>
          <Text style={styles.totalPrice}>
            {totalPrice.toLocaleString()} VND
          </Text>
        </View>
        <TouchableOpacity 
          style={[styles.continueButton, selectedSeats.length === 0 && styles.disabledButton]}
          disabled={selectedSeats.length === 0}
        >
          <Text style={styles.continueText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const LegendItem = ({ icon, color, label }: { icon: string, color: string, label: string }) => (
  <View style={styles.legendItem}>
    <MaterialCommunityIcons name={icon} size={20} color={color} />
    <Text style={styles.legendLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  scrollContent: {
    padding: 16,
    alignItems: 'center',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendLabel: {
    fontSize: 12,
    color: '#4B5563',
    marginLeft: 4,
  },
  mapWrapper: {
    width: '100%',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  summaryInfo: {
    marginBottom: 12,
  },
  selectedCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2563EB',
    marginTop: 2,
  },
  continueButton: {
    backgroundColor: '#F97316',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledButton: {
    backgroundColor: '#E5E7EB',
  },
  continueText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
