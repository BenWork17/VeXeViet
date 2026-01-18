import { BookingDetails } from '@/types/booking';

export async function getBookingById(bookingId: string): Promise<BookingDetails> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    id: bookingId,
    bookingCode: `VXV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    status: 'CONFIRMED',
    createdAt: new Date().toISOString(),
    
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
    transactionId: 'TXN-' + Date.now(),
  };
}
