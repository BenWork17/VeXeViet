'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Bus, CheckCircle2, ShieldCheck, Sparkles, Ticket } from 'lucide-react';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CardWatermark } from '@/components/brand';
import { SMOOTH_EASE } from './auth.schema';

const LOGIN_HIGHLIGHTS = [
  {
    icon: Ticket,
    title: 'Đặt vé nhanh trong 60 giây',
    description: 'Chọn tuyến, chọn ghế trực quan và nhận mã vé QR ngay lập tức.',
  },
  {
    icon: ShieldCheck,
    title: 'Thanh toán minh bạch, an toàn',
    description: 'Giá vé niêm yết rõ ràng, không phí ẩn, hỗ trợ hoàn hủy linh hoạt.',
  },
  {
    icon: Bus,
    title: 'Hơn 200+ nhà xe uy tín',
    description: 'Kết nối khắp 63 tỉnh thành với lịch trình cập nhật theo thời gian thực.',
  },
];

const REGISTER_HIGHLIGHTS = [
  {
    icon: Sparkles,
    title: 'Ưu đãi dành riêng thành viên',
    description: 'Nhận mã giảm giá cho chuyến đi đầu tiên và tích điểm đổi quà.',
  },
  {
    icon: CheckCircle2,
    title: 'Lưu thông tin hành khách',
    description: 'Tự động điền thông tin cho những lần đặt vé tiếp theo chỉ với 1 chạm.',
  },
  {
    icon: Ticket,
    title: 'Quản lý hành trình tập trung',
    description: 'Theo dõi vé đã đặt, điểm đón trả và nhắc lịch khởi hành tự động.',
  },
];

export function AnimatedHeight({
  children,
  reducedMotion,
  className,
}: {
  children: React.ReactNode;
  reducedMotion: boolean;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | 'auto'>('auto');

  useEffect(() => {
    const el = containerRef.current;
    if (!el || reducedMotion) {
      setHeight('auto');
      return;
    }

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const nextHeight = entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height;
        if (nextHeight > 0) {
          setHeight(nextHeight);
        }
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [reducedMotion]);

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      animate={{ height }}
      transition={{ duration: 0.32, ease: SMOOTH_EASE }}
      className={cn('overflow-hidden', className)}
    >
      <div ref={containerRef}>{children}</div>
    </motion.div>
  );
}

export function AuthShowcaseAside({
  isLogin,
  direction,
  headingVariants,
}: {
  isLogin: boolean;
  direction: 1 | -1;
  headingVariants: Variants;
}) {
  const highlights = isLogin ? LOGIN_HIGHLIGHTS : REGISTER_HIGHLIGHTS;

  return (
    <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-border bg-gradient-to-br from-primary/[0.10] via-accent to-card p-8 lg:flex lg:p-9 xl:p-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-primary/[0.12] blur-2xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-primary/[0.08] blur-2xl"
      />
      <CardWatermark variant="dong-son" position="bottom-right" />

      <div className="relative z-10">
        <Link
          href="/"
          className="inline-block font-display text-3xl tracking-tight text-foreground transition-opacity hover:opacity-85"
        >
          VeXeViet<span className="text-primary">.</span>
        </Link>

        <div className="mt-7">
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <motion.div
              key={isLogin ? 'aside-login' : 'aside-register'}
              custom={direction}
              variants={headingVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-card/90 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary shadow-hn-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                {isLogin ? 'Chào mừng trở lại' : 'Thành viên mới'}
              </span>

              <h2 className="mt-4 font-display text-3xl leading-[1.15] text-foreground xl:text-[2rem]">
                {isLogin ? 'Tiếp tục hành trình khắp Việt Nam' : 'Khởi đầu chuyến đi dễ dàng hơn'}
              </h2>

              <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
                {isLogin
                  ? 'Đăng nhập để quản lý vé điện tử, theo dõi lịch trình và đặt chuyến tiếp theo chỉ trong vài giây.'
                  : 'Tạo tài khoản miễn phí để lưu thông tin hành khách, nhận ưu đãi thành viên và đặt vé nhanh chóng.'}
              </p>

              <ul className="mt-6 space-y-3">
                {highlights.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li
                      key={item.title}
                      className="flex items-start gap-3 rounded-xl border border-border bg-card/90 p-3 backdrop-blur-sm"
                    >
                      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary/12 text-primary">
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <div>
                        <p className="text-sm font-bold text-foreground">{item.title}</p>
                        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="relative z-10 mt-7 flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
        <span>Hỗ trợ 24/7 • Hotline 1900 6868</span>
        <span className="font-semibold text-primary">VeXeViet</span>
      </div>
    </aside>
  );
}
