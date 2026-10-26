'use client'

import { useState } from 'react'
import { Button } from '@vexeviet/ui'
import { SearchForm, type SearchFormValues } from '@/components/features/search/SearchForm'
import { useRouter } from 'next/navigation'
import { PopularRoutesSection } from '@/components/features/home/PopularRoutesSection'
import { StatsSection } from '@/components/features/home/StatsSection'
import { ArrowRight, Clock3, MapPin, Search, ShieldCheck, TicketCheck } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const [searchPanelOpen, setSearchPanelOpen] = useState(false)

  const handleSearch = (values: SearchFormValues) => {
    const year = values.departureDate.getFullYear()
    const month = String(values.departureDate.getMonth() + 1).padStart(2, '0')
    const day = String(values.departureDate.getDate()).padStart(2, '0')
    const formattedDate = `${year}-${month}-${day}`

    const params = new URLSearchParams()
    params.set('origin', values.origin)
    params.set('destination', values.destination)
    params.set('departureDate', formattedDate)
    params.set('passengers', values.passengers.toString())

    if (values.returnDate) {
      const returnYear = values.returnDate.getFullYear()
      const returnMonth = String(values.returnDate.getMonth() + 1).padStart(2, '0')
      const returnDay = String(values.returnDate.getDate()).padStart(2, '0')
      params.set('returnDate', `${returnYear}-${returnMonth}-${returnDay}`)
    }

    router.push(`/search?${params.toString()}`)
  }

  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="site-container hero-grid">
          <div className="hero-copy">
            <h1>Đi xa cùng VeXeViet.</h1>
            <p>
              Chọn tuyến, so sánh giờ chạy và giữ chỗ trong vài bước rõ ràng. VeXeViet giúp bạn lên đường nhẹ nhàng hơn.
            </p>
            <div className="hero-actions">
              <Button
                type="button"
                className="home-button home-primary-button"
                onClick={() => setSearchPanelOpen(true)}
              >
                <Search size={18} aria-hidden="true" />
                Tìm chuyến xe
              </Button>
              <Button
                type="button"
                variant="outline"
                className="home-button home-secondary-button"
                onClick={() => document.getElementById('popular-routes')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Xem tuyến phổ biến
                <ArrowRight size={17} aria-hidden="true" />
              </Button>
            </div>
            <p className="hero-note">
              <ShieldCheck size={17} aria-hidden="true" />
              Thông tin chuyến xe minh bạch trước khi bạn đặt
            </p>
          </div>

          <figure className="hero-media">
            <img src="/images/hero-vietnam-bus.jpg" alt="Xe khách VeXeViet đi qua những điểm đến đặc trưng của Việt Nam" />
            <figcaption>Những điểm đến đáng nhớ bắt đầu từ một lộ trình vừa vặn.</figcaption>
          </figure>
        </div>
      </section>

      <section className="search-section" aria-labelledby="search-heading">
        <div className="site-container">
          <div className="search-shell">
            <div className="search-intro">
              <h2 id="search-heading">Tìm đúng chuyến.</h2>
              <p>Điểm đi và điểm đến là hai dấu mốc đầu tiên. Phần còn lại để VeXeViet giúp bạn so sánh.</p>
              <div className="search-facts" aria-label="Lợi ích khi tìm vé">
                <div className="search-fact"><MapPin size={20} aria-hidden="true" /><span>Chọn tỉnh, thành phố theo hành trình thực tế.</span></div>
                <div className="search-fact"><Clock3 size={20} aria-hidden="true" /><span>Đặt ngày đi, số khách và xem giờ chạy phù hợp.</span></div>
                <div className="search-fact"><TicketCheck size={20} aria-hidden="true" /><span>Giữ lại thông tin rõ ràng trước khi sang bước đặt vé.</span></div>
              </div>
            </div>

            <div className="search-panel">
              {searchPanelOpen ? (
                <SearchForm onSubmit={handleSearch} />
              ) : (
                <div className="search-summary">
                  <div>
                    <h3>Bắt đầu với lộ trình của bạn</h3>
                    <p>Nhập nơi đi, nơi đến và ngày khởi hành để xem các chuyến xe đang có.</p>
                  </div>
                  <Button type="button" className="home-button home-primary-button" onClick={() => setSearchPanelOpen(true)}>
                    Mở form tìm chuyến
                    <ArrowRight size={17} aria-hidden="true" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <PopularRoutesSection />
      <StatsSection />

      <section className="cta-section" aria-labelledby="cta-heading">
        <div className="site-container cta-content">
          <div>
            <h2 id="cta-heading">Sẵn sàng cho cung đường tiếp theo?</h2>
            <p>Chọn tuyến xe phù hợp hôm nay, để ngày khởi hành chỉ còn là một điểm hẹn.</p>
          </div>
          <div className="cta-actions">
            <Button type="button" className="home-button home-primary-button" onClick={() => setSearchPanelOpen(true)}>
              <Search size={18} aria-hidden="true" />
              Tìm chuyến xe
            </Button>
            <Button asChild type="button" variant="outline" className="home-button home-secondary-button">
              <a href="mailto:hello@vexeviet.vn?subject=T%C6%B0%20v%E1%BA%A5n%20%C4%91%E1%BA%B7t%20v%C3%A9">Liên hệ tư vấn</a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
