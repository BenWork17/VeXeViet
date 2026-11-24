'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, ArrowRight } from 'lucide-react';
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useReducedMotion,
  type Variants,
} from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/hooks/useAuth';
import {
  loginSchema,
  registerSchema,
  SMOOTH_EASE,
  type LoginFormValues,
  type RegisterFormValues,
} from './auth.schema';
import { AnimatedHeight, AuthShowcaseAside } from './AuthShowcaseAside';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

export function AuthView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefersReducedMotion = Boolean(useReducedMotion());

  const initialIsLogin = searchParams.get('mode') !== 'register';
  const [isLogin, setIsLogin] = useState(initialIsLogin);
  const [direction, setDirection] = useState<1 | -1>(initialIsLogin ? -1 : 1);

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
    defaultValues: { email: '', password: '' },
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
      // Error is handled by useAuth
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
    } catch {
      // Error is handled by useAuth
    }
  };

  const setMode = (nextIsLogin: boolean) => {
    if (nextIsLogin === isLogin) return;
    setDirection(nextIsLogin ? -1 : 1);
    setIsLogin(nextIsLogin);
    loginForm.reset();
    registerForm.reset();
    resetLoginError();
    resetRegisterError();

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (nextIsLogin) {
        params.delete('mode');
      } else {
        params.set('mode', 'register');
      }
      const query = params.toString();
      window.history.replaceState(null, '', query ? `/login?${query}` : '/login');
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
      transition: { duration: prefersReducedMotion ? 0.1 : 0.2, ease: SMOOTH_EASE },
    }),
  };

  const fieldItemVariants: Variants = {
    enter: { opacity: 0, y: prefersReducedMotion ? 0 : 8 },
    center: {
      opacity: 1,
      y: 0,
      transition: { duration: prefersReducedMotion ? 0.1 : 0.22, ease: SMOOTH_EASE },
    },
    exit: { opacity: 0, transition: { duration: 0.12 } },
  };

  const headingVariants: Variants = {
    enter: (dir: number) => ({ opacity: 0, x: prefersReducedMotion ? 0 : dir * 18 }),
    center: {
      opacity: 1,
      x: 0,
      transition: { duration: prefersReducedMotion ? 0.12 : 0.24, ease: SMOOTH_EASE },
    },
    exit: (dir: number) => ({
      opacity: 0,
      x: prefersReducedMotion ? 0 : dir * -18,
      transition: { duration: prefersReducedMotion ? 0.1 : 0.16, ease: SMOOTH_EASE },
    }),
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative flex min-h-[calc(100vh-4rem)] w-full items-center justify-center overflow-hidden bg-background px-4 py-10 font-sans text-foreground sm:px-6 lg:px-8 lg:py-14">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 -left-32 h-[420px] w-[420px] rounded-full bg-primary/[0.08] blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -bottom-32 h-[460px] w-[460px] rounded-full bg-primary/[0.07] blur-3xl"
        />

        <motion.div
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.36, ease: SMOOTH_EASE }}
          className="relative z-10 w-full max-w-md lg:max-w-5xl"
        >
          <div className="mb-6 text-center lg:hidden">
            <Link
              href="/"
              className="inline-block font-display text-3xl tracking-tight text-foreground transition-opacity hover:opacity-85"
            >
              VeXeViet<span className="text-primary">.</span>
            </Link>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-md lg:grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <AuthShowcaseAside
              isLogin={isLogin}
              direction={direction}
              headingVariants={headingVariants}
            />

            <div className="flex flex-col justify-start p-6 sm:p-8 lg:px-10 lg:py-9 xl:px-11 xl:py-10">
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
                    isLogin ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
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
                    !isLogin ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
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

              <AnimatePresence initial={false}>
                {currentError && (
                  <motion.div
                    key="auth-error"
                    role="alert"
                    initial={
                      prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -6, height: 0 }
                    }
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={
                      prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -6, height: 0 }
                    }
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

              <AnimatedHeight reducedMotion={prefersReducedMotion}>
                <AnimatePresence mode="wait" custom={direction} initial={false}>
                  {isLogin ? (
                    <LoginForm
                      form={loginForm}
                      onSubmit={onLoginSubmit}
                      direction={direction}
                      slideVariants={slideVariants}
                      fieldItemVariants={fieldItemVariants}
                      isLoading={isLoading}
                      isLoggingIn={isLoggingIn}
                      prefersReducedMotion={prefersReducedMotion}
                    />
                  ) : (
                    <RegisterForm
                      form={registerForm}
                      onSubmit={onRegisterSubmit}
                      direction={direction}
                      slideVariants={slideVariants}
                      fieldItemVariants={fieldItemVariants}
                      isLoading={isLoading}
                      isRegistering={isRegistering}
                      prefersReducedMotion={prefersReducedMotion}
                    />
                  )}
                </AnimatePresence>
              </AnimatedHeight>

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
