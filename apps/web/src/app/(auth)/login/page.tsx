'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { loginUser, registerUser } from '@/store/slices/authSlice';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải từ 6 ký tự'),
});

const registerSchema = z.object({
  fullName: z.string().min(2, 'Họ tên phải từ 2 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  phone: z.string().min(10, 'Số điện thoại phải từ 10 số'),
  password: z.string().min(6, 'Mật khẩu phải từ 6 ký tự'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { isLoading, error, user } = useSelector((state: RootState) => state.auth);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const onLoginSubmit = async (data: LoginFormValues) => {
    dispatch(loginUser(data));
  };

  const onRegisterSubmit = async (data: RegisterFormValues) => {
    dispatch(registerUser(data));
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    loginForm.reset();
    registerForm.reset();
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-white dark:bg-zinc-950 py-12 px-4 font-sans transition-colors duration-300">
      {/* Background Orbs - Subtler for white background */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-500/5 blur-[120px] rounded-full animate-pulse delay-700" />
      
      <div className="max-w-4xl w-full relative z-10 flex flex-col md:flex-row rounded-[2.5rem] border-4 border-slate-200 dark:border-blue-700 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.15)] overflow-hidden min-h-[600px]">
        
        {/* Forms Container */}
        <div className={cn(
          "w-full md:w-1/2 relative transition-all duration-700 ease-in-out z-20 bg-white dark:bg-zinc-950 border-r-4 border-slate-200 dark:border-blue-700",
          isLogin ? "translate-x-0" : "md:translate-x-full"
        )}>
          {/* Login Form */}
          <div className={cn(
            "absolute inset-0 p-8 md:p-12 transition-all duration-700 ease-in-out flex flex-col justify-center",
            isLogin ? "opacity-100 z-20" : "opacity-0 z-10"
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
              {error && isLogin && (
                <div className="bg-primary/5 border-4 border-primary/20 rounded-2xl p-4">
                  <p className="text-sm text-primary font-bold text-center">{error}</p>
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
                {isLoading ? <Loader2 className="animate-spin h-6 w-6" /> : <span>Đăng nhập</span>}
              </button>
            </form>
          </div>

          {/* Register Form */}
          <div className={cn(
            "absolute inset-0 p-8 md:p-12 transition-all duration-700 ease-in-out flex flex-col justify-center",
            !isLogin ? "opacity-100 z-20" : "opacity-0 z-10"
          )}>
            <div className="text-center mb-8">
              <Link href="/" className="inline-block mb-4">
                <span className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white">
                  VEXEVIET<span className="text-primary">.</span>
                </span>
              </Link>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Tạo tài khoản mới</h2>
            </div>

            <form className="space-y-4" onSubmit={registerForm.handleSubmit(onRegisterSubmit)}>
              {error && !isLogin && (
                <div className="bg-primary/5 border-4 border-primary/20 rounded-2xl p-3">
                  <p className="text-sm text-primary font-bold text-center">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 ml-1">Họ tên</label>
                  <input
                    {...registerForm.register('fullName')}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border-4 border-slate-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-0 focus:border-primary transition-all"
                    placeholder="Nguyễn Văn A"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 ml-1">SĐT</label>
                  <input
                    {...registerForm.register('phone')}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border-4 border-slate-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-0 focus:border-primary transition-all"
                    placeholder="0912..."
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 ml-1">Email</label>
                <input
                  {...registerForm.register('email')}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border-4 border-slate-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-0 focus:border-primary transition-all"
                  placeholder="name@example.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 ml-1">Mật khẩu</label>
                  <input
                    {...registerForm.register('password')}
                    type="password"
                    className="w-full bg-slate-50 dark:bg-zinc-800 border-4 border-slate-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-0 focus:border-primary transition-all"
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 ml-1">Xác nhận</label>
                  <input
                    {...registerForm.register('confirmPassword')}
                    type="password"
                    className="w-full bg-slate-50 dark:bg-zinc-800 border-4 border-slate-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-0 focus:border-primary transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full group relative flex items-center justify-center h-12 bg-slate-900 dark:bg-white text-white dark:text-black font-black uppercase tracking-widest rounded-xl hover:bg-primary dark:hover:bg-primary dark:hover:text-white transition-all duration-500 disabled:opacity-50 mt-2"
              >
                {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : <span>Đăng ký</span>}
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
            <p className="text-white/80 mb-8 font-medium">Đăng ký tài khoản để trải nghiệm những chuyến đi tuyệt vời cùng VEXEVÍET.</p>
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
