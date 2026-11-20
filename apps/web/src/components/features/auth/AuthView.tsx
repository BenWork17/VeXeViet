'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowRight,
  Bus,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  Sparkles,
  Ticket,
} from 'lucide-react';
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useReducedMotion,
  type Variants,
} from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/hooks/useAuth';
import { CardWatermark } from '@/components/brand';

// Validation schemas matching BE requirements
const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(8, 'Mật khẩu phải từ 8 ký tự'),
});

const registerSchema = z
  .object({
    firstName: z.string().min(1, 'Vui lòng nhập họ'),
    lastName: z.string().min(1, 'Vui lòng nhập tên'),
    email: z.string().email('Email không hợp lệ'),
    phone: z
      .string()
      .min(10, 'Số điện thoại phải từ 10 số')
      .optional()
      .or(z.literal('')),
    password: z
      .string()
      .min(8, 'Mật khẩu phải từ 8 ký tự')
      .regex(/[A-Z]/, 'Mật khẩu phải có ít nhất 1 chữ hoa')
      .regex(/[0-9]/, 'Mật khẩu phải có ít nhất 1 số'),
    confirmPassword: z.string(),
    agreeToTerms: z
      .boolean()
      .refine((val) => val === true, 'Bạn cần đồng ý với điều khoản'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

const SMOOTH_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fieldBase =
  'h-11 w-full rounded-lg border border-input bg-field px-3.5 text-sm font-semibold text-foreground placeholder:font-normal placeholder:text-muted-foreground transition-all duration-150 focus:outline-none focus:ring-2';

function fieldClass(hasError: boolean, extra?: string) {
  return cn(
    fieldBase,
    hasError
      ? 'border-error focus:border-error focus:ring-error/20'
      : 'hover:border-primary/70 focus:border-primary focus:ring-primary/20',
    extra,
  );
}

const labelClass = 'mb-1.5 block text-sm font-semibold text-foreground';
const fieldErrorClass = 'mt-1.5 text-xs font-medium text-error-ink';

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

function AnimatedHeight({
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

export function AuthView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefersReducedMotion = Boolean(useReducedMotion());

  const initialIsLogin = searchParams.get('mode') !== 'register';
  const [isLogin, setIsLogin] = useState(initialIsLogin);
  // 1: Login -> Register (slide left), -1: Register -> Login (slide right)
  const [direction, setDirection] = useState<1 | -1>(initialIsLogin ? -1 : 1);
  const [showForgotHint, setShowForgotHint] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const redirectUrl = searchParams.get('redirect') || '/';

  useEffect(() => {
    const paramIsLogin = searchParams.get('mode') !== 'register';
    setIsLogin((prev) => {
      if (prev !== paramIsLogin) {
        setDirection(paramIsLogin ? -1 : 1);
      }
      return paramIsLogin;
    });
  }, [searchParams]);

  const {
    user,
    isAuthenticated,
    login,
    register,
    isLoggingIn,
    isRegistering,
    loginError,
    registerError,
    resetLoginError,
    resetRegisterError,
  } = useAuth();

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false,
    },
    mode: 'onSubmit',
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      router.push(redirectUrl);
    }
  }, [isAuthenticated, user, router, redirectUrl]);

  const onLoginSubmit = async (data: LoginFormValues) => {
    try {
      await login(data);
      router.push(redirectUrl);
    } catch {
      // Error is handled by the hook
    }
  };

  const onRegisterSubmit = async (data: RegisterFormValues) => {
    try {
      await register({
        method: 'email',
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        agreeToTerms: data.agreeToTerms,
      });
      router.push(redirectUrl);
    } catch (error) {
      console.error('Register error:', error);
      // Error is handled by the hook
    }
  };

  const setMode = (nextIsLogin: boolean) => {
    if (nextIsLogin === isLogin) return;
    setDirection(nextIsLogin ? -1 : 1);
    setIsLogin(nextIsLogin);
    setShowForgotHint(false);
    loginForm.reset();
    registerForm.reset();
    resetLoginError();
    resetRegisterError();

    // Keep URL query parameter synchronized cleanly without remounting or interrupting animations
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (nextIsLogin) {
        params.delete('mode');
      } else {
        params.set('mode', 'register');
      }
      const query = params.toString();
      const nextUrl = query ? `/login?${query}` : '/login';
      window.history.replaceState(null, '', nextUrl);
    }
  };

  const isLoading = isLoggingIn || isRegistering;
  const currentError = isLogin ? loginError?.message : registerError?.message;

  const slideVariants: Variants = {
    enter: (dir: number) => ({
      opacity: 0,
      x: prefersReducedMotion ? 0 : dir * 28,
      scale: prefersReducedMotion ? 1 : 0.985,
    }),
    center: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        duration: prefersReducedMotion ? 0.12 : 0.28,
        ease: SMOOTH_EASE,
        when: 'beforeChildren',
        staggerChildren: prefersReducedMotion ? 0 : 0.04,
      },
    },
    exit: (dir: number) => ({
      opacity: 0,
      x: prefersReducedMotion ? 0 : dir * -28,
      scale: prefersReducedMotion ? 1 : 0.985,
      transition: {
        duration: prefersReducedMotion ? 0.1 : 0.2,
        ease: SMOOTH_EASE,
      },
    }),
  };

  const fieldItemVariants: Variants = {
    enter: {
      opacity: 0,
      y: prefersReducedMotion ? 0 : 8,
    },
    center: {
      opacity: 1,
      y: 0,
      transition: {
        duration: prefersReducedMotion ? 0.1 : 0.22,
        ease: SMOOTH_EASE,
      },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.12 },
    },
  };

  const headingVariants: Variants = {
    enter: (dir: number) => ({
      opacity: 0,
      x: prefersReducedMotion ? 0 : dir * 18,
    }),
    center: {
      opacity: 1,
      x: 0,
      transition: {
        duration: prefersReducedMotion ? 0.12 : 0.24,
        ease: SMOOTH_EASE,
      },
    },
    exit: (dir: number) => ({
      opacity: 0,
      x: prefersReducedMotion ? 0 : dir * -18,
      transition: {
        duration: prefersReducedMotion ? 0.1 : 0.16,
        ease: SMOOTH_EASE,
      },
    }),
  };

  const highlights = isLogin ? LOGIN_HIGHLIGHTS : REGISTER_HIGHLIGHTS;

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative flex min-h-[calc(100vh-4rem)] w-full items-center justify-center overflow-hidden bg-background px-4 py-10 font-sans text-foreground sm:px-6 lg:px-8 lg:py-14">
        {/* Soft warm-orange ambient glows for depth on wide 24-inch monitors */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full bg-primary/[0.08] blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 -right-24 h-[460px] w-[460px] rounded-full bg-primary/[0.07] blur-3xl"
        />

        <motion.div
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.36, ease: SMOOTH_EASE }}
          className="relative z-10 w-full max-w-md lg:max-w-5xl"
        >
          {/* Mobile Brand Header */}
          <div className="mb-6 text-center lg:hidden">
            <Link
              href="/"
              className="inline-block font-display text-3xl tracking-tight text-foreground transition-opacity hover:opacity-85"
            >
              VeXeViet<span className="text-primary">.</span>
            </Link>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-md lg:grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            {/* Left Editorial / Brand Showcase Panel (Desktop) */}
            <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-border bg-gradient-to-br from-primary/[0.10] via-accent to-card p-8 lg:flex lg:p-9 xl:p-10">
              {/* Subtle geometric accent */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/[0.12] blur-2xl"
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
                        {isLogin
                          ? 'Tiếp tục hành trình khắp Việt Nam'
                          : 'Khởi đầu chuyến đi dễ dàng hơn'}
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
                                <p className="text-sm font-bold text-foreground">
                                  {item.title}
                                </p>
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

            {/* Right Interactive Auth Form Panel */}
            <div className="flex flex-col justify-start p-6 sm:p-8 lg:px-10 lg:py-9 xl:px-11 xl:py-10">
              {/* Animated Segmented Mode Switcher */}
              <div
                className="relative mb-6 grid grid-cols-2 rounded-xl border border-border bg-muted p-1"
                role="tablist"
                aria-label="Chế độ xác thực"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={isLogin}
                  onClick={() => setMode(true)}
                  className={cn(
                    'relative z-10 rounded-lg px-4 py-2.5 text-sm font-bold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
                    isLogin
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {isLogin && (
                    <motion.span
                      layoutId="auth-tab-pill"
                      transition={
                        prefersReducedMotion
                          ? { duration: 0.1 }
                          : { type: 'spring', stiffness: 420, damping: 32, mass: 0.8 }
                      }
                      className="absolute inset-0 -z-10 rounded-lg bg-card shadow-hn-sm ring-1 ring-primary/15"
                    />
                  )}
                  Đăng nhập
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={!isLogin}
                  onClick={() => setMode(false)}
                  className={cn(
                    'relative z-10 rounded-lg px-4 py-2.5 text-sm font-bold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
                    !isLogin
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {!isLogin && (
                    <motion.span
                      layoutId="auth-tab-pill"
                      transition={
                        prefersReducedMotion
                          ? { duration: 0.1 }
                          : { type: 'spring', stiffness: 420, damping: 32, mass: 0.8 }
                      }
                      className="absolute inset-0 -z-10 rounded-lg bg-card shadow-hn-sm ring-1 ring-primary/15"
                    />
                  )}
                  Đăng ký
                </button>
              </div>

              {/* Animated Heading & Subtitle */}
              <div className="mb-6 min-h-[64px]">
                <AnimatePresence mode="wait" custom={direction} initial={false}>
                  <motion.div
                    key={isLogin ? 'heading-login' : 'heading-register'}
                    custom={direction}
                    variants={headingVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                  >
                    <h1 className="mb-1.5 font-display text-3xl leading-tight text-foreground">
                      {isLogin ? 'Chào mừng trở lại' : 'Tạo tài khoản mới'}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      {isLogin
                        ? 'Đăng nhập để tiếp tục hành trình cùng VeXeViet.'
                        : 'Chỉ mất một phút để bắt đầu đặt vé.'}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Animated Error Alert */}
              <AnimatePresence initial={false}>
                {currentError && (
                  <motion.div
                    key="auth-error"
                    role="alert"
                    initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -6, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -6, height: 0 }}
                    transition={{ duration: 0.22, ease: SMOOTH_EASE }}
                    className="overflow-hidden"
                  >
                    <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-error/25 bg-error-soft px-3.5 py-3 text-sm text-error-ink">
                      <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
                      <span>{currentError}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Smooth Height + Directional Slide Form Transition */}
              <AnimatedHeight reducedMotion={prefersReducedMotion}>
                <AnimatePresence mode="wait" custom={direction} initial={false}>
                  {isLogin ? (
                    <motion.form
                      key="login-form"
                      custom={direction}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      className="space-y-4 py-0.5"
                      onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                      noValidate
                    >
                      <motion.div variants={fieldItemVariants}>
                        <label htmlFor="login-email" className={labelClass}>
                          Email
                        </label>
                        <input
                          {...loginForm.register('email')}
                          id="login-email"
                          type="email"
                          inputMode="email"
                          autoComplete="email"
                          aria-invalid={Boolean(loginForm.formState.errors.email)}
                          className={fieldClass(Boolean(loginForm.formState.errors.email))}
                          placeholder="name@example.com"
                        />
                        {loginForm.formState.errors.email && (
                          <p className={fieldErrorClass}>
                            {loginForm.formState.errors.email.message}
                          </p>
                        )}
                      </motion.div>

                      <motion.div variants={fieldItemVariants}>
                        <div className="mb-1.5 flex items-center justify-between">
                          <label htmlFor="login-password" className={cn(labelClass, 'mb-0')}>
                            Mật khẩu
                          </label>
                          <button
                            type="button"
                            onClick={() => setShowForgotHint((prev) => !prev)}
                            className="text-xs font-semibold text-muted-foreground transition-colors duration-150 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                          >
                            Quên mật khẩu?
                          </button>
                        </div>
                        <div className="relative">
                          <input
                            {...loginForm.register('password')}
                            id="login-password"
                            type={showLoginPassword ? 'text' : 'password'}
                            autoComplete="current-password"
                            aria-invalid={Boolean(loginForm.formState.errors.password)}
                            className={fieldClass(
                              Boolean(loginForm.formState.errors.password),
                              'pr-10',
                            )}
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            onClick={() => setShowLoginPassword((prev) => !prev)}
                            aria-label={showLoginPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
                          >
                            {showLoginPassword ? (
                              <EyeOff className="h-4 w-4" aria-hidden="true" />
                            ) : (
                              <Eye className="h-4 w-4" aria-hidden="true" />
                            )}
                          </button>
                        </div>
                        {loginForm.formState.errors.password && (
                          <p className={fieldErrorClass}>
                            {loginForm.formState.errors.password.message}
                          </p>
                        )}

                        <AnimatePresence initial={false}>
                          {showForgotHint && (
                            <motion.p
                              key="forgot-hint"
                              role="status"
                              initial={
                                prefersReducedMotion
                                  ? { opacity: 0 }
                                  : { opacity: 0, height: 0, marginTop: 0 }
                              }
                              animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
                              exit={
                                prefersReducedMotion
                                  ? { opacity: 0 }
                                  : { opacity: 0, height: 0, marginTop: 0 }
                              }
                              transition={{ duration: 0.2, ease: SMOOTH_EASE }}
                              className="overflow-hidden rounded-lg border border-border bg-muted px-3 py-2.5 text-xs leading-relaxed text-muted-foreground"
                            >
                              Vui lòng liên hệ{' '}
                              <a
                                href="mailto:support@vexeviet.com"
                                className="font-semibold text-primary underline underline-offset-2"
                              >
                                support@vexeviet.com
                              </a>{' '}
                              hoặc hotline <strong>1900 6868</strong> để đặt lại mật khẩu.
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </motion.div>

                      <motion.div variants={fieldItemVariants} className="pt-1">
                        <motion.button
                          type="submit"
                          disabled={isLoading}
                          aria-busy={isLoggingIn}
                          whileHover={
                            isLoading || prefersReducedMotion ? undefined : { y: -1 }
                          }
                          whileTap={
                            isLoading || prefersReducedMotion ? undefined : { scale: 0.985 }
                          }
                          transition={{ duration: 0.14 }}
                          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 text-base font-bold text-primary-foreground shadow-hn-sm transition-colors duration-150 hover:bg-primary-deep focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isLoggingIn ? (
                            <>
                              <Loader2
                                className="h-5 w-5 animate-spin motion-reduce:animate-none"
                                aria-hidden="true"
                              />
                              <span>Đang đăng nhập...</span>
                            </>
                          ) : (
                            <span>Đăng nhập</span>
                          )}
                        </motion.button>
                      </motion.div>
                    </motion.form>
                  ) : (
                    <motion.form
                      key="register-form"
                      custom={direction}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      className="space-y-4 py-0.5"
                      onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
                      noValidate
                    >
                      <motion.div
                        variants={fieldItemVariants}
                        className="grid grid-cols-2 gap-3"
                      >
                        <div>
                          <label htmlFor="register-first-name" className={labelClass}>
                            Họ
                          </label>
                          <input
                            {...registerForm.register('firstName')}
                            id="register-first-name"
                            autoComplete="family-name"
                            aria-invalid={Boolean(registerForm.formState.errors.firstName)}
                            className={fieldClass(
                              Boolean(registerForm.formState.errors.firstName),
                            )}
                            placeholder="Nguyễn"
                          />
                          {registerForm.formState.errors.firstName && (
                            <p className={fieldErrorClass}>
                              {registerForm.formState.errors.firstName.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <label htmlFor="register-last-name" className={labelClass}>
                            Tên
                          </label>
                          <input
                            {...registerForm.register('lastName')}
                            id="register-last-name"
                            autoComplete="given-name"
                            aria-invalid={Boolean(registerForm.formState.errors.lastName)}
                            className={fieldClass(
                              Boolean(registerForm.formState.errors.lastName),
                            )}
                            placeholder="Văn A"
                          />
                          {registerForm.formState.errors.lastName && (
                            <p className={fieldErrorClass}>
                              {registerForm.formState.errors.lastName.message}
                            </p>
                          )}
                        </div>
                      </motion.div>

                      <motion.div variants={fieldItemVariants}>
                        <label htmlFor="register-email" className={labelClass}>
                          Email
                        </label>
                        <input
                          {...registerForm.register('email')}
                          id="register-email"
                          type="email"
                          inputMode="email"
                          autoComplete="email"
                          aria-invalid={Boolean(registerForm.formState.errors.email)}
                          className={fieldClass(Boolean(registerForm.formState.errors.email))}
                          placeholder="name@example.com"
                        />
                        {registerForm.formState.errors.email && (
                          <p className={fieldErrorClass}>
                            {registerForm.formState.errors.email.message}
                          </p>
                        )}
                      </motion.div>

                      <motion.div
                        variants={fieldItemVariants}
                        className="grid grid-cols-1 gap-3 sm:grid-cols-2"
                      >
                        <div>
                          <label htmlFor="register-password" className={labelClass}>
                            Mật khẩu
                          </label>
                          <div className="relative">
                            <input
                              {...registerForm.register('password')}
                              id="register-password"
                              type={showRegisterPassword ? 'text' : 'password'}
                              autoComplete="new-password"
                              aria-invalid={Boolean(registerForm.formState.errors.password)}
                              className={fieldClass(
                                Boolean(registerForm.formState.errors.password),
                                'pr-10',
                              )}
                              placeholder="••••••••"
                            />
                            <button
                              type="button"
                              onClick={() => setShowRegisterPassword((prev) => !prev)}
                              aria-label={showRegisterPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
                            >
                              {showRegisterPassword ? (
                                <EyeOff className="h-4 w-4" aria-hidden="true" />
                              ) : (
                                <Eye className="h-4 w-4" aria-hidden="true" />
                              )}
                            </button>
                          </div>
                          {registerForm.formState.errors.password && (
                            <p className={fieldErrorClass}>
                              {registerForm.formState.errors.password.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <label htmlFor="register-confirm-password" className={labelClass}>
                            Xác nhận
                          </label>
                          <div className="relative">
                            <input
                              {...registerForm.register('confirmPassword')}
                              id="register-confirm-password"
                              type={showConfirmPassword ? 'text' : 'password'}
                              autoComplete="new-password"
                              aria-invalid={Boolean(
                                registerForm.formState.errors.confirmPassword,
                              )}
                              className={fieldClass(
                                Boolean(registerForm.formState.errors.confirmPassword),
                                'pr-10',
                              )}
                              placeholder="••••••••"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword((prev) => !prev)}
                              aria-label={
                                showConfirmPassword
                                  ? 'Ẩn mật khẩu xác nhận'
                                  : 'Hiện mật khẩu xác nhận'
                              }
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-4 w-4" aria-hidden="true" />
                              ) : (
                                <Eye className="h-4 w-4" aria-hidden="true" />
                              )}
                            </button>
                          </div>
                          {registerForm.formState.errors.confirmPassword && (
                            <p className={fieldErrorClass}>
                              {registerForm.formState.errors.confirmPassword.message}
                            </p>
                          )}
                        </div>
                      </motion.div>

                      <motion.p
                        variants={fieldItemVariants}
                        className="text-xs text-muted-foreground"
                      >
                        Mật khẩu tối thiểu 8 ký tự, gồm ít nhất 1 chữ hoa và 1 chữ số.
                      </motion.p>

                      <motion.div variants={fieldItemVariants}>
                        <div className="flex items-start gap-2.5 pt-0.5">
                          <input
                            {...registerForm.register('agreeToTerms')}
                            type="checkbox"
                            id="agreeToTerms"
                            className="mt-0.5 h-4 w-4 rounded border-input accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
                          />
                          <label
                            htmlFor="agreeToTerms"
                            className="text-xs leading-relaxed text-muted-foreground"
                          >
                            Tôi đồng ý với{' '}
                            <span className="font-semibold text-primary">
                              Điều khoản dịch vụ
                            </span>{' '}
                            và{' '}
                            <span className="font-semibold text-primary">
                              Chính sách bảo mật
                            </span>
                          </label>
                        </div>
                        {registerForm.formState.errors.agreeToTerms && (
                          <p className={fieldErrorClass}>
                            {registerForm.formState.errors.agreeToTerms.message}
                          </p>
                        )}
                      </motion.div>

                      <motion.div variants={fieldItemVariants} className="pt-1">
                        <motion.button
                          type="submit"
                          disabled={isLoading}
                          aria-busy={isRegistering}
                          whileHover={
                            isLoading || prefersReducedMotion ? undefined : { y: -1 }
                          }
                          whileTap={
                            isLoading || prefersReducedMotion ? undefined : { scale: 0.985 }
                          }
                          transition={{ duration: 0.14 }}
                          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 text-base font-bold text-primary-foreground shadow-hn-sm transition-colors duration-150 hover:bg-primary-deep focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isRegistering ? (
                            <>
                              <Loader2
                                className="h-5 w-5 animate-spin motion-reduce:animate-none"
                                aria-hidden="true"
                              />
                              <span>Đang tạo tài khoản...</span>
                            </>
                          ) : (
                            <span>Đăng ký</span>
                          )}
                        </motion.button>
                      </motion.div>
                    </motion.form>
                  )}
                </AnimatePresence>
              </AnimatedHeight>

              {/* Bottom Mode Toggle */}
              <div className="mt-7 flex items-center justify-center gap-1.5 border-t border-border/70 pt-5 text-sm text-muted-foreground">
                <span>{isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}</span>
                <button
                  type="button"
                  onClick={() => setMode(!isLogin)}
                  className="group inline-flex items-center gap-1 font-bold text-primary transition-colors duration-150 hover:text-primary-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
                >
                  <span>{isLogin ? 'Đăng ký ngay' : 'Đăng nhập'}</span>
                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transform-none"
                    aria-hidden="true"
                  />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </MotionConfig>
  );
}
