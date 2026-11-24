'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
} from 'lucide-react';
import { useResetPassword } from '@/lib/hooks/useAuth';
import { parseApiError } from '@/lib/api/client';
import {
  fieldClass,
  fieldErrorClass,
  labelClass,
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from '@/components/features/auth/auth.schema';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = (searchParams.get('token') || '').trim();
  const resetMutation = useResetPassword();

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  const watchedPassword = form.watch('newPassword') || '';
  const rules = [
    { label: 'Ít nhất 8 ký tự', valid: watchedPassword.length >= 8 },
    { label: 'Có chữ in hoa (A-Z)', valid: /[A-Z]/.test(watchedPassword) },
    { label: 'Có chữ thường (a-z)', valid: /[a-z]/.test(watchedPassword) },
    { label: 'Có chữ số (0-9)', valid: /[0-9]/.test(watchedPassword) },
  ];

  const parsedError = resetMutation.error ? parseApiError(resetMutation.error) : null;

  const onSubmit = async (values: ResetPasswordFormValues) => {
    if (!token) return;
    try {
      await resetMutation.mutateAsync({
        token,
        newPassword: values.newPassword,
      });
      setIsSuccess(true);
    } catch {
      // Handled via resetMutation.error
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-background px-4 py-12 font-sans text-foreground sm:px-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 -left-32 h-[380px] w-[380px] rounded-full bg-primary/[0.08] blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -bottom-32 h-[420px] w-[420px] rounded-full bg-primary/[0.07] blur-3xl"
      />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-6 text-center">
          <Link
            href="/"
            className="inline-block font-display text-3xl tracking-tight text-foreground transition-opacity hover:opacity-85"
          >
            VeXeViet<span className="text-primary">.</span>
          </Link>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-hn-md sm:p-8">
          <Link
            href="/login"
            className="mb-5 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Quay lại đăng nhập
          </Link>

          {!token ? (
            <div className="space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warning-soft text-warning-ink">
                <AlertCircle className="h-6 w-6" aria-hidden="true" />
              </div>
              <h1 className="font-display text-2xl leading-tight text-foreground">
                Liên kết đặt lại không hợp lệ
              </h1>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Đường dẫn thiếu mã xác thực khôi phục mật khẩu hoặc đã bị cắt ngắn. Vui lòng yêu cầu
                một liên kết mới.
              </p>
              <Link
                href="/forgot-password"
                className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-deep"
              >
                Yêu cầu liên kết mới
              </Link>
            </div>
          ) : isSuccess ? (
            <div className="space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success-soft text-success-ink">
                <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
              </div>
              <h1 className="font-display text-2xl leading-tight text-foreground">
                Đặt lại mật khẩu thành công
              </h1>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Mật khẩu mới đã được cập nhật và các phiên đăng nhập cũ đã được thu hồi tự động để
                bảo vệ tài khoản của bạn.
              </p>
              <Link
                href="/login"
                className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-deep"
              >
                Đăng nhập ngay
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-5">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-primary">
                  <KeyRound className="h-5 w-5" aria-hidden="true" />
                </div>
                <h1 className="font-display text-2xl leading-tight text-foreground sm:text-3xl">
                  Tạo mật khẩu mới
                </h1>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Nhập mật khẩu mới đủ mạnh cho tài khoản VeXeViet của bạn.
                </p>
              </div>

              {parsedError && (
                <div
                  role="alert"
                  className="mb-4 rounded-lg border border-error/25 bg-error-soft px-3.5 py-3 text-sm text-error-ink"
                >
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{parsedError.message}</span>
                  </div>
                  {parsedError.requestId && (
                    <p className="mt-1.5 pl-6 font-mono text-[11px] opacity-80">
                      Mã tham chiếu: {parsedError.requestId}
                    </p>
                  )}
                </div>
              )}

              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <div>
                  <label htmlFor="reset-new-password" className={labelClass}>
                    Mật khẩu mới
                  </label>
                  <div className="relative">
                    <input
                      {...form.register('newPassword')}
                      id="reset-new-password"
                      type={showNewPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      aria-invalid={Boolean(form.formState.errors.newPassword)}
                      className={fieldClass(Boolean(form.formState.errors.newPassword), 'pr-10')}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((prev) => !prev)}
                      aria-label={showNewPassword ? 'Ẩn mật khẩu mới' : 'Hiện mật khẩu mới'}
                      className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {form.formState.errors.newPassword && (
                    <p className={fieldErrorClass}>{form.formState.errors.newPassword.message}</p>
                  )}

                  <ul className="mt-2.5 grid grid-cols-2 gap-1.5 text-xs">
                    {rules.map((rule) => (
                      <li
                        key={rule.label}
                        className={`inline-flex items-center gap-1.5 ${
                          rule.valid ? 'font-semibold text-success-ink' : 'text-muted-foreground'
                        }`}
                      >
                        <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        <span>{rule.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <label htmlFor="reset-confirm-password" className={labelClass}>
                    Xác nhận mật khẩu mới
                  </label>
                  <div className="relative">
                    <input
                      {...form.register('confirmPassword')}
                      id="reset-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      aria-invalid={Boolean(form.formState.errors.confirmPassword)}
                      className={fieldClass(Boolean(form.formState.errors.confirmPassword), 'pr-10')}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      aria-label={showConfirmPassword ? 'Ẩn mật khẩu xác nhận' : 'Hiện mật khẩu xác nhận'}
                      className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {form.formState.errors.confirmPassword && (
                    <p className={fieldErrorClass}>{form.formState.errors.confirmPassword.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={resetMutation.isPending}
                  aria-busy={resetMutation.isPending}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground shadow-hn-sm transition-colors hover:bg-primary-deep focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {resetMutation.isPending ? (
                    <>
                      <Loader2
                        className="h-4 w-4 animate-spin motion-reduce:animate-none"
                        aria-hidden="true"
                      />
                      <span>Đang cập nhật mật khẩu...</span>
                    </>
                  ) : (
                    <span>Xác nhận đặt lại mật khẩu</span>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div
          className="flex min-h-screen items-center justify-center bg-background px-4"
          role="status"
          aria-label="Đang tải trang đặt lại mật khẩu"
        >
          <Loader2
            className="h-7 w-7 animate-spin text-primary motion-reduce:animate-none"
            aria-hidden="true"
          />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
