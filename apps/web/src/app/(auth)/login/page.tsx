'use client';

import { Suspense, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/hooks/useAuth';
import { FadeIn } from '@/components/motion';

// Validation schemas matching BE requirements
const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(8, 'Mật khẩu phải từ 8 ký tự'),
});

const registerSchema = z.object({
  firstName: z.string().min(1, 'Vui lòng nhập họ'),
  lastName: z.string().min(1, 'Vui lòng nhập tên'),
  email: z.string().email('Email không hợp lệ'),
  phone: z.string().min(10, 'Số điện thoại phải từ 10 số').optional().or(z.literal('')),
  password: z.string()
    .min(8, 'Mật khẩu phải từ 8 ký tự')
    .regex(/[A-Z]/, 'Mật khẩu phải có ít nhất 1 chữ hoa')
    .regex(/[0-9]/, 'Mật khẩu phải có ít nhất 1 số'),
  confirmPassword: z.string(),
  agreeToTerms: z.boolean().refine(val => val === true, 'Bạn cần đồng ý với điều khoản'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

const fieldBase =
  'h-[42px] w-full rounded-md border border-input bg-field px-3.5 text-sm font-semibold text-foreground placeholder:font-normal placeholder:text-muted-foreground transition-colors duration-150 focus:outline-none focus:ring-[3px]';

function fieldClass(hasError: boolean) {
  return cn(
    fieldBase,
    hasError
      ? 'border-2 border-error focus:border-error focus:ring-error/[0.125]'
      : 'hover:border-primary focus:border-2 focus:border-primary focus:ring-primary/[0.125]',
  );
}

const labelClass = 'mb-1.5 block text-sm font-semibold text-foreground';
const fieldErrorClass = 'mt-1 text-xs text-error-ink';

function AuthPageContent() {
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';

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
    setIsLogin(nextIsLogin);
    loginForm.reset();
    registerForm.reset();
    resetLoginError();
    resetRegisterError();
  };

  const isLoading = isLoggingIn || isRegistering;
  const currentError = isLogin ? loginError?.message : registerError?.message;

  const modeButtonClass = (active: boolean) =>
    cn(
      'flex-1 rounded-md px-4 py-2 text-sm font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/[0.125]',
      active
        ? 'bg-card text-foreground shadow-hn-sm'
        : 'text-muted-foreground hover:text-foreground',
    );

  return (
    <FadeIn className="min-h-screen bg-background px-4 py-12 font-sans text-foreground">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-6 text-center">
          <Link href="/" className="font-display text-3xl text-foreground">
            VEXEVIET<span className="text-primary">.</span>
          </Link>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 shadow-hn-md sm:p-8">
          <div className="mb-6 flex rounded-md bg-muted p-1" role="tablist" aria-label="Chế độ xác thực">
            <button
              type="button"
              role="tab"
              aria-selected={isLogin}
              onClick={() => setMode(true)}
              className={modeButtonClass(isLogin)}
            >
              Đăng nhập
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={!isLogin}
              onClick={() => setMode(false)}
              className={modeButtonClass(!isLogin)}
            >
              Đăng ký
            </button>
          </div>

          <h1 className="mb-1 font-display text-3xl leading-tight text-foreground">
            {isLogin ? 'Chào mừng trở lại' : 'Tạo tài khoản mới'}
          </h1>
          <p className="mb-6 text-sm text-muted-foreground">
            {isLogin
              ? 'Đăng nhập để tiếp tục hành trình cùng VeXeViet.'
              : 'Chỉ mất một phút để bắt đầu đặt vé.'}
          </p>

          {currentError && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-2 rounded-md bg-error-soft px-3.5 py-2.5 text-sm text-error-ink"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
              <span>{currentError}</span>
            </div>
          )}

          {isLogin ? (
            <form className="space-y-4" onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
              <div>
                <label htmlFor="login-email" className={labelClass}>Email</label>
                <input
                  {...loginForm.register('email')}
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  aria-invalid={Boolean(loginForm.formState.errors.email)}
                  className={fieldClass(Boolean(loginForm.formState.errors.email))}
                  placeholder="name@example.com"
                />
                {loginForm.formState.errors.email && (
                  <p className={fieldErrorClass}>{loginForm.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label htmlFor="login-password" className={cn(labelClass, 'mb-0')}>Mật khẩu</label>
                  <Link
                    href="#"
                    className="text-xs font-semibold text-muted-foreground transition-colors duration-150 hover:text-primary"
                  >
                    Quên?
                  </Link>
                </div>
                <input
                  {...loginForm.register('password')}
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  aria-invalid={Boolean(loginForm.formState.errors.password)}
                  className={fieldClass(Boolean(loginForm.formState.errors.password))}
                  placeholder="••••••••"
                />
                {loginForm.formState.errors.password && (
                  <p className={fieldErrorClass}>{loginForm.formState.errors.password.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                aria-busy={isLoggingIn}
                className="mt-2 inline-flex h-[42px] w-full items-center justify-center gap-2 rounded-md bg-primary px-5 text-base font-semibold text-primary-foreground transition-colors duration-150 hover:bg-primary-deep focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/[0.125] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                    <span>Đang đăng nhập...</span>
                  </>
                ) : (
                  <span>Đăng nhập</span>
                )}
              </button>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={registerForm.handleSubmit(onRegisterSubmit)}>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="register-first-name" className={labelClass}>Họ</label>
                  <input
                    {...registerForm.register('firstName')}
                    id="register-first-name"
                    autoComplete="given-name"
                    aria-invalid={Boolean(registerForm.formState.errors.firstName)}
                    className={fieldClass(Boolean(registerForm.formState.errors.firstName))}
                    placeholder="Nguyễn"
                  />
                  {registerForm.formState.errors.firstName && (
                    <p className={fieldErrorClass}>{registerForm.formState.errors.firstName.message}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="register-last-name" className={labelClass}>Tên</label>
                  <input
                    {...registerForm.register('lastName')}
                    id="register-last-name"
                    autoComplete="family-name"
                    aria-invalid={Boolean(registerForm.formState.errors.lastName)}
                    className={fieldClass(Boolean(registerForm.formState.errors.lastName))}
                    placeholder="Văn A"
                  />
                  {registerForm.formState.errors.lastName && (
                    <p className={fieldErrorClass}>{registerForm.formState.errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="register-email" className={labelClass}>Email</label>
                <input
                  {...registerForm.register('email')}
                  id="register-email"
                  type="email"
                  autoComplete="email"
                  aria-invalid={Boolean(registerForm.formState.errors.email)}
                  className={fieldClass(Boolean(registerForm.formState.errors.email))}
                  placeholder="name@example.com"
                />
                {registerForm.formState.errors.email && (
                  <p className={fieldErrorClass}>{registerForm.formState.errors.email.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="register-password" className={labelClass}>Mật khẩu</label>
                  <input
                    {...registerForm.register('password')}
                    id="register-password"
                    type="password"
                    autoComplete="new-password"
                    aria-invalid={Boolean(registerForm.formState.errors.password)}
                    className={fieldClass(Boolean(registerForm.formState.errors.password))}
                    placeholder="••••••••"
                  />
                  {registerForm.formState.errors.password && (
                    <p className={fieldErrorClass}>{registerForm.formState.errors.password.message}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="register-confirm-password" className={labelClass}>Xác nhận</label>
                  <input
                    {...registerForm.register('confirmPassword')}
                    id="register-confirm-password"
                    type="password"
                    autoComplete="new-password"
                    aria-invalid={Boolean(registerForm.formState.errors.confirmPassword)}
                    className={fieldClass(Boolean(registerForm.formState.errors.confirmPassword))}
                    placeholder="••••••••"
                  />
                  {registerForm.formState.errors.confirmPassword && (
                    <p className={fieldErrorClass}>{registerForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-2 pt-1">
                <input
                  {...registerForm.register('agreeToTerms')}
                  type="checkbox"
                  id="agreeToTerms"
                  className="mt-0.5 h-4 w-4 rounded-sm border-input accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/[0.125]"
                />
                <label htmlFor="agreeToTerms" className="text-xs leading-relaxed text-muted-foreground">
                  Tôi đồng ý với{' '}
                  <Link href="/terms" className="font-semibold text-primary hover:text-primary-deep">Điều khoản dịch vụ</Link>{' '}
                  và{' '}
                  <Link href="/privacy" className="font-semibold text-primary hover:text-primary-deep">Chính sách bảo mật</Link>
                </label>
              </div>
              {registerForm.formState.errors.agreeToTerms && (
                <p className={fieldErrorClass}>{registerForm.formState.errors.agreeToTerms.message}</p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="mt-2 inline-flex h-[42px] w-full items-center justify-center gap-2 rounded-md bg-primary px-5 text-base font-semibold text-primary-foreground transition-colors duration-150 hover:bg-primary-deep focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/[0.125] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isRegistering ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                    <span>Đang tạo tài khoản...</span>
                  </>
                ) : (
                  <span>Đăng ký</span>
                )}
              </button>
            </form>
          )}

          <div className="mt-6 flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
            <span>{isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}</span>
            <button
              type="button"
              onClick={() => setMode(!isLogin)}
              className="inline-flex items-center gap-1 font-semibold text-primary transition-colors duration-150 hover:text-primary-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/[0.125]"
            >
              {isLogin ? 'Đăng ký ngay' : 'Đăng nhập'}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </FadeIn>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <AuthPageContent />
    </Suspense>
  );
}
