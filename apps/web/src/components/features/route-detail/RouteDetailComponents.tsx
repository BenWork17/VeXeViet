import { Star, MapPin, Clock, ShieldCheck, Wifi, BatteryCharging, Wind, Coffee } from 'lucide-react';
import { Route, Amenity } from '@/types/models';
import { format } from 'date-fns';

export function RouteDetailHeader({ route }: { route: Route }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={route.operator.logoUrl}
            alt={route.operator.name}
            className="w-16 h-16 rounded-lg border object-contain"
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{route.operator.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-sm font-medium">
                <Star className="w-4 h-4 fill-current" />
                {route.operator.rating}
              </div>
              <span className="text-sm text-gray-500">({route.operator.totalReviews} reviews)</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col md:items-end">
          <span className="text-sm font-medium text-gray-600">{route.busType}</span>
          <span className="text-xs text-gray-400 mt-1">Plate: {route.licensePlate}</span>
        </div>
      </div>
    </div>
  );
}

export function RouteJourneyTimeline({ route }: { route: Route }) {
  const depDate = new Date(route.departureTime);
  const arrDate = new Date(route.arrivalTime);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
      <h2 className="text-lg font-semibold mb-6">Journey Details</h2>
      <div className="relative flex items-start gap-8">
        <div className="flex flex-col items-center">
          <div className="w-3 h-3 rounded-full bg-blue-600" />
          <div className="w-0.5 h-16 bg-gray-200 my-1 border-dashed" />
          <div className="w-3 h-3 rounded-full border-2 border-blue-600" />
        </div>
        <div className="flex-1 space-y-12">
          <div className="flex justify-between">
            <div>
              <p className="text-xl font-bold">{format(depDate, 'HH:mm')}</p>
              <p className="text-sm text-gray-500">{format(depDate, 'EEE, dd MMM')}</p>
              <p className="font-medium mt-2">{route.departureLocation}</p>
            </div>
          </div>
          <div className="flex justify-between">
            <div>
              <p className="text-xl font-bold">{format(arrDate, 'HH:mm')}</p>
              <p className="text-sm text-gray-500">{format(arrDate, 'EEE, dd MMM')}</p>
              <p className="font-medium mt-2">{route.arrivalLocation}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 flex items-center justify-end gap-1">
                <Clock className="w-4 h-4" />
                {route.duration}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const AmenityIcon = ({ name }: { name: string }) => {
  switch (name.toLowerCase()) {
    case 'wifi': return <Wifi className="w-5 h-5" />;
    case 'charging port': return <BatteryCharging className="w-5 h-5" />;
    case 'blanket': return <Wind className="w-5 h-5" />;
    case 'water': return <Coffee className="w-5 h-5" />;
    default: return null;
  }
};

export function RouteDetailTabs({ route }: { route: Route }) {
  // Simple tab implementation without shadcn/ui for now as it's not installed/ready
  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="border-b px-6 py-4">
        <div className="flex gap-8 overflow-x-auto no-scrollbar">
          <button className="text-blue-600 font-medium border-b-2 border-blue-600 pb-4 -mb-4 px-1">Amenities</button>
          <button className="text-gray-500 font-medium pb-4 px-1">Points</button>
          <button className="text-gray-500 font-medium pb-4 px-1">Policies</button>
        </div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {route.amenities.map((amenity) => (
            <div key={amenity.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
              <div className="text-blue-600">
                <AmenityIcon name={amenity.name} />
              </div>
              <span className="text-sm font-medium">{amenity.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
