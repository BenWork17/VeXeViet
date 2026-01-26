export const metadata = {
  title: 'Đặt vé - VeXeViet',
};

export default function BookingLayout({ children }: { children: React.ReactNode }) {
  // Booking flow - no header/footer, clean layout
  return (
    <div className="min-h-screen bg-slate-50">
      {children}
    </div>
  );
}
