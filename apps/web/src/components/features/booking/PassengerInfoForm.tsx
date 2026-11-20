'use client';

import { useEffect, useMemo } from 'react';
import { useForm, useFieldArray, type FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAppSelector } from '@/lib/hooks/redux';
import { cn } from '@/lib/utils';
import { Input } from '@vexeviet/ui';
import { AlertCircle, Loader2 } from 'lucide-react';

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

const passengerItemSchema = z.object({
  firstName: z.string().trim().min(1, 'Vui lòng nhập tên'),
  lastName: z.string().trim().min(1, 'Vui lòng nhập họ'),
  seatNumber: z.string().min(1),
  idNumber: z
    .string()
    .trim()
    .optional()
    .refine(
      (val) => !val || /^[0-9]{9,12}$/.test(val),
      'CMND/CCCD phải gồm 9–12 chữ số'
    ),
  dateOfBirth: z.string().optional(),
});

const passengerInfoSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Vui lòng nhập họ tên (tối thiểu 2 ký tự)')
    .regex(/^[a-zA-ZÀ-ỹ\s]+$/, 'Họ tên chỉ được chứa chữ cái và khoảng trắng'),
  phone: z
    .string()
    .trim()
    .refine(
      (val) => /^(0|\+84)[0-9]{9,10}$/.test(val.replace(/\s/g, '')),
      'Số điện thoại không hợp lệ (10–11 số, bắt đầu bằng 0 hoặc +84)'
    ),
  email: z.string().trim().email('Email không hợp lệ'),
  passengers: z.array(passengerItemSchema).min(1),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'Bạn cần đồng ý với điều khoản để tiếp tục',
  }),
});

type PassengerInfoFormValues = z.infer<typeof passengerInfoSchema>;

function getFirstErrorElementId(errors: FieldErrors<PassengerInfoFormValues>): string | null {
  if (errors.fullName) return 'contact-full-name';
  if (errors.phone) return 'contact-phone';
  if (errors.email) return 'contact-email';
  if (Array.isArray(errors.passengers)) {
    for (let i = 0; i < errors.passengers.length; i += 1) {
      const pErr = errors.passengers[i];
      if (!pErr) continue;
      if (pErr.lastName) return `passenger-${i}-last-name`;
      if (pErr.firstName) return `passenger-${i}-first-name`;
      if (pErr.idNumber) return `passenger-${i}-id-number`;
      if (pErr.dateOfBirth) return `passenger-${i}-date-of-birth`;
    }
  }
  if (errors.acceptTerms) return 'accept-terms';
  return null;
}

export function PassengerInfoForm({
  initialData,
  onSubmit,
  isSubmitting = false,
  className,
}: PassengerInfoFormProps) {
  const booking = useAppSelector((state) => state.booking);
  const seatLabels = booking.heldSeats.length > 0 ? booking.heldSeats : booking.selectedSeats;
  const todayIso = useMemo(() => new Date().toISOString().split('T')[0], []);

  const defaultValues = useMemo<PassengerInfoFormValues>(() => {
    const nameParts = (initialData?.fullName || '').trim().split(/\s+/).filter(Boolean);
    const initLastName = nameParts[0] || '';
    const initFirstName = nameParts.slice(1).join(' ') || '';

    return {
      fullName: initialData?.fullName || '',
      phone: initialData?.phone || '',
      email: initialData?.email || '',
      acceptTerms: Boolean(initialData?.acceptTerms),
      passengers: seatLabels.map((seat, index) => {
        const saved =
          initialData?.passengers?.find((p) => p.seatNumber === seat) ||
          initialData?.passengers?.[index];
        if (saved) {
          return {
            firstName: saved.firstName || '',
            lastName: saved.lastName || '',
            seatNumber: seat,
            idNumber: saved.idNumber || '',
            dateOfBirth: saved.dateOfBirth || '',
          };
        }
        return {
          firstName: index === 0 ? initFirstName : '',
          lastName: index === 0 ? initLastName : '',
          seatNumber: seat,
          idNumber: '',
          dateOfBirth: '',
        };
      }),
    };
  }, [initialData, seatLabels]);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PassengerInfoFormValues>({
    resolver: zodResolver(passengerInfoSchema),
    defaultValues,
    mode: 'onBlur',
    reValidateMode: 'onChange',
    shouldFocusError: true,
  });

  const { fields } = useFieldArray({
    control,
    name: 'passengers',
  });

  // Sync if seatLabels or initialData hydrates asynchronously after mount
  useEffect(() => {
    if (fields.length === 0 && seatLabels.length > 0) {
      reset(defaultValues);
    }
  }, [fields.length, seatLabels.length, defaultValues, reset]);

  const handleValidSubmit = (data: PassengerInfoFormValues) => {
    onSubmit({
      fullName: data.fullName,
      phone: data.phone,
      email: data.email,
      passengers: data.passengers.map((p) => ({
        firstName: p.firstName,
        lastName: p.lastName,
        seatNumber: p.seatNumber,
        idNumber: p.idNumber || undefined,
        dateOfBirth: p.dateOfBirth || undefined,
      })),
      acceptTerms: data.acceptTerms,
    });
  };

  const handleInvalidSubmit = (formErrors: FieldErrors<PassengerInfoFormValues>) => {
    const firstId = getFirstErrorElementId(formErrors);
    if (!firstId) return;
    const element = document.getElementById(firstId);
    if (!element) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    element.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'center',
    });
    element.focus({ preventScroll: true });
  };

  const fullNameError = errors.fullName?.message || '';
  const phoneError = errors.phone?.message || '';
  const emailError = errors.email?.message || '';
  const termsError = errors.acceptTerms?.message || '';

  return (
    <form
      onSubmit={handleSubmit(handleValidSubmit, handleInvalidSubmit)}
      className={cn('booking-form', className)}
      noValidate
    >
      <section className="booking-form-section" aria-labelledby="contact-info-title">
        <div>
          <h3 id="contact-info-title" className="booking-section-title">
            Thông tin liên hệ
          </h3>
        </div>

        <div className="booking-field">
          <label htmlFor="contact-full-name" className="booking-field-label">
            Họ và tên <span aria-hidden="true">*</span>
          </label>
          <Input
            id="contact-full-name"
            type="text"
            autoComplete="name"
            placeholder="Nguyễn Văn A"
            disabled={isSubmitting}
            aria-invalid={Boolean(fullNameError)}
            aria-describedby={fullNameError ? 'contact-full-name-error' : undefined}
            className={cn('booking-input', fullNameError && 'booking-input--invalid')}
            {...register('fullName')}
          />
          {fullNameError ? (
            <p id="contact-full-name-error" className="booking-field-error">
              <AlertCircle size={14} aria-hidden="true" />
              {fullNameError}
            </p>
          ) : null}
        </div>

        <div className="booking-field">
          <label htmlFor="contact-phone" className="booking-field-label">
            Số điện thoại <span aria-hidden="true">*</span>
          </label>
          <Input
            id="contact-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="0912345678"
            disabled={isSubmitting}
            aria-invalid={Boolean(phoneError)}
            aria-describedby={phoneError ? 'contact-phone-error' : undefined}
            className={cn('booking-input', phoneError && 'booking-input--invalid')}
            {...register('phone')}
          />
          {phoneError ? (
            <p id="contact-phone-error" className="booking-field-error">
              <AlertCircle size={14} aria-hidden="true" />
              {phoneError}
            </p>
          ) : null}
        </div>

        <div className="booking-field">
          <label htmlFor="contact-email" className="booking-field-label">
            Email <span aria-hidden="true">*</span>
          </label>
          <Input
            id="contact-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="example@email.com"
            disabled={isSubmitting}
            aria-invalid={Boolean(emailError)}
            aria-describedby={
              emailError ? 'contact-email-error contact-email-hint' : 'contact-email-hint'
            }
            className={cn('booking-input', emailError && 'booking-input--invalid')}
            {...register('email')}
          />
          {emailError ? (
            <p id="contact-email-error" className="booking-field-error">
              <AlertCircle size={14} aria-hidden="true" />
              {emailError}
            </p>
          ) : null}
          <p id="contact-email-hint" className="booking-field-hint">
            Vé điện tử sẽ được gửi đến email này.
          </p>
        </div>
      </section>

      <section className="booking-form-section" aria-labelledby="passenger-info-title">
        <div>
          <h3 id="passenger-info-title" className="booking-section-title">
            Thông tin hành khách ({fields.length} người)
          </h3>
          <p className="booking-section-hint">
            Vui lòng nhập thông tin cho mỗi hành khách. Họ tên phải khớp với giấy tờ tùy thân.
          </p>
        </div>

        {fields.map((passengerField, index) => {
          const lastNameId = `passenger-${index}-last-name`;
          const firstNameId = `passenger-${index}-first-name`;
          const idNumberId = `passenger-${index}-id-number`;
          const dateOfBirthId = `passenger-${index}-date-of-birth`;
          const passengerErrors = errors.passengers?.[index];
          const lastNameError = passengerErrors?.lastName?.message || '';
          const firstNameError = passengerErrors?.firstName?.message || '';
          const idNumberError = passengerErrors?.idNumber?.message || '';

          return (
            <div key={passengerField.id} className="booking-passenger-card">
              <h4 className="booking-passenger-head">
                Hành khách {index + 1}
                <span className="booking-passenger-seat">Ghế {passengerField.seatNumber}</span>
              </h4>

              <input type="hidden" {...register(`passengers.${index}.seatNumber`)} />

              <div className="booking-form-section">
                <div className="booking-field">
                  <label htmlFor={lastNameId} className="booking-field-label">
                    Họ <span aria-hidden="true">*</span>
                  </label>
                  <Input
                    id={lastNameId}
                    type="text"
                    autoComplete={index === 0 ? 'family-name' : 'off'}
                    placeholder="Nguyễn"
                    disabled={isSubmitting}
                    aria-invalid={Boolean(lastNameError)}
                    aria-describedby={lastNameError ? `${lastNameId}-error` : undefined}
                    className={cn('booking-input', lastNameError && 'booking-input--invalid')}
                    {...register(`passengers.${index}.lastName`)}
                  />
                  {lastNameError ? (
                    <p id={`${lastNameId}-error`} className="booking-field-error">
                      <AlertCircle size={14} aria-hidden="true" />
                      {lastNameError}
                    </p>
                  ) : null}
                </div>

                <div className="booking-field">
                  <label htmlFor={firstNameId} className="booking-field-label">
                    Tên <span aria-hidden="true">*</span>
                  </label>
                  <Input
                    id={firstNameId}
                    type="text"
                    autoComplete={index === 0 ? 'given-name' : 'off'}
                    placeholder="Văn A"
                    disabled={isSubmitting}
                    aria-invalid={Boolean(firstNameError)}
                    aria-describedby={firstNameError ? `${firstNameId}-error` : undefined}
                    className={cn('booking-input', firstNameError && 'booking-input--invalid')}
                    {...register(`passengers.${index}.firstName`)}
                  />
                  {firstNameError ? (
                    <p id={`${firstNameId}-error`} className="booking-field-error">
                      <AlertCircle size={14} aria-hidden="true" />
                      {firstNameError}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="booking-form-section">
                <div className="booking-field">
                  <label htmlFor={idNumberId} className="booking-field-label">
                    CMND/CCCD <span>(tùy chọn)</span>
                  </label>
                  <Input
                    id={idNumberId}
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="079123456789"
                    disabled={isSubmitting}
                    aria-invalid={Boolean(idNumberError)}
                    aria-describedby={idNumberError ? `${idNumberId}-error` : undefined}
                    className={cn('booking-input', idNumberError && 'booking-input--invalid')}
                    {...register(`passengers.${index}.idNumber`)}
                  />
                  {idNumberError ? (
                    <p id={`${idNumberId}-error`} className="booking-field-error">
                      <AlertCircle size={14} aria-hidden="true" />
                      {idNumberError}
                    </p>
                  ) : null}
                </div>

                <div className="booking-field">
                  <label htmlFor={dateOfBirthId} className="booking-field-label">
                    Ngày sinh <span>(tùy chọn)</span>
                  </label>
                  <Input
                    id={dateOfBirthId}
                    type="date"
                    max={todayIso}
                    disabled={isSubmitting}
                    className="booking-input"
                    {...register(`passengers.${index}.dateOfBirth`)}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <div className="booking-checkbox-row">
        <label>
          <input
            id="accept-terms"
            type="checkbox"
            disabled={isSubmitting}
            aria-invalid={Boolean(termsError)}
            aria-describedby={termsError ? 'accept-terms-error' : undefined}
            {...register('acceptTerms')}
          />
          <p>
            Tôi đã đọc và đồng ý với{' '}
            <span className="font-semibold text-primary">điều khoản sử dụng</span>
            {' '}và{' '}
            <span className="font-semibold text-primary">chính sách bảo mật</span>
            {' '}của VeXeViet
          </p>
        </label>
        {termsError ? (
          <p id="accept-terms-error" className="booking-field-error">
            <AlertCircle size={14} aria-hidden="true" />
            {termsError}
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        aria-busy={isSubmitting}
        className="booking-action"
      >
        {isSubmitting ? (
          <span className="booking-form-progress inline-flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
            Đang lưu thông tin…
          </span>
        ) : (
          <span className="booking-form-submit">Tiếp tục thanh toán</span>
        )}
      </button>
    </form>
  );
}

export default PassengerInfoForm;
