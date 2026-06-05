import { BookingDetails } from '@/types/booking';
import { mockBookingApi } from '@/lib/api/mock/booking';
import apiClient from './client';
import { API_ENDPOINTS } from '@vexeviet/types';

/**
 * Get booking details by ID
 * Tries real API first, falls back to mock
 */
export async function getBookingById(bookingId: string): Promise<BookingDetails> {
  try {
    const { data } = await apiClient.get(API_ENDPOINTS.BOOKINGS_BY_ID(bookingId));
    const booking = data.data || data;
    
    // Transform backend response to BookingDetails format
    return {
      id: booking.id || booking.bookingId || bookingId,
      bookingCode: booking.bookingCode || '',
      status: booking.status || 'PENDING',
      createdAt: booking.createdAt || new Date().toISOString(),
      route: {
        id: booking.route?.id || booking.routeId || '',
        from: booking.route?.origin || booking.route?.from || '',
        to: booking.route?.destination || booking.route?.to || '',
        departureTime: booking.route?.departureTime || '',
        arrivalTime: booking.route?.arrivalTime || '',
        duration: booking.route?.duration || '',
      },
      operator: {
        id: booking.route?.operatorId || '',
        name: booking.route?.operatorName || '',
        logoUrl: booking.route?.operatorLogo || '',
      },
      busType: booking.route?.busType || '',
      licensePlate: booking.route?.licensePlate || '',
      passengers: (booking.passengers || []).map((p: any) => ({
        fullName: `${p.lastName || ''} ${p.firstName || ''}`.trim(),
        phone: p.phone || booking.contactInfo?.phone || '',
        email: p.email || booking.contactInfo?.email || '',
        seatNumber: p.seatNumber || '',
      })),
      ticketPrice: booking.totalPrice?.breakdown?.tickets || booking.totalAmount || 0,
      serviceFee: booking.totalPrice?.breakdown?.serviceFee || 0,
      totalPrice: booking.totalPrice?.amount || booking.totalAmount || 0,
      paymentMethod: booking.paymentMethod || 'VNPAY',
      paymentStatus: booking.status === 'CONFIRMED' ? 'PAID' : 'PENDING',
      transactionId: booking.transactionId || undefined,
    };
  } catch {
    // Fallback to mock for development
    return mockBookingApi.getBookingById(bookingId);
  }
}

/**
 * Get booking details by booking code (public)
 */
export async function getBookingByCode(code: string): Promise<BookingDetails> {
  try {
    const { data } = await apiClient.get(API_ENDPOINTS.BOOKINGS_BY_CODE(code));
    const booking = data.data || data;
    
    return {
      id: booking.id || booking.bookingId || '',
      bookingCode: booking.bookingCode || code,
      status: booking.status || 'PENDING',
      createdAt: booking.createdAt || new Date().toISOString(),
      route: {
        id: booking.route?.id || '',
        from: booking.route?.origin || booking.route?.from || '',
        to: booking.route?.destination || booking.route?.to || '',
        departureTime: booking.route?.departureTime || '',
        arrivalTime: booking.route?.arrivalTime || '',
        duration: booking.route?.duration || '',
      },
      operator: {
        id: booking.route?.operatorId || '',
        name: booking.route?.operatorName || '',
        logoUrl: booking.route?.operatorLogo || '',
      },
      busType: booking.route?.busType || '',
      licensePlate: booking.route?.licensePlate || '',
      passengers: (booking.passengers || []).map((p: any) => ({
        fullName: `${p.lastName || ''} ${p.firstName || ''}`.trim(),
        phone: p.phone || '',
        email: p.email || '',
        seatNumber: p.seatNumber || '',
      })),
      ticketPrice: booking.totalPrice?.breakdown?.tickets || booking.totalAmount || 0,
      serviceFee: booking.totalPrice?.breakdown?.serviceFee || 0,
      totalPrice: booking.totalPrice?.amount || booking.totalAmount || 0,
      paymentMethod: booking.paymentMethod || 'VNPAY',
      paymentStatus: booking.status === 'CONFIRMED' ? 'PAID' : 'PENDING',
      transactionId: booking.transactionId || undefined,
    };
  } catch {
    throw new Error('Không tìm thấy thông tin đặt vé');
  }
}
