'use client';

import { cn } from '@vexeviet/ui';

const STATS = [
  { value: '50K+', label: 'Khách hàng tin tưởng', icon: '👥' },
  { value: '500+', label: 'Tuyến đường', icon: '🛣️' },
  { value: '100+', label: 'Nhà xe đối tác', icon: '🚌' },
  { value: '4.9', label: 'Đánh giá trung bình', icon: '⭐' },
];

const FEATURES = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'An toàn tuyệt đối',
    description: 'Đội ngũ tài xế chuyên nghiệp, xe được kiểm tra định kỳ',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'Đặt vé nhanh chóng',
    description: 'Chỉ cần 30 giây để hoàn tất đặt vé online',
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Giá cả minh bạch',
    description: 'Không phí ẩn, cam kết giá tốt nhất thị trường',
    color: 'from-blue-500 to-indigo-500',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    title: 'Hỗ trợ 24/7',
    description: 'Đội ngũ chăm sóc khách hàng luôn sẵn sàng',
    color: 'from-violet-500 to-purple-500',
  },
];

export function StatsSection() {
  return (
    <section className="relative py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        {/* Animated Gradient Orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {STATS.map((stat, index) => (
            <div 
              key={index}
              className={cn(
                "relative p-6 rounded-2xl text-center",
                "bg-white/5 backdrop-blur-sm border border-white/10",
                "hover:bg-white/10 hover:border-white/20 transition-all duration-300",
                "group"
              )}
            >
              {/* Glow Effect on Hover */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity blur-xl -z-10" />
              
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-3xl md:text-4xl font-black text-white mb-1">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Section Header */}
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
            Tại sao chọn <span className="text-secondary">VeXeViet</span>?
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Chúng tôi cam kết mang đến trải nghiệm đặt vé xe tốt nhất với những ưu điểm vượt trội
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((feature, index) => (
            <div
              key={index}
              className={cn(
                "relative p-6 rounded-2xl",
                "bg-white/5 backdrop-blur-sm border border-white/10",
                "hover:bg-white/10 transition-all duration-300",
                "group"
              )}
            >
              {/* Icon */}
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
                "bg-gradient-to-br text-white",
                feature.color,
                "group-hover:scale-110 transition-transform duration-300"
              )}>
                {feature.icon}
              </div>

              {/* Content */}
              <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{feature.description}</p>

              {/* Bottom Accent Line */}
              <div className={cn(
                "absolute bottom-0 left-0 h-1 w-0 rounded-b-2xl",
                "bg-gradient-to-r group-hover:w-full transition-all duration-500",
                feature.color
              )} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
