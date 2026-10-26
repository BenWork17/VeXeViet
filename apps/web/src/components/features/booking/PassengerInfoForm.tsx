'use client';

import { useState } from 'react';
import { useAppSelector } from '@/lib/hooks/redux';
import { cn } from '@/lib/utils';
import { Input } from '@vexeviet/ui';
import { AlertCircle } from 'lucide-react';

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
  className,
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

  const fullNameError = errors.fullName && touched.fullName ? errors.fullName : '';
  const phoneError = errors.phone && touched.phone ? errors.phone : '';
  const emailError = errors.email && touched.email ? errors.email : '';
  const termsError = errors.acceptTerms && touched.acceptTerms ? errors.acceptTerms : '';

  return (
    <form onSubmit={handleSubmit} className={cn('booking-form', className)} noValidate>
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
            placeholder="Nguyễn Văn A"
            value={contactData.fullName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleContactChange('fullName', e.target.value)}
            onBlur={() => handleContactBlur('fullName')}
            disabled={isSubmitting}
            aria-invalid={Boolean(fullNameError)}
            aria-describedby={fullNameError ? 'contact-full-name-error' : undefined}
            className={cn('booking-input', fullNameError && 'booking-input--invalid')}
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
            placeholder="0912345678"
            value={contactData.phone}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleContactChange('phone', e.target.value)}
            onBlur={() => handleContactBlur('phone')}
            disabled={isSubmitting}
            aria-invalid={Boolean(phoneError)}
            aria-describedby={phoneError ? 'contact-phone-error' : undefined}
            className={cn('booking-input', phoneError && 'booking-input--invalid')}
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
            placeholder="example@email.com"
            value={contactData.email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleContactChange('email', e.target.value)}
            onBlur={() => handleContactBlur('email')}
            disabled={isSubmitting}
            aria-invalid={Boolean(emailError)}
            aria-describedby={
              emailError ? 'contact-email-error contact-email-hint' : 'contact-email-hint'
            }
            className={cn('booking-input', emailError && 'booking-input--invalid')}
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
            Thông tin hành khách ({passengers.length} người)
          </h3>
          <p className="booking-section-hint">
            Vui lòng nhập thông tin cho mỗi hành khách. Họ tên phải khớp với giấy tờ tùy thân.
          </p>
        </div>

        {passengers.map((passenger, index) => {
          const lastNameId = `passenger-${index}-last-name`;
          const firstNameId = `passenger-${index}-first-name`;
          const idNumberId = `passenger-${index}-id-number`;
          const dateOfBirthId = `passenger-${index}-date-of-birth`;
          const lastNameError =
            errors[`passenger_${index}_lastName`] && touched[`passenger_${index}_lastName`]
              ? errors[`passenger_${index}_lastName`]
              : '';
          const firstNameError =
            errors[`passenger_${index}_firstName`] && touched[`passenger_${index}_firstName`]
              ? errors[`passenger_${index}_firstName`]
              : '';

          return (
            <div key={passenger.seatNumber} className="booking-passenger-card">
              <h4 className="booking-passenger-head">
                Hành khách {index + 1}
                <span className="booking-passenger-seat">Ghế {passenger.seatNumber}</span>
              </h4>

              <div className="booking-form-section">
                <div className="booking-field">
                  <label htmlFor={lastNameId} className="booking-field-label">
                    Họ <span aria-hidden="true">*</span>
                  </label>
                  <Input
                    id={lastNameId}
                    type="text"
                    placeholder="Nguyễn"
                    value={passenger.lastName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePassengerChange(index, 'lastName', e.target.value)}
                    onBlur={() => handlePassengerBlur(index, 'lastName')}
                    disabled={isSubmitting}
                    aria-invalid={Boolean(lastNameError)}
                    aria-describedby={lastNameError ? `${lastNameId}-error` : undefined}
                    className={cn('booking-input', lastNameError && 'booking-input--invalid')}
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
                    placeholder="Văn A"
                    value={passenger.firstName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePassengerChange(index, 'firstName', e.target.value)}
                    onBlur={() => handlePassengerBlur(index, 'firstName')}
                    disabled={isSubmitting}
                    aria-invalid={Boolean(firstNameError)}
                    aria-describedby={firstNameError ? `${firstNameId}-error` : undefined}
                    className={cn('booking-input', firstNameError && 'booking-input--invalid')}
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
                    placeholder="079123456789"
                    value={passenger.idNumber || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePassengerChange(index, 'idNumber', e.target.value)}
                    disabled={isSubmitting}
                    className="booking-input"
                  />
                </div>

                <div className="booking-field">
                  <label htmlFor={dateOfBirthId} className="booking-field-label">
                    Ngày sinh <span>(tùy chọn)</span>
                  </label>
                  <Input
                    id={dateOfBirthId}
                    type="date"
                    value={passenger.dateOfBirth || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePassengerChange(index, 'dateOfBirth', e.target.value)}
                    disabled={isSubmitting}
                    className="booking-input"
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
            checked={contactData.acceptTerms}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleContactChange('acceptTerms', e.target.checked)}
            onBlur={() => handleContactBlur('acceptTerms')}
            disabled={isSubmitting}
            aria-invalid={Boolean(termsError)}
            aria-describedby={termsError ? 'accept-terms-error' : undefined}
          />
          <p>
            Tôi đã đọc và đồng ý với{' '}
            <a href="/terms" target="_blank" rel="noreferrer">điều khoản sử dụng</a>
            {' '}và{' '}
            <a href="/privacy" target="_blank" rel="noreferrer">chính sách bảo mật</a>
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
          <span className="booking-form-progress">Đang lưu thông tin…</span>
        ) : (
          <span className="booking-form-submit">Tiếp tục thanh toán</span>
        )}
      </button>
    </form>
  );
}

export default PassengerInfoForm;
