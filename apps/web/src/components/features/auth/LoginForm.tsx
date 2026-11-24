'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { UseFormReturn } from 'react-hook-form';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { motion, type Variants } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  fieldClass,
  fieldErrorClass,
  labelClass,
  type LoginFormValues,
} from './auth.schema';

interface LoginFormProps {
  form: UseFormReturn<LoginFormValues>;
  onSubmit: (data: LoginFormValues) => Promise<void>;
  direction: 1 | -1;
  slideVariants: Variants;
  fieldItemVariants: Variants;
  isLoading: boolean;
  isLoggingIn: boolean;
  prefersReducedMotion: boolean;
}

export function LoginForm({
  form,
  onSubmit,
  direction,
  slideVariants,
  fieldItemVariants,
  isLoading,
  isLoggingIn,
  prefersReducedMotion,
}: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const watchedEmail = form.watch('email')?.trim();
  const forgotHref = watchedEmail
    ? `/forgot-password?email=${encodeURIComponent(watchedEmail)}`
    : '/forgot-password';

  return (
    <motion.form
      key="login-form"
      custom={direction}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      className="space-y-4 py-0.5"
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
    >
      <motion.div variants={fieldItemVariants}>
        <label htmlFor="login-email" className={labelClass}>
          Email
        </label>
        <input
          {...form.register('email')}
          id="login-email"
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
      </motion.div>

      <motion.div variants={fieldItemVariants}>
        <div className="mb-1.5 flex items-center justify-between">
          <label htmlFor="login-password" className={cn(labelClass, 'mb-0')}>
            Mật khẩu
          </label>
          <Link
            href={forgotHref}
            className="text-xs font-semibold text-muted-foreground transition-colors duration-150 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
          >
            Quên mật khẩu?
          </Link>
        </div>
        <div className="relative">
          <input
            {...form.register('password')}
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            aria-invalid={Boolean(form.formState.errors.password)}
            className={fieldClass(Boolean(form.formState.errors.password), 'pr-10')}
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Eye className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>
        {form.formState.errors.password && (
          <p className={fieldErrorClass}>{form.formState.errors.password.message}</p>
        )}
      </motion.div>

      <motion.div variants={fieldItemVariants} className="pt-1">
        <motion.button
          type="submit"
          disabled={isLoading}
          aria-busy={isLoggingIn}
          whileHover={isLoading || prefersReducedMotion ? undefined : { y: -1 }}
          whileTap={isLoading || prefersReducedMotion ? undefined : { scale: 0.985 }}
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
  );
}
