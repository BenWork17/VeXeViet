'use client';

import { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { motion, type Variants } from 'framer-motion';
import {
  fieldClass,
  fieldErrorClass,
  labelClass,
  type RegisterFormValues,
} from './auth.schema';

interface RegisterFormProps {
  form: UseFormReturn<RegisterFormValues>;
  onSubmit: (data: RegisterFormValues) => Promise<void>;
  direction: 1 | -1;
  slideVariants: Variants;
  fieldItemVariants: Variants;
  isLoading: boolean;
  isRegistering: boolean;
  prefersReducedMotion: boolean;
}

export function RegisterForm({
  form,
  onSubmit,
  direction,
  slideVariants,
  fieldItemVariants,
  isLoading,
  isRegistering,
  prefersReducedMotion,
}: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <motion.form
      key="register-form"
      custom={direction}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      className="space-y-4 py-0.5"
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
    >
      <motion.div variants={fieldItemVariants} className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="register-first-name" className={labelClass}>
            Họ
          </label>
          <input
            {...form.register('firstName')}
            id="register-first-name"
            autoComplete="family-name"
            aria-invalid={Boolean(form.formState.errors.firstName)}
            className={fieldClass(Boolean(form.formState.errors.firstName))}
            placeholder="Nguyễn"
          />
          {form.formState.errors.firstName && (
            <p className={fieldErrorClass}>{form.formState.errors.firstName.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="register-last-name" className={labelClass}>
            Tên
          </label>
          <input
            {...form.register('lastName')}
            id="register-last-name"
            autoComplete="given-name"
            aria-invalid={Boolean(form.formState.errors.lastName)}
            className={fieldClass(Boolean(form.formState.errors.lastName))}
            placeholder="Văn A"
          />
          {form.formState.errors.lastName && (
            <p className={fieldErrorClass}>{form.formState.errors.lastName.message}</p>
          )}
        </div>
      </motion.div>

      <motion.div variants={fieldItemVariants}>
        <label htmlFor="register-email" className={labelClass}>
          Email
        </label>
        <input
          {...form.register('email')}
          id="register-email"
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

      <motion.div variants={fieldItemVariants} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="register-password" className={labelClass}>
            Mật khẩu
          </label>
          <div className="relative">
            <input
              {...form.register('password')}
              id="register-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
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
        </div>
        <div>
          <label htmlFor="register-confirm-password" className={labelClass}>
            Xác nhận
          </label>
          <div className="relative">
            <input
              {...form.register('confirmPassword')}
              id="register-confirm-password"
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
              className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
          {form.formState.errors.confirmPassword && (
            <p className={fieldErrorClass}>{form.formState.errors.confirmPassword.message}</p>
          )}
        </div>
      </motion.div>

      <motion.p variants={fieldItemVariants} className="text-xs text-muted-foreground">
        Mật khẩu tối thiểu 8 ký tự, gồm ít nhất 1 chữ hoa và 1 chữ số.
      </motion.p>

      <motion.div variants={fieldItemVariants}>
        <div className="flex items-start gap-2.5 pt-0.5">
          <input
            {...form.register('agreeToTerms')}
            type="checkbox"
            id="agreeToTerms"
            className="mt-0.5 h-4 w-4 rounded border-input accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
          />
          <label htmlFor="agreeToTerms" className="text-xs leading-relaxed text-muted-foreground">
            Tôi đồng ý với <span className="font-semibold text-primary">Điều khoản dịch vụ</span> và{' '}
            <span className="font-semibold text-primary">Chính sách bảo mật</span>
          </label>
        </div>
        {form.formState.errors.agreeToTerms && (
          <p className={fieldErrorClass}>{form.formState.errors.agreeToTerms.message}</p>
        )}
      </motion.div>

      <motion.div variants={fieldItemVariants} className="pt-1">
        <motion.button
          type="submit"
          disabled={isLoading}
          aria-busy={isRegistering}
          whileHover={isLoading || prefersReducedMotion ? undefined : { y: -1 }}
          whileTap={isLoading || prefersReducedMotion ? undefined : { scale: 0.985 }}
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
  );
}
