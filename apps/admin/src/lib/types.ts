import type { UserRole } from '@vexeviet/types';

export type AdminRole = Extract<UserRole, 'ADMIN' | 'OPERATOR'>;
export type AdminSection = 'dashboard' | 'bookings' | 'payments' | 'routes' | 'operators' | 'users' | 'audit-logs';

export type AdminSession = {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  operatorId?: string;
};

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'EXPIRED';
export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
export type RouteStatus = 'ACTIVE' | 'INACTIVE' | 'CANCELLED';
export type UserStatus = 'ACTIVE' | 'PENDING_VERIFICATION' | 'SUSPENDED' | 'DELETED';

export type AdminBooking = {
  id: string;
  bookingCode: string;
  customerName: string;
  customerEmail: string;
  operatorId: string;
  operatorName: string;
  routeName: string;
  departureDate: string;
  seats: string[];
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  createdAt: string;
};

export type AdminPayment = {
  id: string;
  bookingCode: string;
  provider: 'VNPay' | 'Momo' | 'ZaloPay';
  status: PaymentStatus;
  amount: number;
  updatedAt: string;
  risk: 'normal' | 'watch' | 'urgent';
};

export type AdminRoute = {
  id: string;
  operatorId: string;
  operatorName: string;
  name: string;
  origin: string;
  destination: string;
  departureTime: string;
  busType: 'LIMOUSINE' | 'SLEEPER' | 'STANDARD' | 'VIP';
  totalSeats: number;
  availableSeats: number;
  price: number;
  status: RouteStatus;
};

export type AdminOperator = {
  id: string;
  name: string;
  contactEmail: string;
  activeRoutes: number;
  monthlyBookings: number;
  rating: number;
  status: 'ACTIVE' | 'REVIEW' | 'SUSPENDED';
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  verified: boolean;
  createdAt: string;
};

export type AuditLog = {
  id: string;
  actor: string;
  role: AdminRole;
  action: string;
  target: string;
  createdAt: string;
  severity: 'info' | 'warning' | 'danger';
};
