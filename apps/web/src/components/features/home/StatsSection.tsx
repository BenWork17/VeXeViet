'use client'

const STATS = [
  { value: '50K+', label: 'Khách hàng đã tin chọn' },
  { value: '500+', label: 'Tuyến đường đang kết nối' },
  { value: '100+', label: 'Nhà xe đồng hành' },
  { value: '4.9', label: 'Đánh giá trung bình' },
]

const FEATURES = [
  { title: 'Thông tin rõ ràng', description: 'Xem giờ chạy, loại xe và giá vé trước khi quyết định.' },
  { title: 'Đặt vé nhanh gọn', description: 'Tìm chuyến phù hợp mà không phải đi qua những bước thừa.' },
  { title: 'Giá dễ hiểu', description: 'Biết mình đang trả cho hành trình nào, không phí ẩn.' },
  { title: 'Luôn có người hỗ trợ', description: 'Đội ngũ hỗ trợ sẵn sàng khi bạn cần giải đáp.' },
]

export function StatsSection() {
  return (
    <section className="trust-section" aria-labelledby="trust-heading">
      <div className="site-container trust-layout">
        <div className="trust-heading">
          <h2 id="trust-heading">Một cách đi vé dễ tin cậy hơn.</h2>
          <p>VeXeViet tập trung vào những điều hành khách cần nhất: thông tin đúng, lựa chọn rõ và một điểm bắt đầu nhẹ nhàng.</p>
          <div className="trust-list">
            <div className="trust-item-list">
              {FEATURES.map(({ title, description }) => (
                <div key={title} className="trust-item">
                  <div>
                    <h3>{title}</h3>
                    <p>{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="trust-stats" aria-label="Thông tin về VeXeViet">
          {STATS.map((stat) => (
            <div className="trust-stat" key={stat.label}>
              <div className="trust-stat-value">{stat.value}</div>
              <div className="trust-stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
