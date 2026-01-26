'use client';

import { useState } from 'react';
import { useAppSelector } from '@/lib/hooks/redux';
import { cn } from '@/lib/utils';
import { Input } from '@vexeviet/ui';
import { User, Phone, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';

export interface PassengerInfo {
  fullName: string;
  phone: string;
  email: string;
  acceptTerms: boolean;
}

interface PassengerInfoFormProps {
  initialData?: Partial<PassengerInfo>;
  onSubmit: (data: PassengerInfo) => void;
  isSubmitting?: boolean;
  className?: string;
}

export function PassengerInfoForm({ 
  initialData, 
  onSubmit, 
  isSubmitting = false,
  className 
}: PassengerInfoFormProps) {
  const [formData, setFormData] = useState<PassengerInfo>({
    fullName: initialData?.fullName || '',
    phone: initialData?.phone || '',
    email: initialData?.email || '',
    acceptTerms: initialData?.acceptTerms || false,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof PassengerInfo, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof PassengerInfo, boolean>>>({});

  // Validation rules
  const validate = (field: keyof PassengerInfo, value: any): string | null => {
    switch (field) {
      case 'fullName':
        if (!value || value.trim().length < 2) {
          return 'Vui lòng nhập họ tên (tối thiểu 2 ký tự)';
        }
        if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(value)) {
          return 'Họ tên chỉ được chứa chữ cái và khoảng trắng';
        }
        return null;

      case 'phone':
        if (!value || !/^(0|\+84)[0-9]{9,10}$/.test(value.replace(/\s/g, ''))) {
          return 'Số điện thoại không hợp lệ (10-11 số, bắt đầu bằng 0 hoặc +84)';
        }
        return null;

      case 'email':
        if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'Email không hợp lệ';
        }
        return null;

      case 'acceptTerms':
        if (!value) {
          return 'Bạn cần đồng ý với điều khoản để tiếp tục';
        }
        return null;

      default:
        return null;
    }
  };

  const handleChange = (field: keyof PassengerInfo, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (touched[field]) {
      const error = validate(field, value);
      setErrors(prev => ({ ...prev, [field]: error || undefined }));
    }
  };

  const handleBlur = (field: keyof PassengerInfo) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validate(field, formData[field]);
    setErrors(prev => ({ ...prev, [field]: error || undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const newErrors: Partial<Record<keyof PassengerInfo, string>> = {};
    let hasError = false;

    (Object.keys(formData) as Array<keyof PassengerInfo>).forEach(field => {
      const error = validate(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        hasError = true;
      }
    });

    if (hasError) {
      setErrors(newErrors);
      setTouched({
        fullName: true,
        phone: true,
        email: true,
        acceptTerms: true,
      });
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-6', className)}>
      {/* Full Name */}
      <div>
        <label htmlFor="fullName" className="block text-sm font-bold text-slate-900 mb-2">
          Họ và tên <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <User className="w-5 h-5" />
          </div>
          <Input
            id="fullName"
            type="text"
            placeholder="Nguyễn Văn A"
            value={formData.fullName}
            onChange={(e) => handleChange('fullName', e.target.value)}
            onBlur={() => handleBlur('fullName')}
            disabled={isSubmitting}
            className={cn(
              'pl-12 h-14 text-base',
              errors.fullName && touched.fullName && 'border-red-500 focus:border-red-500'
            )}
            aria-invalid={!!(errors.fullName && touched.fullName)}
            aria-describedby={errors.fullName && touched.fullName ? 'fullName-error' : undefined}
          />
        </div>
        {errors.fullName && touched.fullName && (
          <p id="fullName-error" className="mt-2 text-sm text-red-600 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {errors.fullName}
          </p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phone" className="block text-sm font-bold text-slate-900 mb-2">
          Số điện thoại <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <Phone className="w-5 h-5" />
          </div>
          <Input
            id="phone"
            type="tel"
            placeholder="0912345678"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            onBlur={() => handleBlur('phone')}
            disabled={isSubmitting}
            className={cn(
              'pl-12 h-14 text-base',
              errors.phone && touched.phone && 'border-red-500 focus:border-red-500'
            )}
            aria-invalid={!!(errors.phone && touched.phone)}
            aria-describedby={errors.phone && touched.phone ? 'phone-error' : undefined}
          />
        </div>
        {errors.phone && touched.phone && (
          <p id="phone-error" className="mt-2 text-sm text-red-600 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {errors.phone}
          </p>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-bold text-slate-900 mb-2">
          Email <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <Mail className="w-5 h-5" />
          </div>
          <Input
            id="email"
            type="email"
            placeholder="example@email.com"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            disabled={isSubmitting}
            className={cn(
              'pl-12 h-14 text-base',
              errors.email && touched.email && 'border-red-500 focus:border-red-500'
            )}
            aria-invalid={!!(errors.email && touched.email)}
            aria-describedby={errors.email && touched.email ? 'email-error' : undefined}
          />
        </div>
        {errors.email && touched.email && (
          <p id="email-error" className="mt-2 text-sm text-red-600 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {errors.email}
          </p>
        )}
        <p className="mt-2 text-xs text-slate-500">
          Vé điện tử sẽ được gửi đến email này
        </p>
      </div>

      {/* Terms & Conditions */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.acceptTerms}
            onChange={(e) => handleChange('acceptTerms', e.target.checked)}
            onBlur={() => handleBlur('acceptTerms')}
            disabled={isSubmitting}
            className={cn(
              'mt-1 w-5 h-5 rounded border-2 text-blue-600 focus:ring-blue-500',
              errors.acceptTerms && touched.acceptTerms && 'border-red-500'
            )}
            aria-invalid={!!(errors.acceptTerms && touched.acceptTerms)}
            aria-describedby={errors.acceptTerms && touched.acceptTerms ? 'terms-error' : undefined}
          />
          <div className="flex-1">
            <p className="text-sm text-slate-700 leading-relaxed">
              Tôi đã đọc và đồng ý với{' '}
              <a href="/terms" target="_blank" className="text-blue-600 font-semibold hover:underline">
                điều khoản sử dụng
              </a>{' '}
              và{' '}
              <a href="/privacy" target="_blank" className="text-blue-600 font-semibold hover:underline">
                chính sách bảo mật
              </a>{' '}
              của VeXeViet
            </p>
          </div>
        </label>
        {errors.acceptTerms && touched.acceptTerms && (
          <p id="terms-error" className="mt-2 text-sm text-red-600 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {errors.acceptTerms}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className={cn(
          'w-full h-14 rounded-xl font-bold text-lg transition-all',
          isSubmitting
            ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/25 active:scale-[0.98]'
        )}
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Đang xử lý...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            Tiếp tục thanh toán
            <CheckCircle2 className="w-5 h-5" />
          </span>
        )}
      </button>
    </form>
  );
}

export default PassengerInfoForm;
