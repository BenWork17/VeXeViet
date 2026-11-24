export type Locale = 'vi' | 'en'
export type Currency = 'VND' | 'USD'

export interface HeaderCopy {
  trustRefund: string
  trustRoutes: string
  trustInstant: string
  lookupOrder: string
  support247: string
  tagline: string
  navSearch: string
  navTravel: string
  navExplore: string
  navOrders: string
  navNew: string
  hotlineLabel: string
  hotlineTitle: string
  hotlineSubtitle: string
  hotlineBooking: string
  hotlineEmergency: string
  hotlineEmail: string
  hotlineHours: string
  copied: string
  copy: string
  langTitle: string
  currencyTitle: string
  login: string
  opening: string
  register: string
  logout: string
  loggingOut: string
  account: string
}

export const HEADER_COPY: Record<Locale, HeaderCopy> = {
  vi: {
    trustRefund: 'Hoàn tiền 150% nếu nhà xe hủy chuyến',
    trustRoutes: '500+ tuyến xe toàn quốc',
    trustInstant: 'Xuất vé điện tử tức thì',
    lookupOrder: 'Tra cứu đơn hàng',
    support247: 'Trung tâm hỗ trợ',
    tagline: 'Đặt vé xe trực tuyến',
    navSearch: 'Tìm vé',
    navTravel: 'Bản đồ du lịch',
    navExplore: 'Khám phá',
    navOrders: 'Đơn của tôi',
    navNew: 'Mới',
    hotlineLabel: 'Hotline',
    hotlineTitle: 'Tổng đài hỗ trợ VeXeViet 24/7',
    hotlineSubtitle: 'Đội ngũ tư vấn đặt vé & xử lý sự cố chuyến đi',
    hotlineBooking: 'Đặt vé & Tư vấn lộ trình',
    hotlineEmergency: 'Hỗ trợ khẩn cấp & Khiếu nại',
    hotlineEmail: 'Email hỗ trợ khách hàng',
    hotlineHours: 'Hoạt động 24/7 — Kể cả Thứ 7, Chủ nhật & Lễ Tết',
    copied: 'Đã chép',
    copy: 'Chép',
    langTitle: 'Ngôn ngữ hiển thị',
    currencyTitle: 'Đơn vị tiền tệ',
    login: 'Đăng nhập',
    opening: 'Đang mở...',
    register: 'Đăng ký',
    logout: 'Đăng xuất',
    loggingOut: 'Đang đăng xuất...',
    account: 'Tài khoản',
  },
  en: {
    trustRefund: '150% refund guarantee if operator cancels',
    trustRoutes: '500+ nationwide routes',
    trustInstant: 'Instant e-ticket confirmation',
    lookupOrder: 'My Bookings',
    support247: 'Help Center',
    tagline: 'Vietnam Bus Booking',
    navSearch: 'Book Tickets',
    navTravel: 'Trip Map',
    navExplore: 'Explore',
    navOrders: 'My Trips',
    navNew: 'New',
    hotlineLabel: 'Hotline',
    hotlineTitle: 'VeXeViet 24/7 Support Desk',
    hotlineSubtitle: 'Live booking assistance & trip issue resolution',
    hotlineBooking: 'Ticket Booking & Routes',
    hotlineEmergency: 'Urgent Support & Claims',
    hotlineEmail: 'Customer Support Email',
    hotlineHours: 'Open 24/7 — Including weekends & public holidays',
    copied: 'Copied',
    copy: 'Copy',
    langTitle: 'Display Language',
    currencyTitle: 'Currency',
    login: 'Sign In',
    opening: 'Opening...',
    register: 'Sign Up',
    logout: 'Sign Out',
    loggingOut: 'Signing out...',
    account: 'Account',
  },
}
