import {
  ArrowLeft,
  Star,
  MapPin,
  Clock,
  ShieldCheck,
  Wifi,
  BatteryCharging,
  Wind,
  Coffee,
  Package,
  XCircle,
  Image as ImageIcon,
  Navigation,
  Calendar,
  Users,
  Bed,
  Armchair,
  Crown,
} from 'lucide-react'
import { Route, Amenity } from '@/types/models'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import Link from 'next/link'
import { BusTypePreview } from '../booking/BusTypePreview'

export function RouteDetailHeader({ route }: { route: Route }) {
  const depDate = new Date(route.departureTime)
  const arrDate = new Date(route.arrivalTime)

  return (
    <div className="space-y-6">
      {/* Navigation & Back Button */}
      <Link
        href="/search"
        className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-semibold transition-colors group mb-2 w-fit"
      >
        <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:bg-blue-50 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </div>
        Quay lại tìm kiếm
      </Link>

      {/* Hero Section with Gradient Background */}
      <div className="relative bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 rounded-2xl overflow-hidden shadow-xl">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="white"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Content */}
        <div className="relative p-8">
          {/* Bus Type Badge */}
          <div className="flex justify-between items-start mb-6">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold border border-white/30">
              <Navigation className="w-4 h-4" />
              {route.busType}
            </div>
            <div className="text-white/90 text-right">
              <p className="text-sm font-medium">Biển số xe</p>
              <p className="text-lg font-bold">{route.licensePlate || 'N/A'}</p>
            </div>
          </div>

          {/* Route Journey */}
          <div className="space-y-6">
            {/* From -> To */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-white/80 text-sm font-medium mb-1">Điểm đi</p>
                <h2 className="text-2xl md:text-3xl font-bold text-white">
                  {route.departureLocation}
                </h2>
                <p className="text-white/90 text-sm mt-1">
                  {format(depDate, 'HH:mm - EEEE, dd MMM yyyy', { locale: vi })}
                </p>
              </div>
              
              <div className="flex flex-col items-center justify-center px-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/40">
                  <div className="text-white text-xs font-bold">{route.duration}</div>
                </div>
                <div className="w-px h-8 bg-white/30 my-2" />
              </div>

              <div className="flex-1 text-right">
                <p className="text-white/80 text-sm font-medium mb-1">Điểm đến</p>
                <h2 className="text-2xl md:text-3xl font-bold text-white">
                  {route.arrivalLocation}
                </h2>
                <p className="text-white/90 text-sm mt-1">
                  {format(arrDate, 'HH:mm - EEEE, dd MMM yyyy', { locale: vi })}
                </p>
              </div>
            </div>

            {/* Operator Info */}
            <div className="flex items-center gap-4 pt-6 border-t border-white/20">
              <div className="w-14 h-14 rounded-xl bg-white p-2 shadow-lg flex items-center justify-center">
                {route.operator.logoUrl ? (
                  <img
                    src={route.operator.logoUrl}
                    alt={route.operator.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-blue-600 font-bold text-lg">
                    {route.operator.name.substring(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold text-lg">{route.operator.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1 bg-amber-400 text-amber-900 px-2 py-0.5 rounded-md text-xs font-bold">
                    <Star className="w-3 h-3 fill-current" />
                    {route.operator.rating.toFixed(1)}
                  </div>
                  <span className="text-white/80 text-xs">
                    {route.operator.totalReviews} chuyến đi
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function RouteJourneyTimeline({ route }: { route: Route }) {
  return null // Removed - merged into header
}

const AmenityIcon = ({ name }: { name: string }) => {
  const lowerName = name.toLowerCase()
  if (lowerName.includes('wifi')) return <Wifi className="w-5 h-5" />
  if (lowerName.includes('charging') || lowerName.includes('usb'))
    return <BatteryCharging className="w-5 h-5" />
  if (lowerName.includes('ac') || lowerName.includes('air')) return <Wind className="w-5 h-5" />
  if (lowerName.includes('water') || lowerName.includes('coffee'))
    return <Coffee className="w-5 h-5" />
  return <ShieldCheck className="w-5 h-5" />
}

export function RouteDetailTabs({ route }: { route: Route }) {
  return (
    <div className="space-y-6">
      {/* Quick Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-2xl border-2 border-blue-300 shadow-sm hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs text-blue-700 font-semibold">Ghế trống</p>
              <p className="text-2xl font-bold text-blue-900">{route.availableSeats}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-2xl border-2 border-green-300 shadow-sm hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center shadow-md">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs text-green-700 font-semibold">Tiện nghi</p>
              <p className="text-2xl font-bold text-green-900">{route.amenities.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-2xl border-2 border-purple-300 shadow-sm hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center shadow-md">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs text-purple-700 font-semibold">Điểm đón</p>
              <p className="text-2xl font-bold text-purple-900">{route.pickupPoints.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-5 rounded-2xl border-2 border-orange-300 shadow-sm hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center shadow-md">
              <Star className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs text-orange-700 font-semibold">Đánh giá</p>
              <p className="text-2xl font-bold text-orange-900">{route.operator.rating.toFixed(1)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bus Type Preview Section */}
      <BusTypePreview 
        busType={route.busType} 
        totalSeats={route.availableSeats}
      />

      {/* Amenities Section */}
      <div className="bg-white rounded-2xl shadow-md border-2 border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" />
            Tiện nghi trên xe
          </h3>
        </div>
        <div className="p-6">
          {route.amenities.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {route.amenities.map((amenity) => (
                <div
                  key={amenity.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 hover:shadow-lg hover:scale-105 transition-all duration-200"
                >
                  <div className="text-blue-600 bg-white p-2 rounded-lg shadow-sm">
                    <AmenityIcon name={amenity.name} />
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{amenity.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 py-8">Chưa có thông tin tiện nghi</p>
          )}
        </div>
      </div>

      {/* Pickup & Dropoff Points */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Pickup Points */}
        <div className="bg-white rounded-2xl shadow-md border-2 border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Điểm đón khách
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {route.pickupPoints.length > 0 ? (
                route.pickupPoints.map((point, idx) => (
                  <div
                    key={point.id}
                    className="flex gap-4 p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 hover:shadow-md transition-shadow"
                  >
                    <div className="shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-full flex items-center justify-center font-bold shadow-lg text-sm">
                        {point.time}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 flex items-center gap-2">
                        <span className="w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-bold">
                          {idx + 1}
                        </span>
                        {point.location}
                      </p>
                      <p className="text-sm text-gray-600 mt-1 ml-8">{point.address}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 text-center py-8">Chưa có điểm đón</p>
              )}
            </div>
          </div>
        </div>

        {/* Dropoff Points */}
        <div className="bg-white rounded-2xl shadow-md border-2 border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Điểm trả khách
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {route.dropoffPoints.length > 0 ? (
                route.dropoffPoints.map((point, idx) => (
                  <div
                    key={point.id}
                    className="flex gap-4 p-4 rounded-xl bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 hover:shadow-md transition-shadow"
                  >
                    <div className="shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-full flex items-center justify-center font-bold shadow-lg text-sm">
                        {point.time}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 flex items-center gap-2">
                        <span className="w-6 h-6 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center text-xs font-bold">
                          {idx + 1}
                        </span>
                        {point.location}
                      </p>
                      <p className="text-sm text-gray-600 mt-1 ml-8">{point.address}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 text-center py-8">Chưa có điểm trả</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Policies Section */}
      <div className="bg-white rounded-2xl shadow-md border-2 border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Package className="w-5 h-5" />
            Chính sách & Điều khoản
          </h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {route.policies.length > 0 ? (
              route.policies.map((policy, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 hover:shadow-md transition-shadow"
                >
                  <h4 className="font-bold text-gray-900 mb-2 text-lg">{policy.title}</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{policy.description}</p>
                </div>
              ))
            ) : (
              <div className="space-y-4">
                <div className="p-5 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center shrink-0">
                      <Package className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">Hành lý</h4>
                      <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                        Mỗi hành khách được miễn phí <strong>20kg hành lý</strong>. Hành lý vượt
                        quá giới hạn sẽ được tính phí bổ sung theo quy định.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-5 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center shrink-0">
                      <XCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">Chính sách hủy vé</h4>
                      <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                        <strong>Miễn phí hủy vé</strong> trước 24 giờ khởi hành. Hủy trong vòng 24
                        giờ sẽ bị phạt <strong>20% giá vé</strong>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
