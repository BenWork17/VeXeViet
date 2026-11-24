import { BookingDetails } from '../types/booking';

// Mock API to simulate fetching booking details
export async function getBookingById(bookingId: string): Promise<BookingDetails> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Extract timestamp from bookingId if it follows pattern "BK-timestamp"
  const timestamp = bookingId.startsWith('BK-') ? parseInt(bookingId.substring(3)) : Date.now();

  // Mock data - in production, this would fetch from backend
  return {
    id: bookingId,
    bookingCode: `VXV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    status: 'CONFIRMED',
    createdAt: new Date(timestamp).toISOString(),
    
    route: {
      id: 'route-1',
      from: 'TP. Hồ Chí Minh',
      to: 'Đà Lạt',
      departureTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      arrivalTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 7 * 60 * 60 * 1000).toISOString(),
      duration: '7 giờ',
    },
    
    operator: {
      id: 'op-1',
      name: 'Phương Trang',
      logoUrl: '',
    },
    
    busType: 'Giường nằm 40 chỗ',
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
    transactionId: 'TXN-' + timestamp,
  };
}
