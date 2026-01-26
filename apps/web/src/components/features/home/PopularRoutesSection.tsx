'use client';

import { useMemo } from 'react';
import { cn } from '@vexeviet/ui';
import { usePopularRoutes } from '@/lib/hooks/useRoutes';
import { PopularRouteCard } from './PopularRouteCard';

export function PopularRoutesSection() {
  const { data: popularRoutesData, isLoading } = usePopularRoutes();
  
  const displayedRoutes = useMemo(() => 
    popularRoutesData?.slice(0, 8) || [], 
    [popularRoutesData]
  );

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50/30" />
        
        {/* Decorative Circles */}
        <div className="absolute top-20 -left-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 -right-20 w-80 h-80 bg-secondary/5 rounded-full blur-3xl" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-14">
          {/* Badge */}
          <div className="inline-flex items-center justify-center mb-6">
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-xs font-bold text-primary uppercase tracking-wider">Được yêu thích nhất</span>
            </span>
          </div>

          {/* Title with Gradient */}
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
            Tuyến đường{' '}
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-primary via-blue-600 to-secondary bg-clip-text text-transparent">
                nổi bật
              </span>
              <span className="absolute -bottom-2 left-0 w-full h-3 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-sm" />
            </span>
          </h2>

          {/* Subtitle */}
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Khám phá những tuyến đường được hàng nghìn hành khách tin tưởng lựa chọn mỗi ngày
          </p>
        </div>

        {/* Routes Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl overflow-hidden border border-gray-100"
              >
                {/* Skeleton Header */}
                <div className="h-24 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse" />
                {/* Skeleton Content */}
                <div className="p-5 space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex flex-col items-center space-y-1">
                      <div className="w-3 h-3 rounded-full bg-gray-200" />
                      <div className="w-0.5 h-8 bg-gray-200" />
                      <div className="w-3 h-3 rounded-full bg-gray-200" />
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                      <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-6 bg-gray-200 rounded-lg w-16 animate-pulse" />
                    <div className="h-6 bg-gray-200 rounded-lg w-16 animate-pulse" />
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <div className="h-8 bg-gray-200 rounded w-24 animate-pulse" />
                    <div className="w-11 h-11 bg-gray-200 rounded-xl animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayedRoutes.length > 0 ? (
              displayedRoutes.map((route, index) => (
                <PopularRouteCard 
                  key={route.id} 
                  route={route} 
                  index={index} 
                />
              ))
            ) : (
              <div className="col-span-full">
                <div className="text-center py-16 px-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có tuyến đường nổi bật</h3>
                  <p className="text-gray-500">Vui lòng thử lại sau hoặc tìm kiếm tuyến đường bạn cần</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* View All Button */}
        {displayedRoutes.length > 0 && (
          <div className="text-center mt-12">
            <a 
              href="/routes"
              className={cn(
                "inline-flex items-center px-8 py-4 rounded-full",
                "bg-gray-900 text-white font-semibold",
                "hover:bg-primary hover:shadow-lg hover:shadow-primary/25",
                "transition-all duration-300",
                "group"
              )}
            >
              <span>Xem tất cả tuyến đường</span>
              <svg 
                className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        )}
      </div>

      {/* Large Decorative Text */}
      <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 text-[15vw] font-black text-gray-100/50 select-none pointer-events-none whitespace-nowrap">
        VEXEVIET
      </div>
    </section>
  );
}
