'use client';

import { notFound } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getRouteById } from '@/lib/api/routes';
import { RouteDetailHeader, RouteJourneyTimeline, RouteDetailTabs } from '@/components/features/route-detail/RouteDetailComponents';
import { useAppDispatch, useAppSelector } from '@/lib/hooks/redux';
import { initBooking } from '@/store/slices/bookingSlice';
import type { Route } from '@/types/models';

export default function RouteDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [route, setRoute] = useState<Route | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRoute() {
      try {
        setLoading(true);
        setError(null);
        const data = await getRouteById(params.id);
        if (data) {
          const durationStr = typeof data.duration === 'number' 
            ? `${Math.floor(data.duration / 60)}h ${data.duration % 60}m`
            : String(data.duration || '');
          
          const priceNum = typeof data.price === 'string' ? parseFloat(data.price) : (data.price || 0);
          
          setRoute({
            id: data.id,
            operator: data.operator 
              ? { 
                  id: data.operator.id || '', 
                  name: data.operator.name || `${data.operator.firstName || ''} ${data.operator.lastName || ''}`.trim() || 'Unknown',
                  logoUrl: data.operator.logo || '',
                  rating: data.operator.rating || 0,
                  totalReviews: data.operator.totalTrips || 0
                }
              : { id: '', name: 'Unknown', logoUrl: '', rating: 0, totalReviews: 0 },
            busType: data.busType || 'STANDARD',
            licensePlate: data.licensePlate || '',
            departureTime: data.departureTime,
            arrivalTime: data.arrivalTime,
            departureLocation: data.departureLocation || data.origin || '',
            arrivalLocation: data.arrivalLocation || data.destination || '',
            duration: durationStr,
            price: priceNum,
            availableSeats: data.availableSeats || 0,
            amenities: (data.amenities || []).map((a, i) => ({ id: String(i), name: String(a), icon: 'Check' })),
            pickupPoints: (data.pickupPoints || []).map((p, i) => ({ id: String(i), time: p.time, location: p.location, address: p.address })),
            dropoffPoints: (data.dropoffPoints || []).map((p, i) => ({ id: String(i), time: p.time, location: p.location, address: p.address })),
            policies: [],
            images: data.images || [],
          });
        } else {
          setRoute(null);
        }
      } catch (err) {
        console.error('Failed to fetch route:', err);
        setError('Không thể tải thông tin chuyến xe');
        setRoute(null);
      } finally {
        setLoading(false);
      }
    }
    fetchRoute();
  }, [params.id]);

  if (loading) return <div className="container mx-auto px-4 py-8">Đang tải thông tin chuyến xe...</div>;
  if (error) return <div className="container mx-auto px-4 py-8 text-red-500">{error}</div>;
  if (!route) notFound();

  const handleSelectSeats = () => {
    // TODO: Re-enable login requirement after testing
    // if (!user) {
    //   router.push(`/login?redirect=/routes/${route.id}`);
    //   return;
    // }
    // Adapt FE Route to booking slice format
    dispatch(initBooking({
      id: route.id,
      price: route.price,
      busType: route.busType,
      from: route.departureLocation,
      to: route.arrivalLocation,
      departureTime: route.departureTime,
    }));
    router.push(`/booking/${route.id}`);
  };

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
              
              <button
                onClick={handleSelectSeats}
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-3 rounded-lg font-bold transition-colors"
              >
                Select Seats
              </button>
              
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
          <button
            onClick={handleSelectSeats}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-3 rounded-lg font-bold transition-colors"
          >
            Select Seats
          </button>
        </div>
      </div>
    </div>
  );
}
