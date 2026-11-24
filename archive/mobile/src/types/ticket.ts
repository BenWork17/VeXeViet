export interface PassengerInfo {
  fullName: string;
  phone: string;
  email?: string;
  seatNumber: string;
}

export interface RouteDetails {
  id: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
}

export interface OperatorInfo {
  id: string;
  name: string;
  logoUrl: string;
}

export interface Ticket {
  id: string;
  bookingCode: string;
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED' | 'USED' | 'EXPIRED';
  createdAt: string;
  
  route: RouteDetails;
  operator: OperatorInfo;
  
  busType: string;
  licensePlate: string;
  
  passengers: PassengerInfo[];
  
  ticketPrice: number;
  serviceFee: number;
  totalPrice: number;
  
  paymentMethod: string;
  paymentStatus: 'PAID' | 'PENDING' | 'REFUNDED';
  transactionId?: string;
  
  qrCodeData: string;
  
  syncedAt?: string;
  isOfflineOnly?: boolean;
}

export interface TicketSyncResult {
  synced: string[];
  failed: string[];
  newTickets: Ticket[];
}
