import { BookingSteps } from '@/components/features/booking/BookingSteps';

export const metadata = {
  title: 'Đặt vé - VeXeViet',
};

export default function BookingLayout({ children }: { children: React.ReactNode }) {
  // Booking flow - no header/footer, clean layout with step indicator
  return (
    <div className="min-h-screen bg-slate-50">
      <BookingSteps />
      <div className="pt-4">
        {children}
      </div>
    </div>
  );
}
