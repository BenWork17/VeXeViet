import { Route } from '@/types/models';

const mockRoutes: Record<string, Route> = {
  '1': {
    id: '1',
    operator: {
      id: 'op1',
      name: 'Phuong Trang (Futa Bus Lines)',
      logoUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=PT',
      rating: 4.8,
      totalReviews: 1250,
    },
    busType: 'Limousine 34 Seats',
    licensePlate: '51B-123.45',
    departureTime: '2026-01-15T08:00:00Z',
    arrivalTime: '2026-01-15T14:00:00Z',
    departureLocation: 'Mien Tay Bus Station, HCM',
    arrivalLocation: 'Da Lat Bus Station, Lam Dong',
    duration: '6h 00m',
    price: 350000,
    availableSeats: 12,
    amenities: [
      { id: '1', name: 'Wifi', icon: 'Wifi' },
      { id: '2', name: 'Water', icon: 'Cup' },
      { id: '3', name: 'Charging Port', icon: 'BatteryCharging' },
      { id: '4', name: 'Blanket', icon: 'Wind' },
    ],
    pickupPoints: [
      { id: 'p1', time: '08:00', location: 'Mien Tay Bus Station', address: '395 Kinh Duong Vuong, An Lac, Binh Tan, HCM' },
      { id: 'p2', time: '08:30', location: 'Le Hong Phong Office', address: '231 Le Hong Phong, Ward 4, District 5, HCM' },
    ],
    dropoffPoints: [
      { id: 'd1', time: '13:30', location: 'Bao Loc City', address: 'National Road 20, Bao Loc' },
      { id: 'd2', time: '14:00', location: 'Da Lat Bus Station', address: '01 To Hien Thanh, Da Lat' },
    ],
    policies: [
      { type: 'CANCELLATION', title: 'Cancellation Policy', description: 'Free cancellation before 24h of departure. 50% refund before 12h.' },
      { type: 'LUGGAGE', title: 'Luggage Policy', description: 'Maximum 20kg per passenger. Oversize items may incur extra fee.' },
    ],
    images: [
      'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=1000',
    ],
  },
};

export async function getRouteDetailById(id: string): Promise<Route | null> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  return mockRoutes[id] || null;
}
