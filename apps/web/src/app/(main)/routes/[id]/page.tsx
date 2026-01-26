'use client';

import { notFound } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Users, ShieldCheck, XCircle, Clock } from 'lucide-react';
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
            amenities: (data.amenities || []).map((a: any, i: number) => {
              // Handle both string and object formats from API
              if (typeof a === 'string') {
                return { id: String(i), name: a, icon: 'Check' };
              }
              // If it's an object with name property
              if (a && typeof a === 'object' && a.name) {
                return { id: a.id || String(i), name: String(a.name), icon: a.icon || 'Check' };
              }
              // Fallback
              return { id: String(i), name: String(a), icon: 'Check' };
            }),
            pickupPoints: (data.pickupPoints || []).map((p: any, i: number) => ({ id: String(i), time: p.time, location: p.location, address: p.address })),
            dropoffPoints: (data.dropoffPoints || []).map((p: any, i: number) => ({ id: String(i), time: p.time, location: p.location, address: p.address })),
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 min-w-0">
            <RouteDetailHeader route={route} />
            <RouteDetailTabs route={route} />
          </div>

          {/* Booking Sidebar - Enhanced */}
          <div className="lg:w-96 shrink-0">
            <div className="sticky top-24 space-y-4">
              {/* Main Booking Card */}
              <div className="bg-white rounded-2xl shadow-xl border-2 border-blue-100 overflow-hidden">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-6 text-white">
                  <p className="text-blue-100 text-sm font-medium mb-2">Giá vé mỗi người</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      }).format(route.price)}
                    </span>
                  </div>
                  <p className="text-blue-100 text-xs mt-2">💡 Giá đã bao gồm thuế VAT</p>
                </div>

                <div className="p-6 space-y-5">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-medium">Ghế còn lại</p>
                        <p className="text-2xl font-bold text-blue-900">{route.availableSeats}</p>
                      </div>
                    </div>
                    {route.availableSeats < 10 && (
                      <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full animate-pulse">
                        Sắp hết!
                      </span>
                    )}
                  </div>

                  <button
                    onClick={handleSelectSeats}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
                  >
                    Chọn ghế ngay
                  </button>

                  <div className="space-y-3 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <ShieldCheck className="w-5 h-5 text-green-600" />
                      <span>Xác nhận ngay lập tức</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <XCircle className="w-5 h-5 text-green-600" />
                      <span>Không phí đặt vé</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Clock className="w-5 h-5 text-green-600" />
                      <span>Hỗ trợ 24/7</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trust Badge */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-green-900">Đặt vé an toàn</p>
                    <p className="text-xs text-green-700">100% bảo mật thanh toán</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Bar - Enhanced */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-blue-100 p-4 lg:hidden z-50 shadow-2xl">
        <div className="flex items-center justify-between gap-4 max-w-md mx-auto">
          <div className="flex-1">
            <p className="text-xs text-gray-500 font-medium">Giá vé</p>
            <p className="text-2xl font-bold text-blue-600">
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
                notation: 'compact',
              }).format(route.price)}
            </p>
          </div>
          <button
            onClick={handleSelectSeats}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3.5 px-6 rounded-xl font-bold shadow-lg transform active:scale-95 transition-all"
          >
            Chọn ghế
          </button>
        </div>
      </div>
    </div>
  );
}
