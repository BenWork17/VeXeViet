'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, ArrowLeft, CheckCircle2, Loader2, Mail, RotateCcw } from 'lucide-react';
import { useForgotPassword } from '@/lib/hooks/useAuth';
import { parseApiError } from '@/lib/api/client';
import {
  fieldClass,
  fieldErrorClass,
  forgotPasswordSchema,
  labelClass,
  type ForgotPasswordFormValues,
} from '@/components/features/auth/auth.schema';

function ForgotPasswordContent() {
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get('email') || '';
  const forgotMutation = useForgotPassword();
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: initialEmail },
  });

  useEffect(() => {
    if (initialEmail && !form.getValues('email')) {
      form.setValue('email', initialEmail);
    }
  }, [initialEmail, form]);

  const parsedError = forgotMutation.error ? parseApiError(forgotMutation.error) : null;

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    try {
      await forgotMutation.mutateAsync({ email: values.email.trim() });
      setSubmittedEmail(values.email.trim());
    } catch {
      // Handled via forgotMutation.error
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

          {submittedEmail ? (
            <div className="space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success-soft text-success-ink">
                <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
              </div>
              <h1 className="font-display text-2xl leading-tight text-foreground">
                Kiểm tra hộp thư của bạn
              </h1>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Nếu địa chỉ <strong className="text-foreground">{submittedEmail}</strong> đã đăng ký
                trên hệ thống VeXeViet, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu có hiệu lực
                trong vòng <strong>30 phút</strong>.
              </p>
              <div className="rounded-lg border border-border bg-muted/60 px-3.5 py-3 text-xs leading-relaxed text-muted-foreground">
                Không thấy email? Hãy kiểm tra thư mục <strong>Spam / Quảng cáo</strong> hoặc thử
                gửi lại bằng địa chỉ khác.
              </div>
              <div className="flex flex-col gap-2.5 pt-2">
                <Link
                  href="/login"
                  className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-deep"
                >
                  Về trang đăng nhập
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    forgotMutation.reset();
                    setSubmittedEmail(null);
                  }}
                  className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-4 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  Thử lại với email khác
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-5">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-primary">
                  <Mail className="h-5 w-5" aria-hidden="true" />
                </div>
                <h1 className="font-display text-2xl leading-tight text-foreground sm:text-3xl">
                  Quên mật khẩu?
                </h1>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Nhập email tài khoản của bạn để nhận liên kết đặt lại mật khẩu an toàn.
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
                  <label htmlFor="forgot-email" className={labelClass}>
                    Địa chỉ Email
                  </label>
                  <input
                    {...form.register('email')}
                    id="forgot-email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    aria-invalid={Boolean(form.formState.errors.email)}
                    className={fieldClass(Boolean(form.formState.errors.email))}
                    placeholder="name@example.com"
                  />
                  {form.formState.errors.email && (
                    <p className={fieldErrorClass}>{form.formState.errors.email.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={forgotMutation.isPending}
                  aria-busy={forgotMutation.isPending}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground shadow-hn-sm transition-colors hover:bg-primary-deep focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {forgotMutation.isPending ? (
                    <>
                      <Loader2
                        className="h-4 w-4 animate-spin motion-reduce:animate-none"
                        aria-hidden="true"
                      />
                      <span>Đang gửi yêu cầu...</span>
                    </>
                  ) : (
                    <span>Gửi liên kết đặt lại mật khẩu</span>
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

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div
          className="flex min-h-screen items-center justify-center bg-background px-4"
          role="status"
          aria-label="Đang tải trang khôi phục mật khẩu"
        >
          <Loader2
            className="h-7 w-7 animate-spin text-primary motion-reduce:animate-none"
            aria-hidden="true"
          />
        </div>
      }
    >
      <ForgotPasswordContent />
    </Suspense>
  );
}
