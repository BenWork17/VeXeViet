export type ErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'TOKEN_EXPIRED'
  | 'TOKEN_INVALID'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'VALIDATION_ERROR'
  | 'INVALID_INPUT'
  | 'NOT_FOUND'
  | 'ROUTE_NOT_FOUND'
  | 'BOOKING_NOT_FOUND'
  | 'REVIEW_NOT_FOUND'
  | 'CONFLICT'
  | 'SEATS_UNAVAILABLE'
  | 'SEATS_ALREADY_HELD'
  | 'BOOKING_EXPIRED'
  | 'BOOKING_ALREADY_CANCELLED'
  | 'INSUFFICIENT_SEATS'
  | 'INVALID_SEAT_NUMBERS'
  | 'PASSENGER_SEAT_MISMATCH'
  | 'TRIP_NOT_COMPLETED'
  | 'REVIEW_ALREADY_EXISTS'
  | 'RATE_LIMIT_EXCEEDED'
  | 'NETWORK_ERROR'
  | 'SESSION_EXPIRED'
  | 'INTERNAL_ERROR'
  | 'INTERNAL_SERVER_ERROR'
  | 'SERVICE_UNAVAILABLE';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  requestId?: string;
}

export interface ApiError {
  success: false;
  error: {
    code: ErrorCode | (string & {});
    message: string;
    details?: unknown;
  };
  requestId?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const ERROR_MESSAGES: Record<string, string> = {
  INVALID_CREDENTIALS: 'Email hoặc mật khẩu không đúng',
  TOKEN_EXPIRED: 'Phiên đăng nhập hết hạn, vui lòng đăng nhập lại',
  TOKEN_INVALID: 'Token không hợp lệ',
  UNAUTHORIZED: 'Bạn cần đăng nhập để thực hiện thao tác này',
  FORBIDDEN: 'Bạn không có quyền thực hiện thao tác này',
  VALIDATION_ERROR: 'Dữ liệu không hợp lệ',
  INVALID_INPUT: 'Thông tin nhập vào không hợp lệ',
  NOT_FOUND: 'Không tìm thấy dữ liệu',
  ROUTE_NOT_FOUND: 'Không tìm thấy tuyến xe',
  BOOKING_NOT_FOUND: 'Không tìm thấy đơn đặt vé',
  REVIEW_NOT_FOUND: 'Không tìm thấy đánh giá',
  CONFLICT: 'Dữ liệu bị xung đột, vui lòng tải lại trang',
  SEATS_UNAVAILABLE: 'Ghế đã được đặt, vui lòng chọn ghế khác',
  SEATS_ALREADY_HELD: 'Ghế đang được giữ bởi người khác',
  BOOKING_EXPIRED: 'Đơn đặt vé đã hết hạn',
  BOOKING_ALREADY_CANCELLED: 'Đơn đặt vé đã bị hủy trước đó',
  INSUFFICIENT_SEATS: 'Không đủ ghế trống',
  INVALID_SEAT_NUMBERS: 'Số ghế không hợp lệ',
  PASSENGER_SEAT_MISMATCH: 'Số hành khách không khớp với số ghế đã chọn',
  TRIP_NOT_COMPLETED: 'Bạn chỉ có thể đánh giá sau khi hoàn thành chuyến đi',
  REVIEW_ALREADY_EXISTS: 'Bạn đã đánh giá chuyến đi này trước đó',
  RATE_LIMIT_EXCEEDED: 'Bạn thao tác quá nhanh, vui lòng thử lại sau ít phút',
  NETWORK_ERROR: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.',
  SESSION_EXPIRED: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  INTERNAL_ERROR: 'Đã xảy ra lỗi hệ thống, vui lòng thử lại sau',
  INTERNAL_SERVER_ERROR: 'Đã xảy ra lỗi hệ thống, vui lòng thử lại sau',
  SERVICE_UNAVAILABLE: 'Dịch vụ tạm thời không khả dụng',
};
