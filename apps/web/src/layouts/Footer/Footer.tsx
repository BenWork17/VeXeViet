export function Footer() {
  return (
    <footer className="site-footer no-print">
      <div className="site-container">
        <div className="site-footer-grid">
          <div className="site-footer-brand">
            <div className="brand-link" aria-label="VeXeViet">
              <span className="brand-mark" aria-hidden="true">
                <svg viewBox="0 0 512 512" focusable="false">
                  <path d="M256 36l61.2 188.4H512L348.6 340.2 409.8 528.6 256 412.2 102.2 528.6 163.4 340.2 0 224.4h194.8L256 36z" />
                </svg>
              </span>
              <span className="brand-wordmark">VeXe<span>Viet</span></span>
            </div>
            <p>Đặt vé xe khách rõ ràng, thuận tiện và phù hợp với hành trình của bạn.</p>
          </div>

          <div>
            <h2 className="site-footer-title">Khám phá</h2>
            <ul className="site-footer-links">
              <li><a href="/search">Tìm chuyến xe</a></li>
              <li><a href="/travel">Bản đồ du lịch</a></li>
            </ul>
          </div>

          <div>
            <h2 className="site-footer-title">Hỗ trợ</h2>
            <ul className="site-footer-links">
              <li><a href="mailto:hello@vexeviet.vn">Liên hệ</a></li>
              <li><a href="/search">Tra cứu chuyến</a></li>
            </ul>
          </div>
        </div>

        <div className="site-footer-bottom">
          <span>© {new Date().getFullYear()} VeXeViet</span>
          <span>Đồng hành cùng mỗi chuyến đi</span>
        </div>
      </div>
    </footer>
  )
}
