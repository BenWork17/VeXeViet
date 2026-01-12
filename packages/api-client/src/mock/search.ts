import type { SearchRoutesRequest, SearchRoutesResponse, Route } from '@vexeviet/types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const mockRoutes: Route[] = [
  {
    id: 'route-001',
    operatorId: 'op-001',
    operatorName: 'Sao Viet Express',
    operatorLogo: 'https://via.placeholder.com/150',
    operatorRating: 4.8,
    origin: {
      city: 'Hanoi',
      address: 'My Dinh Bus Station, Nam Tu Liem District',
      lat: 21.0278,
      lng: 105.8342
    },
    destination: {
      city: 'Sapa',
      address: 'Sapa Bus Station, Lao Cai Province',
      lat: 22.3364,
      lng: 103.8438
    },
    departureTime: '2026-02-15T22:00:00Z',
    arrivalTime: '2026-02-16T05:30:00Z',
    duration: '7h 30m',
    price: 350000,
    currency: 'VND',
    availableSeats: 12,
    totalSeats: 40,
    busType: 'LIMOUSINE',
    amenities: ['wifi', 'ac', 'blanket', 'water'],
    images: ['https://via.placeholder.com/800x600'],
    pickupPoints: [
      { id: 'pickup-001', name: 'My Dinh Bus Station', address: 'Pham Hung Street', time: '22:00' },
      { id: 'pickup-002', name: 'Long Bien Station', address: 'Nguyen Van Linh Street', time: '22:30' }
    ],
    dropoffPoints: [
      { id: 'dropoff-001', name: 'Sapa Bus Station', address: 'Fansipan Road', time: '05:30' }
    ],
    cancellationPolicy: 'Free cancellation up to 24 hours before departure'
  },
  {
    id: 'route-002',
    operatorId: 'op-002',
    operatorName: 'Futa Bus Lines',
    operatorLogo: 'https://via.placeholder.com/150',
    operatorRating: 4.6,
    origin: {
      city: 'Ho Chi Minh City',
      address: 'Mien Dong Bus Station, Binh Thanh District',
      lat: 10.8231,
      lng: 106.6297
    },
    destination: {
      city: 'Da Lat',
      address: 'Da Lat Bus Station, Lam Dong Province',
      lat: 11.9404,
      lng: 108.4583
    },
    departureTime: '2026-02-15T08:00:00Z',
    arrivalTime: '2026-02-15T15:00:00Z',
    duration: '7h 0m',
    price: 280000,
    currency: 'VND',
    availableSeats: 18,
    totalSeats: 40,
    busType: 'VIP',
    amenities: ['wifi', 'ac', 'toilet', 'usb-charging'],
    images: ['https://via.placeholder.com/800x600'],
    pickupPoints: [
      { id: 'pickup-003', name: 'Mien Dong Station', address: 'National Highway 13', time: '08:00' }
    ],
    dropoffPoints: [
      { id: 'dropoff-002', name: 'Da Lat Station', address: 'Tran Quoc Toan Street', time: '15:00' }
    ],
    cancellationPolicy: 'Cancellation fee 20% if cancelled within 24 hours'
  },
  {
    id: 'route-003',
    operatorId: 'op-003',
    operatorName: 'Phuong Trang Express',
    operatorLogo: 'https://via.placeholder.com/150',
    operatorRating: 4.5,
    origin: {
      city: 'Ho Chi Minh City',
      address: 'Mien Tay Bus Station, Binh Chanh District',
      lat: 10.7577,
      lng: 106.6239
    },
    destination: {
      city: 'Can Tho',
      address: 'Can Tho Bus Station, Ninh Kieu District',
      lat: 10.0452,
      lng: 105.7469
    },
    departureTime: '2026-02-15T06:30:00Z',
    arrivalTime: '2026-02-15T10:30:00Z',
    duration: '4h 0m',
    price: 150000,
    currency: 'VND',
    availableSeats: 25,
    totalSeats: 40,
    busType: 'STANDARD',
    amenities: ['ac', 'water'],
    images: ['https://via.placeholder.com/800x600'],
    pickupPoints: [
      { id: 'pickup-004', name: 'Mien Tay Station', address: 'Kinh Duong Vuong Street', time: '06:30' }
    ],
    dropoffPoints: [
      { id: 'dropoff-003', name: 'Can Tho Station', address: 'Nguyen Trai Street', time: '10:30' }
    ],
    cancellationPolicy: 'No refund for cancellations within 12 hours'
  },
  {
    id: 'route-004',
    operatorId: 'op-001',
    operatorName: 'Sao Viet Express',
    operatorLogo: 'https://via.placeholder.com/150',
    operatorRating: 4.7,
    origin: {
      city: 'Hanoi',
      address: 'Giap Bat Bus Station, Hoang Mai District',
      lat: 20.9937,
      lng: 105.8364
    },
    destination: {
      city: 'Hai Phong',
      address: 'Tam Bac Bus Station, Ngo Quyen District',
      lat: 20.8449,
      lng: 106.6881
    },
    departureTime: '2026-02-15T14:00:00Z',
    arrivalTime: '2026-02-15T16:30:00Z',
    duration: '2h 30m',
    price: 120000,
    currency: 'VND',
    availableSeats: 30,
    totalSeats: 40,
    busType: 'VIP',
    amenities: ['wifi', 'ac', 'usb-charging'],
    images: ['https://via.placeholder.com/800x600'],
    pickupPoints: [
      { id: 'pickup-005', name: 'Giap Bat Station', address: 'Giai Phong Street', time: '14:00' }
    ],
    dropoffPoints: [
      { id: 'dropoff-004', name: 'Tam Bac Station', address: 'Tran Nguyen Han Street', time: '16:30' }
    ],
    cancellationPolicy: 'Free cancellation up to 12 hours before departure'
  },
  {
    id: 'route-005',
    operatorId: 'op-004',
    operatorName: 'Hoang Long Limousine',
    operatorLogo: 'https://via.placeholder.com/150',
    operatorRating: 4.9,
    origin: {
      city: 'Hanoi',
      address: 'Noi Bai Airport, Soc Son District',
      lat: 21.2187,
      lng: 105.8072
    },
    destination: {
      city: 'Ha Long',
      address: 'Ha Long Bus Station, Quang Ninh Province',
      lat: 20.9519,
      lng: 107.0767
    },
    departureTime: '2026-02-15T10:00:00Z',
    arrivalTime: '2026-02-15T13:30:00Z',
    duration: '3h 30m',
    price: 250000,
    currency: 'VND',
    availableSeats: 8,
    totalSeats: 12,
    busType: 'LIMOUSINE',
    amenities: ['wifi', 'ac', 'massage-seat', 'water', 'snack', 'blanket'],
    images: ['https://via.placeholder.com/800x600'],
    pickupPoints: [
      { id: 'pickup-006', name: 'Noi Bai Airport T2', address: 'Terminal 2 Departure', time: '10:00' },
      { id: 'pickup-007', name: 'My Dinh Station', address: 'Pham Hung Street', time: '10:45' }
    ],
    dropoffPoints: [
      { id: 'dropoff-005', name: 'Ha Long Station', address: 'Ha Long Road', time: '13:30' }
    ],
    cancellationPolicy: 'Free cancellation up to 48 hours, 50% refund within 24 hours'
  }
];

export async function mockSearchRoutes(request: SearchRoutesRequest): Promise<SearchRoutesResponse> {
  await delay(1000);

  let filteredRoutes = [...mockRoutes];

  if (request.filters?.minPrice) {
    filteredRoutes = filteredRoutes.filter(r => r.price >= request.filters!.minPrice!);
  }
  if (request.filters?.maxPrice) {
    filteredRoutes = filteredRoutes.filter(r => r.price <= request.filters!.maxPrice!);
  }
  if (request.filters?.busTypes && request.filters.busTypes.length > 0) {
    filteredRoutes = filteredRoutes.filter(r => request.filters!.busTypes!.includes(r.busType));
  }
  if (request.filters?.amenities && request.filters.amenities.length > 0) {
    filteredRoutes = filteredRoutes.filter(r =>
      request.filters!.amenities!.every(a => r.amenities.includes(a))
    );
  }

  if (request.sort) {
    filteredRoutes.sort((a, b) => {
      let comparison = 0;
      switch (request.sort!.by) {
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'duration':
          comparison = a.duration.localeCompare(b.duration);
          break;
        case 'departure':
          comparison = a.departureTime.localeCompare(b.departureTime);
          break;
        case 'rating':
          comparison = a.operatorRating - b.operatorRating;
          break;
      }
      return request.sort!.order === 'asc' ? comparison : -comparison;
    });
  }

  const page = request.page || 1;
  const limit = request.limit || 20;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedRoutes = filteredRoutes.slice(startIndex, endIndex);

  const prices = filteredRoutes.map(r => r.price);
  const departureTimes = filteredRoutes.map(r => r.departureTime);
  const busTypes = [...new Set(filteredRoutes.map(r => r.busType))];
  const amenities = [...new Set(filteredRoutes.flatMap(r => r.amenities))];

  return {
    success: true,
    data: {
      routes: paginatedRoutes,
      pagination: {
        page,
        limit,
        total: filteredRoutes.length,
        totalPages: Math.ceil(filteredRoutes.length / limit)
      },
      filters: {
        priceRange: {
          min: prices.length > 0 ? Math.min(...prices) : 0,
          max: prices.length > 0 ? Math.max(...prices) : 0
        },
        departureTimeRange: {
          min: departureTimes.length > 0 ? departureTimes.sort()[0] : '',
          max: departureTimes.length > 0 ? departureTimes.sort()[departureTimes.length - 1] : ''
        },
        availableBusTypes: busTypes,
        availableAmenities: amenities
      }
    },
    metadata: {
      searchId: `search-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    }
  };
}
