import type { BookingStatus, OperatorStatus, PaymentStatus, RouteStatus, UserStatus } from './types';
import type { PillTone } from '@/components/ui';

type Mark = { label: string; tone: PillTone };

const booking: Record<BookingStatus, Mark> = {
  PENDING: { label: 'Chờ xử lý', tone: 'warning' },
  CONFIRMED: { label: 'Đã xác nhận', tone: 'positive' },
  CANCELLED: { label: 'Đã huỷ', tone: 'neutral' },
  COMPLETED: { label: 'Hoàn tất', tone: 'positive' },
  EXPIRED: { label: 'Hết hạn', tone: 'negative' },
};

const payment: Record<PaymentStatus, Mark> = {
  PENDING: { label: 'Chờ thanh toán', tone: 'warning' },
  PROCESSING: { label: 'Đang xử lý', tone: 'info' },
  COMPLETED: { label: 'Hoàn tất', tone: 'positive' },
  FAILED: { label: 'Thất bại', tone: 'negative' },
  CANCELLED: { label: 'Đã huỷ', tone: 'neutral' },
  EXPIRED: { label: 'Hết hạn', tone: 'negative' },
  REFUNDED: { label: 'Đã hoàn tiền', tone: 'neutral' },
  PARTIALLY_REFUNDED: { label: 'Hoàn tiền một phần', tone: 'neutral' },
};

const route: Record<RouteStatus, Mark> = {
  ACTIVE: { label: 'Đang mở', tone: 'positive' },
  INACTIVE: { label: 'Tạm dừng', tone: 'neutral' },
  DELETED: { label: 'Đã xoá', tone: 'negative' },
};

const account: Record<OperatorStatus | UserStatus, Mark> = {
  PENDING_VERIFICATION: { label: 'Chờ xác minh', tone: 'warning' },
  ACTIVE: { label: 'Hoạt động', tone: 'positive' },
  SUSPENDED: { label: 'Tạm khoá', tone: 'negative' },
  DELETED: { label: 'Đã xoá', tone: 'negative' },
};

export const bookingMark = (status: BookingStatus) => booking[status];
export const paymentMark = (status: PaymentStatus) => payment[status];
export const routeMark = (status: RouteStatus) => route[status];
export const accountMark = (status: OperatorStatus | UserStatus) => account[status];

export function riskMark(risk: 'normal' | 'watch' | 'urgent'): Mark {
  if (risk === 'urgent') return { label: 'Khẩn', tone: 'negative' };
  if (risk === 'watch') return { label: 'Theo dõi', tone: 'warning' };
  return { label: 'Bình thường', tone: 'neutral' };
}

export function severityMark(severity: 'info' | 'warning' | 'danger'): Mark {
  if (severity === 'danger') return { label: 'Nguy hiểm', tone: 'negative' };
  if (severity === 'warning') return { label: 'Cảnh báo', tone: 'warning' };
  return { label: 'Thông tin', tone: 'info' };
}

export const busTypeLabel: Record<'STANDARD' | 'VIP' | 'LIMOUSINE' | 'SLEEPER', string> = {
  STANDARD: 'Tiêu chuẩn',
  VIP: 'VIP',
  LIMOUSINE: 'Limousine',
  SLEEPER: 'Giường nằm',
};

export const roleLabelShort: Record<'ADMIN' | 'OPERATOR' | 'CUSTOMER', string> = {
  ADMIN: 'Quản trị',
  OPERATOR: 'Nhà xe',
  CUSTOMER: 'Khách hàng',
};
