import Link from 'next/link'
import { VietnamFlagIcon } from '@/components/brand'

export function Footer() {
  return (
    <footer className="site-footer no-print border-t border-border/80">
      <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 xl:px-10 2xl:max-w-[1536px]">
        <div className="site-footer-grid lg:gap-16">
          <div className="site-footer-brand">
            <Link
              href="/"
              className="brand-link group inline-flex items-center gap-3 rounded-lg py-0.5 focus-visible:outline-none"
              aria-label="VeXeViet, về trang chủ"
            >
              <VietnamFlagIcon size="md" />
              <span className="brand-wordmark tracking-tight">
                VeXe<span>Viet</span>
              </span>
            </Link>
            <p className="max-w-[380px]">
              Đặt vé xe khách rõ ràng, thuận tiện và phù hợp với hành trình của bạn.
            </p>
          </div>

          <div>
            <h2 className="site-footer-title">Khám phá</h2>
            <ul className="site-footer-links">
              <li><Link href="/search">Tìm chuyến xe</Link></li>
              <li><Link href="/travel">Bản đồ du lịch</Link></li>
            </ul>
          </div>

          <div>
            <h2 className="site-footer-title">Hỗ trợ</h2>
            <ul className="site-footer-links">
              <li><a href="mailto:hello@vexeviet.vn">Liên hệ</a></li>
              <li><Link href="/search">Tra cứu chuyến</Link></li>
            </ul>
          </div>
        </div>

        <div className="site-footer-bottom border-t border-border/70">
          <span>© {new Date().getFullYear()} VeXeViet</span>
          <span>Đồng hành cùng mỗi chuyến đi</span>
        </div>
      </div>
    </footer>
  )
}
