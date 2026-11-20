'use client'

import { BadgeDollarSign, Headphones, ShieldCheck, Zap } from 'lucide-react'
import { CardWatermark } from '@/components/brand'

const STATS = [
  { value: '50K+', label: 'Khách hàng đã tin chọn' },
  { value: '500+', label: 'Tuyến đường đang kết nối' },
  { value: '100+', label: 'Nhà xe đồng hành' },
  { value: '4.9', label: 'Đánh giá trung bình' },
]

const FEATURES = [
  {
    title: 'Thông tin rõ ràng',
    description: 'Xem giờ chạy, loại xe và giá vé trước khi quyết định.',
    Icon: ShieldCheck,
  },
  {
    title: 'Đặt vé nhanh gọn',
    description: 'Tìm chuyến phù hợp mà không phải đi qua những bước thừa.',
    Icon: Zap,
  },
  {
    title: 'Giá dễ hiểu',
    description: 'Biết mình đang trả cho hành trình nào, không phí ẩn.',
    Icon: BadgeDollarSign,
  },
  {
    title: 'Luôn có người hỗ trợ',
    description: 'Đội ngũ hỗ trợ sẵn sàng khi bạn cần giải đáp.',
    Icon: Headphones,
  },
]

export function StatsSection() {
  return (
    <section className="bg-background py-12 lg:py-16" aria-labelledby="trust-heading">
      <div className="mx-auto w-full max-w-[1520px] px-5 sm:px-8 lg:px-10 xl:px-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-stretch lg:gap-8">
          {/* Left column: Heading + 2x2 Key Metrics stretched to match right column */}
          <div className="flex h-full flex-col justify-between gap-6 lg:col-span-5">
            <div className="space-y-2.5">
              <h2 id="trust-heading" className="text-3xl leading-tight text-foreground lg:text-4xl">
                Một cách đặt vé dễ tin cậy hơn.
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                VeXeViet tập trung vào những điều hành khách cần nhất: thông tin đúng, lựa chọn rõ và một điểm bắt đầu nhẹ nhàng.
              </p>
            </div>

            <div className="grid flex-1 grid-cols-2 grid-rows-2 gap-4" aria-label="Thông tin về VeXeViet">
              {STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border bg-card p-5 shadow-xs transition-all duration-200 hover:border-primary/40 hover:shadow-md"
                >
                  <CardWatermark variant="dong-son" position="bottom-right" />
                  <div className="relative z-10 font-display text-3xl leading-none text-primary sm:text-4xl">
                    {stat.value}
                  </div>
                  <div className="relative z-10 mt-3 text-xs font-semibold text-muted-foreground sm:text-sm">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right column: 2x2 Feature Cards stretched to align cleanly */}
          <div className="grid h-full grid-cols-1 gap-4 sm:grid-cols-2 sm:grid-rows-2 lg:col-span-7">
            {FEATURES.map(({ title, description, Icon }) => (
              <div
                key={title}
                className="group relative flex h-full flex-col justify-between overflow-hidden rounded-xl border border-border bg-card p-6 shadow-xs transition-all duration-200 hover:border-primary/40 hover:shadow-md"
              >
                <CardWatermark variant="dong-son" position="bottom-right" />
                <div className="relative z-10 mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-primary/15 bg-accent text-primary">
                  <Icon size={22} aria-hidden="true" />
                </div>
                <div className="relative z-10">
                  <h3 className="font-sans text-base font-extrabold text-foreground sm:text-lg">
                    {title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
