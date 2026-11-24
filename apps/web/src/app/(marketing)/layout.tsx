import { Header } from '@/layouts/Header/Header';
import { Footer } from '@/layouts/Footer/Footer';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
