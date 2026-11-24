import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export type SeatStatus = 'available' | 'occupied' | 'selected';
export type SeatType = 'standard' | 'vip';

interface SeatProps {
  id: string;
  status: SeatStatus;
  type: SeatType;
  onPress: (id: string) => void;
}

export const Seat: React.FC<SeatProps> = ({ id, status, type, onPress }) => {
  const isOccupied = status === 'occupied';
  const isSelected = status === 'selected';
  
  const getIconColor = () => {
    if (isSelected) return '#3B82F6'; // blue-500
    if (isOccupied) return '#D1D5DB'; // gray-300
    return '#10B981'; // green-500
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={isOccupied}
      onPress={() => onPress(id)}
      style={[
        styles.container,
        type === 'vip' && styles.vipContainer,
        isSelected && styles.selectedContainer
      ]}
      accessibilityLabel={`Seat ${id}, ${status}${type === 'vip' ? ', VIP' : ''}`}
      accessibilityRole="button"
    >
      <MaterialCommunityIcons 
        name="armchair" 
        size={36} 
        color={getIconColor()} 
      />
      <Text style={[styles.seatId, isOccupied && styles.occupiedText]}>{id}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 4,
    borderRadius: 8,
  },
  vipContainer: {
    borderWidth: 2,
    borderColor: '#FACC15', // yellow-400
  },
  selectedContainer: {
    backgroundColor: '#EFF6FF', // blue-50
  },
  seatId: {
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: -8,
  },
  occupiedText: {
    color: '#9CA3AF',
  }
});
