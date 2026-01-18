export interface BookingDetails {
  id: string;
  bookingCode: string;
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED';
  createdAt: string;
  
  // Route info
  route: {
    id: string;
    from: string;
    to: string;
    departureTime: string;
    arrivalTime: string;
    duration: string;
  };
  
  // Operator info
  operator: {
    id: string;
    name: string;
    logoUrl: string;
  };
  
  // Bus info
  busType: string;
  licensePlate: string;
  
  // Passenger info
  passengers: Array<{
    fullName: string;
    phone: string;
    email?: string;
    seatNumber: string;
  }>;
  
  // Pricing
  ticketPrice: number;
  serviceFee: number;
  totalPrice: number;
  
  // Payment
  paymentMethod: string;
  paymentStatus: 'PAID' | 'PENDING' | 'REFUNDED';
  transactionId?: string;
}
