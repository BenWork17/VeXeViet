import * as z from 'zod';
import { cn } from '@/lib/utils';

export const passwordPolicySchema = z
  .string()
  .min(8, 'Mật khẩu phải từ 8 ký tự')
  .regex(/[A-Z]/, 'Mật khẩu phải có ít nhất 1 chữ hoa')
  .regex(/[a-z]/, 'Mật khẩu phải có ít nhất 1 chữ thường')
  .regex(/[0-9]/, 'Mật khẩu phải có ít nhất 1 chữ số');

export const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

export const registerSchema = z
  .object({
    firstName: z.string().min(1, 'Vui lòng nhập họ'),
    lastName: z.string().min(1, 'Vui lòng nhập tên'),
    email: z.string().email('Email không hợp lệ'),
    phone: z
      .string()
      .min(10, 'Số điện thoại phải từ 10 số')
      .optional()
      .or(z.literal('')),
    password: passwordPolicySchema,
    confirmPassword: z.string(),
    agreeToTerms: z.boolean().refine((val) => val === true, 'Bạn cần đồng ý với điều khoản'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Vui lòng nhập địa chỉ email hợp lệ'),
});

export const resetPasswordSchema = z
  .object({
    newPassword: passwordPolicySchema,
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu mới'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export const SMOOTH_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fieldBase =
  'h-11 w-full rounded-lg border border-input bg-field px-3.5 text-sm font-semibold text-foreground placeholder:font-normal placeholder:text-muted-foreground transition-all duration-150 focus:outline-none focus:ring-2';

export function fieldClass(hasError: boolean, extra?: string) {
  return cn(
    fieldBase,
    hasError
      ? 'border-error focus:border-error focus:ring-error/20'
      : 'hover:border-primary/70 focus:border-primary focus:ring-primary/20',
    extra,
  );
}

export const labelClass = 'mb-1.5 block text-sm font-semibold text-foreground';
export const fieldErrorClass = 'mt-1.5 text-xs font-medium text-error-ink';
