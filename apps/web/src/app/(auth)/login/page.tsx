'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/hooks/useAuth';

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

export default function AuthPage() {
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
    console.log('Register form submitted:', data);
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

  const toggleMode = () => {
    setIsLogin(!isLogin);
    loginForm.reset();
    registerForm.reset();
    resetLoginError();
    resetRegisterError();
  };

  const isLoading = isLoggingIn || isRegistering;
  const currentError = isLogin ? loginError?.message : registerError?.message;

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-white dark:bg-zinc-950 py-12 px-4 font-sans transition-colors duration-300">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-500/5 blur-[120px] rounded-full animate-pulse delay-700" />
      
      <div className="max-w-4xl w-full relative z-10 flex flex-col md:flex-row rounded-[2.5rem] border-4 border-slate-200 dark:border-blue-700 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.15)] overflow-hidden min-h-150">
        
        {/* Forms Container */}
        <div className={cn(
          "w-full md:w-1/2 relative transition-all duration-700 ease-in-out z-20 bg-white dark:bg-zinc-950 border-r-4 border-slate-200 dark:border-blue-700",
          isLogin ? "translate-x-0" : "md:translate-x-full"
        )}>
          {/* Login Form */}
          <div className={cn(
            "absolute inset-0 p-8 md:p-12 transition-all duration-700 ease-in-out flex flex-col justify-center",
            isLogin ? "opacity-100 z-20 pointer-events-auto" : "opacity-0 z-10 pointer-events-none"
          )}>
            <div className="text-center mb-10">
              <Link href="/" className="inline-block mb-6">
                <span className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white">
                  VEXEVIET<span className="text-primary">.</span>
                </span>
              </Link>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Chào mừng trở lại</h2>
            </div>

            <form className="space-y-6" onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
              {currentError && isLogin && (
                <div className="bg-primary/5 border-4 border-primary/20 rounded-2xl p-4">
                  <p className="text-sm text-primary font-bold text-center">{currentError}</p>
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 ml-1">Email</label>
                  <input
                    {...loginForm.register('email')}
                    type="email"
                    className="w-full bg-slate-50 dark:bg-zinc-800 border-4 border-slate-200 dark:border-zinc-700 rounded-2xl px-5 py-4 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-0 focus:border-primary transition-all"
                    placeholder="name@example.com"
                  />
                  {loginForm.formState.errors.email && <p className="text-[10px] font-bold text-primary uppercase tracking-tighter ml-1">{loginForm.formState.errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Mật khẩu</label>
                    <Link href="#" className="text-[10px] font-bold text-slate-500 hover:text-primary transition-colors uppercase tracking-widest">Quên?</Link>
                  </div>
                  <input
                    {...loginForm.register('password')}
                    type="password"
                    className="w-full bg-slate-50 dark:bg-zinc-800 border-4 border-slate-200 dark:border-zinc-700 rounded-2xl px-5 py-4 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-0 focus:border-primary transition-all"
                    placeholder="••••••••"
                  />
                  {loginForm.formState.errors.password && <p className="text-[10px] font-bold text-primary uppercase tracking-tighter ml-1">{loginForm.formState.errors.password.message}</p>}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full group relative flex items-center justify-center h-14 bg-slate-900 dark:bg-white text-white dark:text-black font-black uppercase tracking-widest rounded-2xl hover:bg-primary dark:hover:bg-primary dark:hover:text-white transition-all duration-500 disabled:opacity-50 active:scale-95 shadow-xl shadow-slate-200 dark:shadow-none"
              >
                {isLoggingIn ? <Loader2 className="animate-spin h-6 w-6" /> : <span>Đăng nhập</span>}
              </button>
            </form>
          </div>

          {/* Register Form */}
          <div className={cn(
            "absolute inset-0 p-8 md:p-12 transition-all duration-700 ease-in-out flex flex-col justify-center overflow-y-auto",
            !isLogin ? "opacity-100 z-20 pointer-events-auto" : "opacity-0 z-10 pointer-events-none"
          )}>
            <div className="text-center mb-6">
              <Link href="/" className="inline-block mb-4">
                <span className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white">
                  VEXEVIET<span className="text-primary">.</span>
                </span>
              </Link>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Tạo tài khoản mới</h2>
            </div>

            <form className="space-y-3" onSubmit={(e) => {
              e.preventDefault();
              console.log('Form submit event triggered');
              console.log('Form errors:', registerForm.formState.errors);
              console.log('Form values:', registerForm.getValues());
              registerForm.handleSubmit(onRegisterSubmit)(e);
            }}>
              {currentError && !isLogin && (
                <div className="bg-primary/5 border-4 border-primary/20 rounded-2xl p-3">
                  <p className="text-sm text-primary font-bold text-center">{currentError}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 ml-1">Họ</label>
                  <input
                    {...registerForm.register('firstName')}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border-4 border-slate-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-0 focus:border-primary transition-all"
                    placeholder="Nguyễn"
                  />
                  {registerForm.formState.errors.firstName && <p className="text-[10px] font-bold text-primary ml-1">{registerForm.formState.errors.firstName.message}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 ml-1">Tên</label>
                  <input
                    {...registerForm.register('lastName')}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border-4 border-slate-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-0 focus:border-primary transition-all"
                    placeholder="Văn A"
                  />
                  {registerForm.formState.errors.lastName && <p className="text-[10px] font-bold text-primary ml-1">{registerForm.formState.errors.lastName.message}</p>}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 ml-1">Email</label>
                <input
                  {...registerForm.register('email')}
                  type="email"
                  className="w-full bg-slate-50 dark:bg-zinc-800 border-4 border-slate-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-0 focus:border-primary transition-all"
                  placeholder="name@example.com"
                />
                {registerForm.formState.errors.email && <p className="text-[10px] font-bold text-primary ml-1">{registerForm.formState.errors.email.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 ml-1">Mật khẩu</label>
                  <input
                    {...registerForm.register('password')}
                    type="password"
                    className="w-full bg-slate-50 dark:bg-zinc-800 border-4 border-slate-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-0 focus:border-primary transition-all"
                    placeholder="••••••••"
                  />
                  {registerForm.formState.errors.password && <p className="text-[10px] font-bold text-primary ml-1">{registerForm.formState.errors.password.message}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 ml-1">Xác nhận</label>
                  <input
                    {...registerForm.register('confirmPassword')}
                    type="password"
                    className="w-full bg-slate-50 dark:bg-zinc-800 border-4 border-slate-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-0 focus:border-primary transition-all"
                    placeholder="••••••••"
                  />
                  {registerForm.formState.errors.confirmPassword && <p className="text-[10px] font-bold text-primary ml-1">{registerForm.formState.errors.confirmPassword.message}</p>}
                </div>
              </div>

              <div className="flex items-start gap-2 pt-2">
                <input
                  {...registerForm.register('agreeToTerms')}
                  type="checkbox"
                  id="agreeToTerms"
                  className="w-4 h-4 mt-1 rounded border-slate-300 text-primary focus:ring-primary"
                />
                <label htmlFor="agreeToTerms" className="text-xs text-slate-500 dark:text-slate-400">
                  Tôi đồng ý với <Link href="/terms" className="text-primary hover:underline">Điều khoản dịch vụ</Link> và <Link href="/privacy" className="text-primary hover:underline">Chính sách bảo mật</Link>
                </label>
              </div>
              {registerForm.formState.errors.agreeToTerms && <p className="text-[10px] font-bold text-primary ml-1">{registerForm.formState.errors.agreeToTerms.message}</p>}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full group relative flex items-center justify-center h-12 bg-slate-900 dark:bg-white text-white dark:text-black font-black uppercase tracking-widest rounded-xl hover:bg-primary dark:hover:bg-primary dark:hover:text-white transition-all duration-500 disabled:opacity-50 mt-2"
              >
                {isRegistering ? <Loader2 className="animate-spin h-5 w-5" /> : <span>Đăng ký</span>}
              </button>
            </form>
          </div>
        </div>

        {/* Overlay Section */}
        <div className={cn(
          "hidden md:flex md:w-1/2 bg-primary items-center justify-center p-12 text-center transition-all duration-700 ease-in-out relative z-30",
          isLogin ? "translate-x-0" : "md:-translate-x-full"
        )}>
          {/* Overlay Content - For Login Mode */}
          <div className={cn(
            "transition-all duration-700",
            isLogin ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none absolute"
          )}>
            <h2 className="text-4xl font-black text-white mb-6 tracking-tighter">Chào bạn mới!</h2>
            <p className="text-white/80 mb-8 font-medium">Đăng ký tài khoản để trải nghiệm những chuyến đi tuyệt vời cùng VEXEVIET.</p>
            <button
              onClick={toggleMode}
              className="px-10 py-4 border-2 border-white text-white font-black uppercase tracking-widest rounded-2xl hover:bg-white hover:text-primary transition-all duration-300"
            >
              Đăng ký ngay
            </button>
          </div>

          {/* Overlay Content - For Register Mode */}
          <div className={cn(
            "transition-all duration-700",
            !isLogin ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none absolute"
          )}>
            <h2 className="text-4xl font-black text-white mb-6 tracking-tighter">Mừng trở lại!</h2>
            <p className="text-white/80 mb-8 font-medium">Tiếp tục hành trình của bạn bằng cách đăng nhập vào tài khoản cá nhân.</p>
            <button
              onClick={toggleMode}
              className="px-10 py-4 border-2 border-white text-white font-black uppercase tracking-widest rounded-2xl hover:bg-white hover:text-primary transition-all duration-300"
            >
              Đăng nhập
            </button>
          </div>
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden p-6 border-t border-white/10 text-center">
          <p className="text-gray-400 text-sm mb-4">
            {isLogin ? "Chưa có tài khoản?" : "Đã có tài khoản?"}
          </p>
          <button
            onClick={toggleMode}
            className="text-primary font-bold flex items-center justify-center w-full group"
          >
            {isLogin ? "Đăng ký ngay" : "Đăng nhập"}
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </div>
    </div>
  );
}
