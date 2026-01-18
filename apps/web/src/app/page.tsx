'use client';

import { Button, Card } from '@vexeviet/ui';
import { SearchForm, type SearchFormValues } from '@/components/features/search/SearchForm';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  const handleSearch = (values: SearchFormValues) => {
    const params = new URLSearchParams();
    params.set('origin', values.origin);
    params.set('destination', values.destination);
    const dateStr = values.departureDate.toISOString().split('T')[0];
    if (dateStr) params.set('departureDate', dateStr);
    params.set('passengers', values.passengers.toString());

    if (values.returnDate) {
      const returnDateStr = values.returnDate.toISOString().split('T')[0];
      if (returnDateStr) params.set('returnDate', returnDateStr);
    }

    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 text-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              VeXeViet - Book Bus Tickets in Vietnam
            </h1>
            <p className="text-lg md:text-xl text-blue-100 mb-8">
              Safe, convenient, and affordable bus travel across Vietnam
            </p>
          </div>
        </div>
      </section>

      {/* Search Widget */}
      <section className="container mx-auto px-4 -mt-12 md:-mt-16 mb-16 relative z-10">
        <Card className="p-6 md:p-8 shadow-2xl bg-white border-none">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Find Your Journey
          </h2>
          <SearchForm onSubmit={handleSearch} />
        </Card>
      </section>

      {/* Popular Routes Section */}
      <section className="container mx-auto px-4 pb-16">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
          Popular Routes
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {popularRoutes.map((route) => (
            <Card key={route.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex flex-col space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-gray-900">{route.from}</span>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  <span className="text-lg font-semibold text-gray-900">{route.to}</span>
                </div>
                <div className="text-sm text-gray-600">
                  {route.operators} operators
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-sm text-gray-500">From</span>
                  <span className="text-xl font-bold text-blue-600">{route.price}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

// Mock data for popular routes
const popularRoutes = [
  { id: 1, from: 'Ho Chi Minh', to: 'Da Lat', operators: 25, price: '150,000₫' },
  { id: 2, from: 'Hanoi', to: 'Ha Long', operators: 18, price: '120,000₫' },
  { id: 3, from: 'Ho Chi Minh', to: 'Nha Trang', operators: 30, price: '200,000₫' },
  { id: 4, from: 'Da Nang', to: 'Hoi An', operators: 15, price: '80,000₫' },
  { id: 5, from: 'Ho Chi Minh', to: 'Vung Tau', operators: 22, price: '100,000₫' },
  { id: 6, from: 'Hanoi', to: 'Sapa', operators: 12, price: '180,000₫' },
  { id: 7, from: 'Ho Chi Minh', to: 'Can Tho', operators: 20, price: '130,000₫' },
  { id: 8, from: 'Hue', to: 'Da Nang', operators: 10, price: '90,000₫' },
];
