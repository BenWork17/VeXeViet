'use client';

import { notFound } from 'next/navigation';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Users, ShieldCheck, XCircle, Clock, Info, CircleAlert } from 'lucide-react';
import { getRouteById } from '@/lib/api/routes';
import { parseApiError } from '@/lib/api/client';
import { resolveMediaUrl, resolveMediaUrls } from '@/lib/api/media';
import { RouteDetailHeader, RouteDetailTabs } from '@/components/features/route-detail/RouteDetailComponents';
import { useAppDispatch } from '@/lib/hooks/redux';
import { initBooking } from '@/store/slices/bookingSlice';
import { cn } from '@/lib/utils';
import type { Route } from '@/types/models';
import { FadeIn } from '@/components/motion';

export default function RouteDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [route, setRoute] = useState<Route | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorRequestId, setErrorRequestId] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    async function fetchRoute() {
      try {
        setLoading(true);
        setError(null);
        setErrorRequestId(null);
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
                  id: data.operator.id || data.operatorId || '',
                  name: data.operator.name || `${data.operator.firstName || ''} ${data.operator.lastName || ''}`.trim() || 'Unknown',
                  logoUrl: resolveMediaUrl(data.operator.operatorAvatarUrl ?? data.operator.logo) || '',
                  interiorImages: resolveMediaUrls(data.operator.interiorImages),
                  exteriorImages: resolveMediaUrls(data.operator.exteriorImages),
                  rating: data.operator.rating ?? 0,
                  totalReviews: data.operator.reviewCount ?? data.operator.totalTrips ?? 0,
                }
              : { id: data.operatorId || '', name: 'Unknown', logoUrl: '', rating: 0, totalReviews: 0 },
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
        const parsed = parseApiError(err);
        console.error('Failed to fetch route:', err);
        setError(parsed.message || 'Không thể tải thông tin chuyến xe');
        setErrorRequestId(parsed.requestId || null);
        setRoute(null);
      } finally {
        setLoading(false);
      }
    }
    fetchRoute();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-7xl px-4 py-8">
          <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
            <span
              className="h-6 w-6 rounded-full border-2 border-border border-t-primary motion-safe:animate-spin"
              aria-hidden="true"
            />
            <p className="text-sm text-muted-foreground">Đang tải thông tin chuyến xe...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-7xl px-4 py-8">
          <div className="rounded-md border border-border bg-card p-6 shadow-hn-sm">
            <p className="flex items-center gap-2 text-sm font-semibold text-error-ink">
              <CircleAlert className="h-4 w-4 shrink-0" aria-hidden="true" />
              {error}
            </p>
            {errorRequestId && (
              <p className="mt-2 font-mono text-xs text-muted-foreground">
                Mã tham chiếu lỗi: {errorRequestId}
              </p>
            )}
            <Link
              href="/search"
              className="mt-4 inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition-colors duration-150 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 motion-reduce:transition-none"
            >
              Quay lại tìm kiếm
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!route) notFound();

  const handleSelectSeats = () => {
    if (isNavigating || isSoldOut) return;
    setIsNavigating(true);
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
      operatorId: route.operator.id,
      operatorName: route.operator.name,
      operatorRating: route.operator.rating,
      operatorReviewCount: route.operator.totalReviews,
      pickupPoints: route.pickupPoints,
      dropoffPoints: route.dropoffPoints,
    }));
    router.push(`/booking/${route.id}`);
  };

  const isSoldOut = route.availableSeats === 0;
  const isLowSeats = route.availableSeats > 0 && route.availableSeats < 10;
  const seatChipClass = isSoldOut
    ? 'bg-error-soft text-error-ink'
    : isLowSeats
      ? 'bg-warning-soft text-warning-ink'
      : 'bg-success-soft text-success-ink';
  const seatChipLabel = isSoldOut ? 'Hết vé' : isLowSeats ? 'Sắp hết!' : 'Còn chỗ';

  return (
    <div className="min-h-screen bg-background">
      <FadeIn>
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="min-w-0 flex-1">
            <RouteDetailHeader route={route} />
            <RouteDetailTabs route={route} />
          </div>

          {/* Booking Sidebar */}
          <aside className="shrink-0 lg:w-96">
            <div className="sticky top-24 space-y-4">
              {/* Main Booking Card */}
              <div className="overflow-hidden rounded-md border border-border bg-card shadow-hn">
                <div className="border-b border-border px-6 pb-5 pt-6">
                  <p className="text-sm font-medium text-muted-foreground">Giá vé mỗi người</p>
                  <p className="mt-1 font-mono text-4xl font-semibold tracking-tight text-foreground">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(route.price)}
                  </p>
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Info className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    Giá đã bao gồm thuế VAT
                  </p>
                </div>

                <div className="space-y-5 p-6">
                  <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-muted p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent text-accent-foreground">
                        <Users className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Ghế còn lại</p>
                        <p className="font-mono text-2xl font-semibold text-foreground">{route.availableSeats}</p>
                      </div>
                    </div>
                    <span className={cn('rounded-sm px-3.5 py-1.5 text-xs font-semibold', seatChipClass)}>
                      {seatChipLabel}
                    </span>
                  </div>

                  <button
                    onClick={handleSelectSeats}
                    disabled={isNavigating || isSoldOut}
                    className={cn(
                      "w-full rounded-md bg-primary px-5 py-3 text-base font-semibold text-primary-foreground shadow-hn-sm transition-colors duration-150 motion-reduce:transition-none",
                      isNavigating || isSoldOut
                        ? "cursor-not-allowed opacity-50"
                        : "hover:bg-primary-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                    )}
                  >
                    {isSoldOut ? (
                      'Hết vé'
                    ) : isNavigating ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="h-5 w-5 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground motion-safe:animate-spin" />
                        Đang chuyển...
                      </span>
                    ) : (
                      'Chọn ghế ngay'
                    )}
                  </button>

                  <div className="space-y-3 border-t border-border pt-4">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <ShieldCheck className="h-5 w-5 shrink-0 text-success-ink" aria-hidden="true" />
                      <span>Xác nhận ngay lập tức</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <XCircle className="h-5 w-5 shrink-0 text-success-ink" aria-hidden="true" />
                      <span>Không phí đặt vé</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Clock className="h-5 w-5 shrink-0 text-success-ink" aria-hidden="true" />
                      <span>Hỗ trợ 24/7</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trust Badge */}
              <div className="rounded-md border border-border bg-accent p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <ShieldCheck className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Đặt vé an toàn</p>
                    <p className="text-xs text-muted-foreground">100% bảo mật thanh toán</p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
      </FadeIn>

      {/* Mobile Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card p-4 shadow-hn-md lg:hidden">
        <div className="mx-auto flex max-w-md items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-xs font-medium text-muted-foreground">Giá vé</p>
            <p className="font-mono text-2xl font-semibold text-foreground">
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
                notation: 'compact',
              }).format(route.price)}
            </p>
          </div>
          <button
            onClick={handleSelectSeats}
            disabled={isNavigating || isSoldOut}
            className={cn(
              "flex-1 rounded-md bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-hn-sm transition-colors duration-150 motion-reduce:transition-none",
              isNavigating || isSoldOut
                ? "cursor-not-allowed opacity-50"
                : "hover:bg-primary-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            )}
          >
            {isSoldOut ? (
              'Hết vé'
            ) : isNavigating ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground motion-safe:animate-spin" />
                Đang chuyển...
              </span>
            ) : (
              'Chọn ghế'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
