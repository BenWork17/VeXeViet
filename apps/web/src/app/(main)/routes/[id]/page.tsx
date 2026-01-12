import { notFound } from 'next/navigation';
import { getRouteDetailById } from '@/lib/api/mock/routes';
import { RouteDetailHeader, RouteJourneyTimeline, RouteDetailTabs } from '@/components/features/route-detail/RouteDetailComponents';
import Link from 'next/link';

export default async function RouteDetailPage({ params }: { params: { id: string } }) {
  const route = await getRouteDetailById(params.id);

  if (!route) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 min-w-0">
          <RouteDetailHeader route={route} />
          <RouteJourneyTimeline route={route} />
          <RouteDetailTabs route={route} />
        </div>

        {/* Booking Sidebar */}
        <div className="lg:w-80 flex-shrink-0">
          <div className="bg-white p-6 rounded-lg shadow-sm border sticky top-24">
            <p className="text-gray-500 text-sm mb-1">Price per person</p>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-3xl font-bold text-blue-600">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(route.price)}
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Available seats</span>
                <span className="font-semibold">{route.availableSeats} seats</span>
              </div>
              
              <Link
                href={`/booking/${route.id}`}
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-3 rounded-lg font-bold transition-colors"
              >
                Select Seats
              </Link>
              
              <p className="text-xs text-center text-gray-400">
                Instant confirmation • No booking fees
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 lg:hidden z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between gap-4 max-w-md mx-auto">
          <div>
            <p className="text-xs text-gray-500">From</p>
            <p className="text-xl font-bold text-blue-600">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(route.price)}
            </p>
          </div>
          <Link
            href={`/booking/${route.id}`}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-3 rounded-lg font-bold transition-colors"
          >
            Select Seats
          </Link>
        </div>
      </div>
    </div>
  );
}
