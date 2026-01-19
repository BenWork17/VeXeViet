'use client';

import { useState } from 'react';
import { Button, Card, cn } from '@vexeviet/ui';
import { SearchForm, type SearchFormValues } from '@/components/features/search/SearchForm';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import { HeroBusAnimation } from '@/components/HeroBusAnimation';

export default function HomePage() {
  const router = useRouter();
  const [triggerBusExit, setTriggerBusExit] = useState(false);

  const handleSearch = (values: SearchFormValues) => {
    const params = new URLSearchParams();
    params.set('origin', values.origin);
    params.set('destination', values.destination);
    const dateStr = values.departureDate.toISOString().split('T')[0];
    if (dateStr) params.set('departureDate', dateStr);
    params.set('passengers', values.passengers.toString());

    if (values.returnDate) {
      const returnDateStr = values.returnDate.toISOString().split('T')[0];
      if (returnDateStr) params.set('returnDate', returnDateStr);
    }

    setTriggerBusExit(true);
    setTimeout(() => {
      router.push(`/search?${params.toString()}`);
    }, 1200);
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 bg-background" />
        <div className="absolute inset-0 z-0">
          <HeroBusAnimation triggerExit={triggerBusExit} />
        </div>
        <div className="absolute top-0 right-0 w-2/3 h-full bg-primary/10 skew-x-12 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-secondary/5 -skew-y-12 -translate-x-1/4" />
        
        <div className="container mx-auto px-4 relative z-10 py-20">
          <div className="max-w-4xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary text-white border border-secondary/30 mb-6 animate-fadeIn">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
              </span>
              <span className="text-xs font-bold tracking-widest uppercase">Premium Travel Experience</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 text-slate-900 dark:text-white leading-tight">
              Sải bước <span className="text-secondary italic">Việt Nam</span> cùng{' '}
              <span className="relative inline-block">
                <span className="relative z-10 text-secondary font-black">
                  {'VeXeViet'.split('').map((char, i) => (
                    <span
                      key={i}
                      className="inline-block animate-pulse"
                      style={{
                        animationDelay: `${i * 0.15}s`,
                        animationDuration: '2s',
                      }}
                    >
                      {char}
                    </span>
                  ))}
                </span>
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-700 dark:text-gray-300 mb-10 max-w-2xl font-light leading-relaxed">
              Khám phá hành trình đẳng cấp với dịch vụ đặt vé xe khách hàng đầu. <span className="font-semibold text-slate-900 dark:text-white">An toàn, Tiện nghi, và Bản sắc.</span>
            </p>
            
            <div className="flex flex-wrap gap-4 mb-12">
              <Button 
                size="lg" 
                className="rounded-full px-10 py-8 text-lg bg-slate-900 dark:bg-white text-white dark:text-gray-900 hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white border-none shadow-[0_10px_30px_-5px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_30px_-5px_rgba(255,255,255,0.2)] transition-all duration-300 active:scale-95"
              >
                Bắt đầu hành trình
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="rounded-full px-10 py-8 text-lg text-slate-900 dark:text-white border-2 border-slate-300 dark:border-white/30 hover:bg-slate-900 dark:hover:bg-white hover:text-white dark:hover:text-gray-900 transition-all duration-300 active:scale-95"
              >
                Tìm hiểu thêm
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Search Widget */}
      <section className="container mx-auto px-4 -mt-24 mb-24 relative z-20">
        <Card className="p-1 md:p-2 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.15)] bg-blue-600 border-4 border-blue-700 rounded-[2.5rem] overflow-hidden">
          <div className="bg-white rounded-[1.8rem] p-6 md:p-10 border-4 border-slate-200">
            <div className="flex items-center space-x-3 mb-8">
              <div className="h-1 w-12 bg-primary rounded-full" />
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                Tìm kiếm hành trình
              </h2>
            </div>
            <SearchForm onSubmit={handleSearch} />
          </div>
        </Card>
      </section>

      {/* Popular Routes Section */}
      <section className="container mx-auto px-4 pb-24 relative">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="flex items-center space-x-2 text-primary font-bold tracking-widest uppercase text-xs mb-3">
              <span className="w-8 h-[2px] bg-primary"></span>
              <span>Hành trình phổ biến</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight">
              Tuyến đường <span className="text-primary italic">nổi bật</span>
            </h2>
          </div>
          <p className="text-gray-500 max-w-md text-sm md:text-base border-l-2 border-gray-100 pl-4">
            Lựa chọn hàng đầu của hàng nghìn hành khách mỗi ngày. Đảm bảo chất lượng và giá cả tốt nhất.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {popularRoutes.map((route, index) => (
            <div 
              key={route.id} 
              className={cn(
                "group relative bg-white rounded-[2.5rem] p-8 transition-all duration-500 hover:-translate-y-2 border border-gray-100",
                "shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_80px_rgba(139,0,0,0.1)]",
                index % 2 === 1 ? "md:mt-8" : "" // Asymmetric layout
              )}
            >
              <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-primary/10 p-2 rounded-full text-primary">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-[0.2em] text-secondary">
                    <span>{route.operators} Nhà xe</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 flex flex-col">
                    <span className="text-gray-400 text-sm font-medium">Từ</span> 
                    {route.from}
                    <span className="text-gray-400 text-sm font-medium mt-1 text-center leading-none">↓</span>
                    {route.to}
                  </h3>
                </div>

                <div className="pt-6 border-t border-dashed border-gray-200 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Chỉ từ</span>
                    <span className="text-2xl font-black text-primary tracking-tighter italic">
                      {formatCurrency(route.price).replace('₫', '')}<span className="text-sm not-italic ml-0.5">₫</span>
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Decorative Element */}
        <div className="absolute -bottom-10 right-10 text-[12vw] font-black text-gray-50 select-none -z-10 tracking-tighter">
          VEXEVIET
        </div>
      </section>
    </div>
  );
}

// Mock data for popular routes
const popularRoutes = [
  { id: 1, from: 'Ho Chi Minh', to: 'Da Lat', operators: 25, price: '150,000₫' },
  { id: 2, from: 'Hanoi', to: 'Ha Long', operators: 18, price: '120,000₫' },
  { id: 3, from: 'Ho Chi Minh', to: 'Nha Trang', operators: 30, price: '200,000₫' },
  { id: 4, from: 'Da Nang', to: 'Hoi An', operators: 15, price: '80,000₫' },
  { id: 5, from: 'Ho Chi Minh', to: 'Vung Tau', operators: 22, price: '100,000₫' },
  { id: 6, from: 'Hanoi', to: 'Sapa', operators: 12, price: '180,000₫' },
  { id: 7, from: 'Ho Chi Minh', to: 'Can Tho', operators: 20, price: '130,000₫' },
  { id: 8, from: 'Hue', to: 'Da Nang', operators: 10, price: '90,000₫' },
];
