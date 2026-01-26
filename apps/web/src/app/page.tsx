'use client';

import { useState } from 'react';
import { Button, cn } from '@vexeviet/ui';
import { SearchForm, type SearchFormValues } from '@/components/features/search/SearchForm';
import { useRouter } from 'next/navigation';
import { HeroBusAnimation } from '@/components/HeroBusAnimation';
import { PopularRoutesSection } from '@/components/features/home/PopularRoutesSection';
import { StatsSection } from '@/components/features/home/StatsSection';

export default function HomePage() {
  const router = useRouter();
  const [triggerBusExit, setTriggerBusExit] = useState(false);

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

    setTriggerBusExit(true);
    setTimeout(() => {
      router.push(`/search?${params.toString()}`);
    }, 1200);
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden py-20 -mt-16">
        {/* Background Layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50" />
        
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.05)_1px,transparent_0)] bg-[size:40px_40px]" />
        </div>

        {/* Decorative Gradient Blobs */}
        <div className="absolute top-0 right-0 w-1/2 h-full">
          <div className="absolute top-20 right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-40 right-40 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
        </div>

        {/* Bus Animation */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <HeroBusAnimation triggerExit={triggerBusExit} />
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl">
            {/* Status Badge */}
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary to-blue-600 text-white mb-8 shadow-lg shadow-primary/25">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              <span className="text-xs font-bold tracking-widest uppercase">Premium Travel Experience</span>
            </div>
            
            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 leading-[1.1]">
              <span className="text-gray-900">Khám phá</span>
              <br />
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-primary via-blue-600 to-secondary bg-clip-text text-transparent">
                  Việt Nam
                </span>
                {/* Underline Effect */}
                <span className="absolute -bottom-2 left-0 w-full h-3 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-full blur-sm" />
              </span>
              <br />
              <span className="text-gray-900">cùng </span>
              <span className="relative inline-block">
                <span className="text-secondary font-black">VeXeViet</span>
                {/* Sparkle Effect */}
                <span className="absolute -top-1 -right-4 text-2xl animate-bounce">✨</span>
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl leading-relaxed">
              Hành trình đẳng cấp với dịch vụ đặt vé xe khách hàng đầu.{' '}
              <span className="font-semibold text-gray-900">An toàn. Tiện nghi. Đáng tin cậy.</span>
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 mb-12">
              <Button 
                size="lg" 
                className={cn(
                  "rounded-full px-10 py-7 text-lg font-bold",
                  "bg-gradient-to-r from-primary to-blue-600 text-white",
                  "hover:shadow-xl hover:shadow-primary/30 hover:scale-105",
                  "transition-all duration-300"
                )}
              >
                <span className="mr-2">🚀</span>
                Bắt đầu hành trình
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className={cn(
                  "rounded-full px-10 py-7 text-lg font-bold",
                  "border-2 border-gray-300 text-gray-700",
                  "hover:border-gray-900 hover:bg-gray-900 hover:text-white",
                  "transition-all duration-300"
                )}
              >
                Tìm hiểu thêm
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <div className="flex -space-x-2">
                  {['😊', '🥰', '😄', '🤩'].map((emoji, i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center ring-2 ring-white text-sm">
                      {emoji}
                    </div>
                  ))}
                </div>
                <span className="font-medium">50K+ khách hàng hài lòng</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-yellow-500">⭐⭐⭐⭐⭐</span>
                <span className="font-medium">4.9/5 đánh giá</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Widget - Floating */}
      <section className="container mx-auto px-4 relative z-30 -mt-20 mb-16">
        <div className={cn(
          "relative p-1.5 rounded-[2rem] overflow-visible",
          "bg-gradient-to-r from-primary via-blue-500 to-secondary",
          "shadow-2xl shadow-primary/25"
        )}>
          {/* Animated gradient border */}
          <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-r from-primary via-blue-500 to-secondary animate-gradient-x opacity-70 blur-sm -z-10" />
          
          {/* Inner content */}
          <div className="relative bg-white rounded-[1.5rem] p-6 md:p-8 lg:p-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div className="flex items-center space-x-4">
                {/* Icon */}
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/30">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
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
                <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-green-50 text-green-700 text-xs font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                  Đặt vé 24/7
                </span>
                <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                  ⚡ Xác nhận tức thì
                </span>
              </div>
            </div>
            
            <SearchForm onSubmit={handleSearch} />
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
