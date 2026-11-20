import type { UserRole } from '@vexeviet/types';

export type AdminRole = Extract<UserRole, 'ADMIN' | 'OPERATOR'>;
export type AdminSection =
  | 'dashboard'
  | 'bookings'
  | 'payments'
  | 'routes'
  | 'operator-images'
  | 'operators'
  | 'users'
  | 'audit-logs';

export type AdminSession = {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
};

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'EXPIRED';
export type PaymentStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED';
export type RouteStatus = 'ACTIVE' | 'INACTIVE' | 'DELETED';
export type BusType = 'STANDARD' | 'VIP' | 'LIMOUSINE' | 'SLEEPER';
export type OperatorStatus = 'PENDING_VERIFICATION' | 'ACTIVE' | 'SUSPENDED' | 'DELETED';
export type UserStatus = 'PENDING_VERIFICATION' | 'ACTIVE' | 'SUSPENDED' | 'DELETED';

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ListResponse<T> = {
  success: true;
  data: T[];
  pagination: Pagination;
};

export type ItemResponse<T> = {
  success: true;
  data: T;
};

export type AdminBooking = {
  id: string;
  bookingCode: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  operatorId: string;
  operatorName: string;
  routeId: string;
  routeName: string;
  departureDate: string;
  seats: string[];
  status: BookingStatus;
  paymentStatus: PaymentStatus | null;
  totalAmount: number;
  createdAt: string;
};

export type DashboardPoint = { label: string; value: number };

export type AdminDashboardStats = {
  todayBookings: number;
  revenueCompleted: number;
  paymentsNeedingAction: number;
  activeRoutes: number;
  operatorCount: number;
  revenueTrend: DashboardPoint[];
  bookingStatusSummary: DashboardPoint[];
};

export type PaymentProvider = 'VNPay' | 'Momo' | 'ZaloPay' | 'BankTransfer' | 'Cash';
export type PaymentMethod = 'VNPAY' | 'MOMO' | 'ZALOPAY' | 'BANK_TRANSFER' | 'CASH';

export type AdminPayment = {
  id: string;
  bookingCode: string;
  provider: PaymentProvider;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  risk: 'normal' | 'watch' | 'urgent';
  transactionRef: string;
  createdAt: string;
  updatedAt: string;
};

export type LabeledCount = { label: string; value: number };

export type AdminPaymentSummary = {
  totalCompleted: number;
  countByStatus: LabeledCount[];
  providerTrend: LabeledCount[];
  expiredCount: number;
};

export type AdminRoute = {
  id: string;
  operatorId: string;
  operatorName: string;
  name: string;
  origin: string;
  destination: string;
  departureTime: string;
  busType: BusType;
  totalSeats: number | null;
  availableSeats: number | null;
  price: number;
  status: RouteStatus;
  seatDataAvailable: boolean;
  hasBusTemplate: boolean;
};

export type OperatorRoute = AdminRoute;

export type AdminOperator = {
  id: string;
  name: string;
  contactEmail: string;
  activeRoutes: number;
  monthlyBookings: number;
  rating: null;
  status: OperatorStatus;
  avatarUrl?: string | null;
  operatorAvatarUrl?: string | null;
  createdAt: string;
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  status: UserStatus;
  verified: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt: string;
};

export type AuditSeverity = 'info' | 'warning' | 'danger';

export type AuditLogItem = {
  id: string;
  actor: string;
  actorId: string | null;
  role: string;
  action: string;
  target: string;
  severity: AuditSeverity;
  metadata: unknown;
  createdAt: string;
};
