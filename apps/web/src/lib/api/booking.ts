import { BookingDetails } from '@/types/booking';
import { mockBookingApi } from '@/lib/api/mock/booking';

// Mock API to simulate fetching booking details
export async function getBookingById(bookingId: string): Promise<BookingDetails> {
  return mockBookingApi.getBookingById(bookingId);
}
