import type { AdminBooking, AdminOperator, AdminPayment, AdminRoute, AdminSession, AdminUser, AuditLog } from './types';

export const mockSessions: Record<'admin' | 'operator', AdminSession> = {
  admin: {
    id: 'admin-001',
    email: 'admin@vexeviet.com',
    name: 'VeXeViet Admin',
    role: 'ADMIN',
  },
  operator: {
    id: 'operator-001',
    email: 'operator@phuongtrang.vn',
    name: 'Phương Trang Operator',
    role: 'OPERATOR',
    operatorId: 'op-phuong-trang',
  },
};

export const bookings: AdminBooking[] = [
  {
    id: 'bk-001',
    bookingCode: 'VXV7A8B9',
    customerName: 'Nguyễn Minh Anh',
    customerEmail: 'minhanh@example.com',
    operatorId: 'op-phuong-trang',
    operatorName: 'Phương Trang',
    routeName: 'TP.HCM → Đà Lạt',
    departureDate: '2026-06-08',
    seats: ['A1', 'A2'],
    status: 'PENDING',
    paymentStatus: 'PENDING',
    totalAmount: 700000,
    createdAt: '2026-06-06T09:12:00+07:00',
  },
  {
    id: 'bk-002',
    bookingCode: 'VXV1C4D2',
    customerName: 'Trần Quốc Bảo',
    customerEmail: 'quocbao@example.com',
    operatorId: 'op-hanh-cafe',
    operatorName: 'Hạnh Cafe',
    routeName: 'Huế → Đà Nẵng',
    departureDate: '2026-06-09',
    seats: ['B4'],
    status: 'CONFIRMED',
    paymentStatus: 'COMPLETED',
    totalAmount: 180000,
    createdAt: '2026-06-06T10:21:00+07:00',
  },
  {
    id: 'bk-003',
    bookingCode: 'VXV9K2P1',
    customerName: 'Lê Thanh Hà',
    customerEmail: 'thanhha@example.com',
    operatorId: 'op-phuong-trang',
    operatorName: 'Phương Trang',
    routeName: 'Đà Nẵng → Hội An',
    departureDate: '2026-06-10',
    seats: ['C3', 'C4', 'C5'],
    status: 'EXPIRED',
    paymentStatus: 'FAILED',
    totalAmount: 450000,
    createdAt: '2026-06-06T11:05:00+07:00',
  },
];

export const payments: AdminPayment[] = [
  { id: 'pay-001', bookingCode: 'VXV7A8B9', provider: 'VNPay', status: 'PENDING', amount: 700000, updatedAt: '2026-06-06T09:20:00+07:00', risk: 'watch' },
  { id: 'pay-002', bookingCode: 'VXV1C4D2', provider: 'Momo', status: 'COMPLETED', amount: 180000, updatedAt: '2026-06-06T10:24:00+07:00', risk: 'normal' },
  { id: 'pay-003', bookingCode: 'VXV9K2P1', provider: 'VNPay', status: 'FAILED', amount: 450000, updatedAt: '2026-06-06T11:20:00+07:00', risk: 'urgent' },
];

export const routes: AdminRoute[] = [
  { id: 'rt-001', operatorId: 'op-phuong-trang', operatorName: 'Phương Trang', name: 'TP.HCM - Đà Lạt Express', origin: 'TP.HCM', destination: 'Đà Lạt', departureTime: '08:00', busType: 'LIMOUSINE', totalSeats: 45, availableSeats: 18, price: 350000, status: 'ACTIVE' },
  { id: 'rt-002', operatorId: 'op-hanh-cafe', operatorName: 'Hạnh Cafe', name: 'Huế - Đà Nẵng Morning', origin: 'Huế', destination: 'Đà Nẵng', departureTime: '07:30', busType: 'VIP', totalSeats: 32, availableSeats: 11, price: 180000, status: 'ACTIVE' },
  { id: 'rt-003', operatorId: 'op-phuong-trang', operatorName: 'Phương Trang', name: 'Đà Nẵng - Hội An Shuttle', origin: 'Đà Nẵng', destination: 'Hội An', departureTime: '14:00', busType: 'STANDARD', totalSeats: 29, availableSeats: 0, price: 150000, status: 'INACTIVE' },
];

export const operators: AdminOperator[] = [
  { id: 'op-phuong-trang', name: 'Phương Trang', contactEmail: 'ops@phuongtrang.vn', activeRoutes: 42, monthlyBookings: 1280, rating: 4.7, status: 'ACTIVE' },
  { id: 'op-hanh-cafe', name: 'Hạnh Cafe', contactEmail: 'support@hanhcafe.vn', activeRoutes: 18, monthlyBookings: 460, rating: 4.4, status: 'ACTIVE' },
  { id: 'op-new-partner', name: 'New Partner Bus', contactEmail: 'partner@example.com', activeRoutes: 0, monthlyBookings: 0, rating: 0, status: 'REVIEW' },
];

export const users: AdminUser[] = [
  { id: 'usr-001', name: 'Nguyễn Minh Anh', email: 'minhanh@example.com', role: 'CUSTOMER', status: 'ACTIVE', verified: true, createdAt: '2026-05-20' },
  { id: 'usr-002', name: 'Trần Operator', email: 'operator@phuongtrang.vn', role: 'OPERATOR', status: 'ACTIVE', verified: true, createdAt: '2026-04-12' },
  { id: 'usr-003', name: 'Lê Thanh Hà', email: 'thanhha@example.com', role: 'CUSTOMER', status: 'PENDING_VERIFICATION', verified: false, createdAt: '2026-06-06' },
];

export const auditLogs: AuditLog[] = [
  { id: 'audit-001', actor: 'VeXeViet Admin', role: 'ADMIN', action: 'Updated route status', target: 'TP.HCM - Đà Lạt Express', createdAt: '2026-06-06T10:45:00+07:00', severity: 'info' },
  { id: 'audit-002', actor: 'Phương Trang Operator', role: 'OPERATOR', action: 'Changed available seats', target: 'Đà Nẵng - Hội An Shuttle', createdAt: '2026-06-06T11:02:00+07:00', severity: 'warning' },
  { id: 'audit-003', actor: 'VeXeViet Admin', role: 'ADMIN', action: 'Investigated failed payment', target: 'VXV9K2P1', createdAt: '2026-06-06T11:30:00+07:00', severity: 'danger' },
];

export const backendContractNotes = [
  'LoginResponse trong docs/api-types.ts chưa trả role; admin app sẽ cần role từ login hoặc /users/profile.',
  'Route contract đang lệch giữa API-TESTING.md (origin/destination/busType) và api-types.ts (departureCity/arrivalCity/vehicleType).',
  'Seat status cho admin nên có BLOCKED để khóa ghế bảo trì, nhưng docs/api-types.ts hiện chỉ có AVAILABLE/HELD/BOOKED.',
  'Cần bổ sung endpoints admin list users, list payments, list all bookings, audit logs nếu backend chưa có.',
];
