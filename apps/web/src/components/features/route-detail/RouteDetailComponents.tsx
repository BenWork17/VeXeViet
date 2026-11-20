import {
  ArrowLeft,
  Star,
  MapPin,
  ShieldCheck,
  Wifi,
  BatteryCharging,
  Wind,
  Coffee,
  XCircle,
  Navigation,
  Users,
  Package,
} from 'lucide-react'
import { Route } from '@/types/models'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { BusTypePreview } from '../booking/BusTypePreview'
import { OperatorGallery } from './OperatorGallery'

export function RouteDetailHeader({ route }: { route: Route }) {
  const depDate = new Date(route.departureTime)
  const arrDate = new Date(route.arrivalTime)

  return (
    <div className="space-y-6">
      {/* Navigation & Back Button */}
      <Link
        href="/search"
        className="group mb-2 flex w-fit items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors duration-150 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 motion-reduce:transition-none"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card shadow-hn-sm transition-colors duration-150 group-hover:bg-muted motion-reduce:transition-none">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </span>
        Quay lại tìm kiếm
      </Link>

      {/* Journey Card */}
      <section className="overflow-hidden rounded-lg border border-border bg-card shadow-hn">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div className="inline-flex items-center gap-2 rounded-sm bg-accent px-3.5 py-1.5 text-xs font-semibold text-accent-foreground">
            <Navigation className="h-3.5 w-3.5" aria-hidden="true" />
            {route.busType}
          </div>
          <div className="text-right">
            <p className="text-xs font-medium text-muted-foreground">Biển số xe</p>
            <p className="font-mono text-sm font-semibold text-foreground">{route.licensePlate || 'N/A'}</p>
          </div>
        </div>

        <div className="space-y-6 px-6 py-6">
          {/* From -> To */}
          <div className="grid grid-cols-1 items-start gap-6 sm:grid-cols-[1fr_auto_1fr]">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Điểm đi</p>
              <h2 className="font-display text-2xl text-foreground md:text-3xl">
                {route.departureLocation}
              </h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {format(depDate, 'HH:mm - EEEE, dd MMM yyyy', { locale: vi })}
              </p>
            </div>

            <div className="flex flex-col items-center justify-center gap-2 sm:px-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-muted">
                <span className="font-mono text-xs font-semibold text-foreground">{route.duration}</span>
              </div>
              <div className="h-px w-8 bg-border sm:h-8 sm:w-px" />
            </div>

            <div className="sm:text-right">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Điểm đến</p>
              <h2 className="font-display text-2xl text-foreground md:text-3xl">
                {route.arrivalLocation}
              </h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {format(arrDate, 'HH:mm - EEEE, dd MMM yyyy', { locale: vi })}
              </p>
            </div>
          </div>

          {/* Operator Info */}
          <div className="flex items-center gap-4 border-t border-border pt-6">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md border border-border bg-muted p-2">
              {route.operator.logoUrl ? (
                <img
                  src={route.operator.logoUrl}
                  alt={route.operator.name}
                  className="h-full w-full object-contain"
                />
              ) : (
                <span className="font-display text-lg text-primary">
                  {route.operator.name.substring(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">{route.operator.name}</h3>
              <div className="mt-1 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-sm bg-warning-soft px-2 py-0.5 text-xs font-semibold text-warning-ink">
                  <Star className="h-3 w-3 fill-current" aria-hidden="true" />
                  {route.operator.rating.toFixed(1)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {route.operator.totalReviews} chuyến đi
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export function RouteJourneyTimeline({ route }: { route: Route }) {
  return null // Removed - merged into header
}

const AmenityIcon = ({ name }: { name: string }) => {
  const lowerName = name.toLowerCase()
  if (lowerName.includes('wifi')) return <Wifi className="h-5 w-5" aria-hidden="true" />
  if (lowerName.includes('charging') || lowerName.includes('usb'))
    return <BatteryCharging className="h-5 w-5" aria-hidden="true" />
  if (lowerName.includes('ac') || lowerName.includes('air')) return <Wind className="h-5 w-5" aria-hidden="true" />
  if (lowerName.includes('water') || lowerName.includes('coffee'))
    return <Coffee className="h-5 w-5" aria-hidden="true" />
  return <ShieldCheck className="h-5 w-5" aria-hidden="true" />
}

function SectionCard({
  title,
  icon,
  children,
}: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-border bg-card shadow-hn">
      <div className="flex items-center gap-2 border-b border-border px-6 py-4">
        <span className="text-primary" aria-hidden="true">{icon}</span>
        <h3 className="font-display text-lg text-foreground">{title}</h3>
      </div>
      <div className="p-6">{children}</div>
    </section>
  )
}

function QuickStat({
  label,
  value,
  icon,
  tone,
}: {
  label: string
  value: string | number
  icon: React.ReactNode
  tone: 'primary' | 'success' | 'info' | 'warning'
}) {
  const toneClass = {
    primary: 'bg-accent text-accent-foreground',
    success: 'bg-success-soft text-success-ink',
    info: 'bg-info-soft text-info-ink',
    warning: 'bg-warning-soft text-warning-ink',
  }[tone]

  return (
    <div className="rounded-md border border-border bg-card p-5 shadow-hn-sm">
      <div className="flex items-center gap-3">
        <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-md', toneClass)}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-muted-foreground">{label}</p>
          <p className="font-mono text-2xl font-semibold text-foreground">{value}</p>
        </div>
      </div>
    </div>
  )
}

export function RouteDetailTabs({ route }: { route: Route }) {
  return (
    <div className="space-y-6">
      {/* Quick Stats Bar */}
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <QuickStat
          label="Ghế trống"
          value={route.availableSeats}
          icon={<Users className="h-6 w-6" />}
          tone="primary"
        />
        <QuickStat
          label="Tiện nghi"
          value={route.amenities.length}
          icon={<ShieldCheck className="h-6 w-6" />}
          tone="success"
        />
        <QuickStat
          label="Điểm đón"
          value={route.pickupPoints.length}
          icon={<MapPin className="h-6 w-6" />}
          tone="info"
        />
        <QuickStat
          label="Đánh giá"
          value={route.operator.rating.toFixed(1)}
          icon={<Star className="h-6 w-6" />}
          tone="warning"
        />
      </div>

      {/* Bus Type Preview Section */}
      <BusTypePreview
        busType={route.busType}
        totalSeats={route.availableSeats}
      />

      {/* Operator photos (interior / exterior) */}
      <SectionCard
        title="Hình ảnh xe của nhà xe"
        icon={<Package className="h-5 w-5" />}
      >
        <OperatorGallery
          operatorName={route.operator.name}
          interiorImages={route.operator.interiorImages}
          exteriorImages={route.operator.exteriorImages}
        />
      </SectionCard>

      {/* Amenities Section */}
      <SectionCard
        title="Tiện nghi trên xe"
        icon={<ShieldCheck className="h-5 w-5" />}
      >
        {route.amenities.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {route.amenities.map((amenity) => (
              <div
                key={amenity.id}
                className="flex items-center gap-3 rounded-md border border-border bg-background p-3 transition-colors duration-150 hover:bg-muted motion-reduce:transition-none"
              >
                <div className="rounded-sm bg-card p-2 text-primary shadow-hn-sm">
                  <AmenityIcon name={amenity.name} />
                </div>
                <span className="text-sm font-semibold text-foreground">{amenity.name}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-muted-foreground">Chưa có thông tin tiện nghi</p>
        )}
      </SectionCard>

      {/* Pickup & Dropoff Points */}
      <div className="grid gap-6 md:grid-cols-2">
        <SectionCard
          title="Điểm đón khách"
          icon={<MapPin className="h-5 w-5" />}
        >
          <div className="space-y-3">
            {route.pickupPoints.length > 0 ? (
              route.pickupPoints.map((point, idx) => (
                <div
                  key={point.id}
                  className="flex gap-4 rounded-md border border-border bg-background p-4 transition-colors duration-150 hover:bg-muted motion-reduce:transition-none"
                >
                  <div className="shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary font-mono text-sm font-semibold text-primary-foreground">
                      {point.time}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 font-semibold text-foreground">
                      <span className="flex h-6 w-6 items-center justify-center rounded-sm bg-accent text-xs font-semibold text-accent-foreground">
                        {idx + 1}
                      </span>
                      {point.location}
                    </p>
                    <p className="mt-1 ml-8 text-sm text-muted-foreground">{point.address}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">Chưa có điểm đón</p>
            )}
          </div>
        </SectionCard>

        <SectionCard
          title="Điểm trả khách"
          icon={<MapPin className="h-5 w-5" />}
        >
          <div className="space-y-3">
            {route.dropoffPoints.length > 0 ? (
              route.dropoffPoints.map((point, idx) => (
                <div
                  key={point.id}
                  className="flex gap-4 rounded-md border border-border bg-background p-4 transition-colors duration-150 hover:bg-muted motion-reduce:transition-none"
                >
                  <div className="shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary font-mono text-sm font-semibold text-primary-foreground">
                      {point.time}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 font-semibold text-foreground">
                      <span className="flex h-6 w-6 items-center justify-center rounded-sm bg-accent text-xs font-semibold text-accent-foreground">
                        {idx + 1}
                      </span>
                      {point.location}
                    </p>
                    <p className="mt-1 ml-8 text-sm text-muted-foreground">{point.address}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">Chưa có điểm trả</p>
            )}
          </div>
        </SectionCard>
      </div>

      {/* Policies Section */}
      <SectionCard
        title="Chính sách & Điều khoản"
        icon={<Package className="h-5 w-5" />}
      >
        <div className="space-y-4">
          {route.policies.length > 0 ? (
            route.policies.map((policy, idx) => (
              <div
                key={idx}
                className="rounded-md border border-border bg-background p-5 transition-colors duration-150 hover:bg-muted motion-reduce:transition-none"
              >
                <h4 className="mb-2 font-semibold text-foreground">{policy.title}</h4>
                <p className="text-sm leading-relaxed text-muted-foreground">{policy.description}</p>
              </div>
            ))
          ) : (
            <div className="space-y-4">
              <div className="rounded-md border border-border bg-background p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
                    <Package className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Hành lý</h4>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      Mỗi hành khách được miễn phí <strong className="font-semibold text-foreground">20kg hành lý</strong>. Hành lý vượt
                      quá giới hạn sẽ được tính phí bổ sung theo quy định.
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-md border border-border bg-background p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
                    <XCircle className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Chính sách hủy vé</h4>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      <strong className="font-semibold text-foreground">Miễn phí hủy vé</strong> trước 24 giờ khởi hành. Hủy trong vòng 24
                      giờ sẽ bị phạt <strong className="font-semibold text-foreground">20% giá vé</strong>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  )
}
