'use client';

import { useState } from 'react';
import { Button, cn } from '@vexeviet/ui';
import { SearchForm, type SearchFormValues } from '@/components/features/search/SearchForm';
import { useRouter } from 'next/navigation';
import { PopularRoutesSection } from '@/components/features/home/PopularRoutesSection';
import { StatsSection } from '@/components/features/home/StatsSection';
import { Clock3, Compass, MapPin, Search, ShieldCheck, Star, TicketCheck } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [searchPanelOpen, setSearchPanelOpen] = useState(false);

  const handleSearch = (values: SearchFormValues) => {
    // Format date as local date (YYYY-MM-DD) without timezone conversion
    const year = values.departureDate.getFullYear()
    const month = String(values.departureDate.getMonth() + 1).padStart(2, '0')
    const day = String(values.departureDate.getDate()).padStart(2, '0')
    const formattedDate = `${year}-${month}-${day}`

    const params = new URLSearchParams();
    params.set('origin', values.origin);
    params.set('destination', values.destination);
    params.set('departureDate', formattedDate);
    params.set('passengers', values.passengers.toString());

    if (values.returnDate) {
      const returnYear = values.returnDate.getFullYear()
      const returnMonth = String(values.returnDate.getMonth() + 1).padStart(2, '0')
      const returnDay = String(values.returnDate.getDate()).padStart(2, '0')
      params.set('returnDate', `${returnYear}-${returnMonth}-${returnDay}`)
    }

    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[86vh] flex items-center overflow-hidden pb-28 pt-28 -mt-16">
        {/* Background Layers */}
        <div className="absolute inset-0 bg-white" />
        <div className="absolute inset-0 hidden bg-[url('/images/hero-vietnam-bus.jpg')] bg-no-repeat md:block md:bg-[length:74%_auto] md:bg-[position:right_-17rem_top_5rem] lg:bg-[length:64%_auto] lg:bg-[position:right_-7rem_top_5rem] xl:bg-[length:62%_auto] xl:bg-[position:right_-5rem_top_4.75rem]" />

        {/* Content */}
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-[660px]">
            {/* Status Badge */}
            <div className="mb-5 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white/90 px-3 py-2 text-xs font-bold uppercase tracking-wide text-primary shadow-sm backdrop-blur">
              <Compass className="h-4 w-4" />
              <span>Nền tảng đặt vé xe Việt Nam</span>
            </div>
            
            {/* Main Heading */}
            <h1 className="mb-5 max-w-[660px] text-4xl font-black leading-[1.02] text-gray-950 sm:text-5xl lg:text-[72px]">
              <span className="block">Khám phá Việt Nam</span>
              <span className="mt-2 block text-gray-900">
                cùng{' '}
                <span className="relative inline-block whitespace-nowrap text-primary drop-shadow-[0_8px_22px_rgba(37,99,235,0.18)]">
                  VeXeViet
                </span>
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="mb-7 max-w-xl text-base leading-7 text-gray-600 md:text-lg">
              Hành trình đẳng cấp với dịch vụ đặt vé xe khách hàng đầu.{' '}
              <span className="font-semibold text-gray-900">An toàn. Tiện nghi. Đáng tin cậy.</span>
            </p>
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
              <div className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white/80 px-3 py-2 shadow-sm backdrop-blur">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span className="font-semibold">50K+ khách hàng hài lòng</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white/80 px-3 py-2 shadow-sm backdrop-blur">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">4.9/5 đánh giá</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Widget - Floating */}
      <section className="container mx-auto px-4 relative z-30 -mt-24 mb-16">
        <div className={cn(
          "relative overflow-hidden rounded-2xl border border-slate-200 bg-white",
          "shadow-[0_24px_70px_rgba(15,23,42,0.16)]"
        )}>
          <div
            className={cn(
              "flex w-[200%] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
              searchPanelOpen ? "-translate-x-1/2" : "translate-x-0"
            )}
          >
            <div className="w-1/2 shrink-0 p-6 md:p-8 lg:p-9">
              <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-center">
                <div>
                  <div className="mb-5 inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold uppercase tracking-wide text-primary">
                    <TicketCheck className="h-4 w-4" />
                    Tìm vé nhanh trong vài bước
                  </div>
                  <h2 className="text-2xl font-black leading-tight text-gray-950 md:text-3xl">
                    Sẵn sàng chọn chuyến xe phù hợp cho hành trình của bạn?
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600 md:text-base">
                    Nhập nơi đi, điểm đến và ngày khởi hành để xem chuyến xe, giá vé, thời gian và số ghế còn trống.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Button
                      type="button"
                      onClick={() => setSearchPanelOpen(true)}
                      className="h-12 rounded-lg bg-primary px-6 font-bold text-white shadow-lg shadow-primary/20 hover:bg-blue-700"
                    >
                      <Search className="mr-2 h-4 w-4" />
                      Mở form tìm chuyến
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('popular-routes')?.scrollIntoView({ behavior: 'smooth' })}
                      className="h-12 rounded-lg border-slate-300 px-6 font-bold text-gray-700 hover:bg-gray-900 hover:text-white"
                    >
                      Xem tuyến nổi bật
                    </Button>
                  </div>
                </div>

                <div className="grid gap-3">
                  {[
                    { icon: MapPin, title: 'Chọn tuyến', text: 'Lọc nhanh theo điểm đi và điểm đến.' },
                    { icon: Clock3, title: 'So sánh giờ', text: 'Xem thời gian chạy và loại xe phù hợp.' },
                    { icon: ShieldCheck, title: 'Đặt vé an tâm', text: 'Thông tin rõ ràng trước khi thanh toán.' },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.title} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-primary shadow-sm">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-black text-gray-950">{item.title}</h3>
                          <p className="mt-1 text-sm leading-5 text-gray-600">{item.text}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="w-1/2 shrink-0 p-6 md:p-8 lg:p-9">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div className="flex items-center space-x-4">
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                    <Search className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                      Tìm chuyến xe của bạn
                    </h2>
                    <p className="text-sm text-gray-500">Nhập thông tin để tìm chuyến xe phù hợp nhất</p>
                  </div>
                </div>

                {/* Trust badges */}
                <div className="flex items-center space-x-3">
                  <span className="inline-flex items-center rounded-lg bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
                    <span className="mr-2 h-1.5 w-1.5 rounded-full bg-green-500"></span>
                    Đặt vé 24/7
                  </span>
                  <span className="inline-flex items-center rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                    ⚡ Xác nhận tức thì
                  </span>
                </div>
              </div>

              <SearchForm onSubmit={handleSearch} />
            </div>
          </div>
        </div>
      </section>

      {/* Popular Routes Section */}
      <PopularRoutesSection />

      {/* Stats & Features Section */}
      <StatsSection />

      {/* CTA Section */}
      <section className="relative py-24 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-blue-600 to-primary" />
        
        {/* Pattern Overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzRjMC0yLjIgMS44LTQgNC00czQgMS44IDQgNC0xLjggNC00IDQtNC0xLjgtNC00eiIvPjwvZz48L2c+PC9zdmc+')]" />
        </div>

        {/* Floating Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-secondary/20 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
              Sẵn sàng cho hành trình tiếp theo?
            </h2>
            <p className="text-xl text-white/80 mb-10">
              Đặt vé ngay hôm nay và trải nghiệm dịch vụ đặt vé xe tốt nhất Việt Nam
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                className={cn(
                  "rounded-full px-10 py-7 text-lg font-bold",
                  "bg-white text-primary",
                  "hover:bg-secondary hover:text-white hover:shadow-2xl",
                  "transition-all duration-300"
                )}
              >
                <span className="mr-2">🎫</span>
                Đặt vé ngay
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className={cn(
                  "rounded-full px-10 py-7 text-lg font-bold",
                  "border-2 border-white/50 text-white",
                  "hover:bg-white hover:text-primary",
                  "transition-all duration-300"
                )}
              >
                Liên hệ tư vấn
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
