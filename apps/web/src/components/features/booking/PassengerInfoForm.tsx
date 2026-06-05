'use client';

import { useState } from 'react';
import { useAppSelector } from '@/lib/hooks/redux';
import { cn } from '@/lib/utils';
import { Input } from '@vexeviet/ui';
import { User, Phone, Mail, AlertCircle, CheckCircle2, Armchair, IdCard, Calendar } from 'lucide-react';

export interface PassengerData {
  firstName: string;
  lastName: string;
  seatNumber: string;
  idNumber?: string;
  dateOfBirth?: string;
}

export interface PassengerInfo {
  fullName: string;
  phone: string;
  email: string;
  passengers: PassengerData[];
  acceptTerms: boolean;
}

interface PassengerInfoFormProps {
  initialData?: Partial<PassengerInfo>;
  onSubmit: (data: PassengerInfo) => void;
  isSubmitting?: boolean;
  className?: string;
}

type ContactField = 'fullName' | 'phone' | 'email' | 'acceptTerms';

export function PassengerInfoForm({ 
  initialData, 
  onSubmit, 
  isSubmitting = false,
  className 
}: PassengerInfoFormProps) {
  const booking = useAppSelector((state) => state.booking);
  const seatLabels = booking.heldSeats.length > 0 ? booking.heldSeats : booking.selectedSeats;

  // Split initial fullName for first passenger
  const nameParts = (initialData?.fullName || '').split(' ');
  const initLastName = nameParts[0] || '';
  const initFirstName = nameParts.slice(1).join(' ') || '';

  const [contactData, setContactData] = useState({
    fullName: initialData?.fullName || '',
    phone: initialData?.phone || '',
    email: initialData?.email || '',
    acceptTerms: initialData?.acceptTerms || false,
  });

  const [passengers, setPassengers] = useState<PassengerData[]>(
    seatLabels.map((seat, index) => ({
      firstName: index === 0 ? initFirstName : '',
      lastName: index === 0 ? initLastName : '',
      seatNumber: seat,
      idNumber: '',
      dateOfBirth: '',
    }))
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateContact = (field: ContactField, value: string | boolean): string | null => {
    switch (field) {
      case 'fullName': {
        const text = typeof value === 'string' ? value : '';
        if (!text || text.trim().length < 2) return 'Vui lòng nhập họ tên (tối thiểu 2 ký tự)';
        if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(text)) return 'Họ tên chỉ được chứa chữ cái và khoảng trắng';
        return null;
      }
      case 'phone': {
        const text = typeof value === 'string' ? value : '';
        if (!text || !/^(0|\+84)[0-9]{9,10}$/.test(text.replace(/\s/g, '')))
          return 'Số điện thoại không hợp lệ (10-11 số, bắt đầu bằng 0 hoặc +84)';
        return null;
      }
      case 'email': {
        const text = typeof value === 'string' ? value : '';
        if (!text || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) return 'Email không hợp lệ';
        return null;
      }
      case 'acceptTerms':
        if (!value) return 'Bạn cần đồng ý với điều khoản để tiếp tục';
        return null;
      default:
        return null;
    }
  };

  const validatePassenger = (index: number, field: keyof PassengerData, value: string): string | null => {
    if (field === 'firstName' && (!value || value.trim().length < 1)) return 'Vui lòng nhập tên';
    if (field === 'lastName' && (!value || value.trim().length < 1)) return 'Vui lòng nhập họ';
    return null;
  };

  const handleContactChange = (field: ContactField, value: string | boolean) => {
    setContactData(prev => ({ ...prev, [field]: value }));
    if (touched[field]) {
      const error = validateContact(field, value);
      setErrors(prev => ({ ...prev, [field]: error || '' }));
    }
  };

  const handleContactBlur = (field: ContactField) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateContact(field, contactData[field]);
    setErrors(prev => ({ ...prev, [field]: error || '' }));
  };

  const handlePassengerChange = (index: number, field: keyof PassengerData, value: string) => {
    setPassengers(prev => {
      const updated = [...prev];
      updated[index] = { ...prev[index], [field]: value } as PassengerData;
      return updated;
    });
    const key = `passenger_${index}_${field}`;
    if (touched[key]) {
      const error = validatePassenger(index, field, value);
      setErrors(prev => ({ ...prev, [key]: error || '' }));
    }
  };

  const handlePassengerBlur = (index: number, field: keyof PassengerData) => {
    const key = `passenger_${index}_${field}`;
    setTouched(prev => ({ ...prev, [key]: true }));
    const p = passengers[index];
    const error = p ? validatePassenger(index, field, p[field] || '') : null;
    setErrors(prev => ({ ...prev, [key]: error || '' }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    let hasError = false;

    // Validate contact fields
    (['fullName', 'phone', 'email', 'acceptTerms'] as ContactField[]).forEach(field => {
      const error = validateContact(field, contactData[field]);
      if (error) { newErrors[field] = error; hasError = true; }
    });

    // Validate each passenger
    passengers.forEach((p, i) => {
      const fnErr = validatePassenger(i, 'firstName', p.firstName);
      if (fnErr) { newErrors[`passenger_${i}_firstName`] = fnErr; hasError = true; }
      const lnErr = validatePassenger(i, 'lastName', p.lastName);
      if (lnErr) { newErrors[`passenger_${i}_lastName`] = lnErr; hasError = true; }
    });

    if (hasError) {
      setErrors(newErrors);
      const allTouched: Record<string, boolean> = { fullName: true, phone: true, email: true, acceptTerms: true };
      passengers.forEach((_, i) => {
        allTouched[`passenger_${i}_firstName`] = true;
        allTouched[`passenger_${i}_lastName`] = true;
      });
      setTouched(allTouched);
      return;
    }

    onSubmit({
      fullName: contactData.fullName,
      phone: contactData.phone,
      email: contactData.email,
      passengers,
      acceptTerms: contactData.acceptTerms,
    });
  };

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-6', className)}>
      {/* Contact Info Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Mail className="w-5 h-5 text-blue-500" />
          Thông tin liên hệ
        </h3>

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
              value={contactData.fullName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleContactChange('fullName', e.target.value)}
              onBlur={() => handleContactBlur('fullName')}
              disabled={isSubmitting}
              className={cn('pl-12 h-14 text-base', errors.fullName && touched.fullName && 'border-red-500')}
            />
          </div>
          {errors.fullName && touched.fullName && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-2"><AlertCircle className="w-4 h-4" />{errors.fullName}</p>
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
              value={contactData.phone}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleContactChange('phone', e.target.value)}
              onBlur={() => handleContactBlur('phone')}
              disabled={isSubmitting}
              className={cn('pl-12 h-14 text-base', errors.phone && touched.phone && 'border-red-500')}
            />
          </div>
          {errors.phone && touched.phone && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-2"><AlertCircle className="w-4 h-4" />{errors.phone}</p>
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
              value={contactData.email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleContactChange('email', e.target.value)}
              onBlur={() => handleContactBlur('email')}
              disabled={isSubmitting}
              className={cn('pl-12 h-14 text-base', errors.email && touched.email && 'border-red-500')}
            />
          </div>
          {errors.email && touched.email && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-2"><AlertCircle className="w-4 h-4" />{errors.email}</p>
          )}
          <p className="mt-2 text-xs text-slate-500">Vé điện tử sẽ được gửi đến email này</p>
        </div>
      </div>

      {/* Passenger Info Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <User className="w-5 h-5 text-blue-500" />
          Thông tin hành khách ({passengers.length} người)
        </h3>
        <p className="text-sm text-slate-500">
          Vui lòng nhập thông tin cho mỗi hành khách. Họ tên phải khớp với giấy tờ tùy thân.
        </p>

        {passengers.map((passenger, index) => (
          <div key={passenger.seatNumber} className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Armchair className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-bold text-slate-900">
                Hành khách {index + 1} — Ghế {passenger.seatNumber}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Last Name (Họ) */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Họ <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="Nguyễn"
                  value={passenger.lastName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePassengerChange(index, 'lastName', e.target.value)}
                  onBlur={() => handlePassengerBlur(index, 'lastName')}
                  disabled={isSubmitting}
                  className={cn('h-12', errors[`passenger_${index}_lastName`] && touched[`passenger_${index}_lastName`] && 'border-red-500')}
                />
                {errors[`passenger_${index}_lastName`] && touched[`passenger_${index}_lastName`] && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors[`passenger_${index}_lastName`]}</p>
                )}
              </div>

              {/* First Name (Tên) */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Tên <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="Văn A"
                  value={passenger.firstName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePassengerChange(index, 'firstName', e.target.value)}
                  onBlur={() => handlePassengerBlur(index, 'firstName')}
                  disabled={isSubmitting}
                  className={cn('h-12', errors[`passenger_${index}_firstName`] && touched[`passenger_${index}_firstName`] && 'border-red-500')}
                />
                {errors[`passenger_${index}_firstName`] && touched[`passenger_${index}_firstName`] && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors[`passenger_${index}_firstName`]}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* ID Number */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  CMND/CCCD
                  <span className="text-slate-400 font-normal ml-1">(tùy chọn)</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <IdCard className="w-4 h-4" />
                  </div>
                  <Input
                    type="text"
                    placeholder="079123456789"
                    value={passenger.idNumber || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePassengerChange(index, 'idNumber', e.target.value)}
                    disabled={isSubmitting}
                    className="pl-10 h-12"
                  />
                </div>
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Ngày sinh
                  <span className="text-slate-400 font-normal ml-1">(tùy chọn)</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <Input
                    type="date"
                    value={passenger.dateOfBirth || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePassengerChange(index, 'dateOfBirth', e.target.value)}
                    disabled={isSubmitting}
                    className="pl-10 h-12"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Terms & Conditions */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={contactData.acceptTerms}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleContactChange('acceptTerms', e.target.checked)}
            onBlur={() => handleContactBlur('acceptTerms')}
            disabled={isSubmitting}
            className={cn(
              'mt-1 w-5 h-5 rounded border-2 text-blue-600 focus:ring-blue-500',
              errors.acceptTerms && touched.acceptTerms && 'border-red-500'
            )}
          />
          <div className="flex-1">
            <p className="text-sm text-slate-700 leading-relaxed">
              Tôi đã đọc và đồng ý với{' '}
              <a href="/terms" target="_blank" className="text-blue-600 font-semibold hover:underline">điều khoản sử dụng</a>
              {' '}và{' '}
              <a href="/privacy" target="_blank" className="text-blue-600 font-semibold hover:underline">chính sách bảo mật</a>
              {' '}của VeXeViet
            </p>
          </div>
        </label>
        {errors.acceptTerms && touched.acceptTerms && (
          <p className="mt-2 text-sm text-red-600 flex items-center gap-2"><AlertCircle className="w-4 h-4" />{errors.acceptTerms}</p>
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
