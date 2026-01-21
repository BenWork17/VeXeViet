import type { SearchRoutesParams, SearchRoutesResponse, Route, VehicleType } from '@vexeviet/types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const mockRoutes: Route[] = [
  {
    id: 'route-001',
    operatorId: 'op-001',
    origin: 'Hà Nội',
    destination: 'Sapa',
    departureCity: 'Hà Nội',
    arrivalCity: 'Sapa',
    departureCitySlug: 'ha-noi',
    arrivalCitySlug: 'sapa',
    departureTime: '22:00',
    arrivalTime: '05:30',
    duration: 450,
    price: 350000,
    availableSeats: 12,
    totalSeats: 40,
    busType: 'LIMOUSINE',
    amenities: ['wifi', 'ac', 'blanket', 'water'],
    status: 'ACTIVE',
    pickupPoints: [
      { location: 'Bến xe Mỹ Đình', address: 'Đường Phạm Hùng', time: '22:00' },
      { location: 'Bến xe Long Biên', address: 'Đường Nguyễn Văn Linh', time: '22:30' }
    ],
    dropoffPoints: [
      { location: 'Bến xe Sapa', address: 'Đường Fansipan', time: '05:30' }
    ],
    operator: {
      id: 'op-001',
      name: 'Sao Việt Express',
      logo: 'https://via.placeholder.com/150',
      rating: 4.8,
      totalTrips: 15000
    }
  },
  {
    id: 'route-002',
    operatorId: 'op-002',
    origin: 'Hồ Chí Minh',
    destination: 'Đà Lạt',
    departureCity: 'Hồ Chí Minh',
    arrivalCity: 'Đà Lạt',
    departureCitySlug: 'ho-chi-minh',
    arrivalCitySlug: 'da-lat',
    departureTime: '08:00',
    arrivalTime: '15:00',
    duration: 420,
    price: 280000,
    availableSeats: 18,
    totalSeats: 40,
    busType: 'VIP',
    amenities: ['wifi', 'ac', 'toilet', 'usb-charging'],
    status: 'ACTIVE',
    pickupPoints: [
      { location: 'Bến xe Miền Đông', address: 'Quốc lộ 13', time: '08:00' }
    ],
    dropoffPoints: [
      { location: 'Bến xe Đà Lạt', address: 'Đường Trần Quốc Toản', time: '15:00' }
    ],
    operator: {
      id: 'op-002',
      name: 'Futa Bus Lines',
      logo: 'https://via.placeholder.com/150',
      rating: 4.6,
      totalTrips: 25000
    }
  },
  {
    id: 'route-003',
    operatorId: 'op-003',
    origin: 'Hồ Chí Minh',
    destination: 'Cần Thơ',
    departureCity: 'Hồ Chí Minh',
    arrivalCity: 'Cần Thơ',
    departureCitySlug: 'ho-chi-minh',
    arrivalCitySlug: 'can-tho',
    departureTime: '06:30',
    arrivalTime: '10:30',
    duration: 240,
    price: 150000,
    availableSeats: 25,
    totalSeats: 40,
    busType: 'STANDARD',
    amenities: ['ac', 'water'],
    status: 'ACTIVE',
    pickupPoints: [
      { location: 'Bến xe Miền Tây', address: 'Đường Kinh Dương Vương', time: '06:30' }
    ],
    dropoffPoints: [
      { location: 'Bến xe Cần Thơ', address: 'Đường Nguyễn Trãi', time: '10:30' }
    ],
    operator: {
      id: 'op-003',
      name: 'Phương Trang Express',
      logo: 'https://via.placeholder.com/150',
      rating: 4.5,
      totalTrips: 30000
    }
  },
  {
    id: 'route-004',
    operatorId: 'op-001',
    origin: 'Hà Nội',
    destination: 'Hải Phòng',
    departureCity: 'Hà Nội',
    arrivalCity: 'Hải Phòng',
    departureCitySlug: 'ha-noi',
    arrivalCitySlug: 'hai-phong',
    departureTime: '14:00',
    arrivalTime: '16:30',
    duration: 150,
    price: 120000,
    availableSeats: 30,
    totalSeats: 40,
    busType: 'VIP',
    amenities: ['wifi', 'ac', 'usb-charging'],
    status: 'ACTIVE',
    pickupPoints: [
      { location: 'Bến xe Giáp Bát', address: 'Đường Giải Phóng', time: '14:00' }
    ],
    dropoffPoints: [
      { location: 'Bến xe Tam Bạc', address: 'Đường Trần Nguyên Hãn', time: '16:30' }
    ],
    operator: {
      id: 'op-001',
      name: 'Sao Việt Express',
      logo: 'https://via.placeholder.com/150',
      rating: 4.7,
      totalTrips: 15000
    }
  },
  {
    id: 'route-005',
    operatorId: 'op-004',
    origin: 'Hà Nội',
    destination: 'Hạ Long',
    departureCity: 'Hà Nội',
    arrivalCity: 'Hạ Long',
    departureCitySlug: 'ha-noi',
    arrivalCitySlug: 'ha-long',
    departureTime: '10:00',
    arrivalTime: '13:30',
    duration: 210,
    price: 250000,
    availableSeats: 8,
    totalSeats: 12,
    busType: 'LIMOUSINE',
    amenities: ['wifi', 'ac', 'massage-seat', 'water', 'snack', 'blanket'],
    status: 'ACTIVE',
    pickupPoints: [
      { location: 'Sân bay Nội Bài T2', address: 'Nhà ga T2', time: '10:00' },
      { location: 'Bến xe Mỹ Đình', address: 'Đường Phạm Hùng', time: '10:45' }
    ],
    dropoffPoints: [
      { location: 'Bến xe Hạ Long', address: 'Đường Hạ Long', time: '13:30' }
    ],
    operator: {
      id: 'op-004',
      name: 'Hoàng Long Limousine',
      logo: 'https://via.placeholder.com/150',
      rating: 4.9,
      totalTrips: 8000
    }
  }
];

export async function mockSearchRoutes(params: SearchRoutesParams): Promise<SearchRoutesResponse> {
  await delay(1000);

  let filteredRoutes = [...mockRoutes];

  // Filter by origin/destination city slug
  if (params.from) {
    filteredRoutes = filteredRoutes.filter(r => 
      (r.departureCitySlug || '').toLowerCase().includes(params.from.toLowerCase())
    );
  }
  if (params.to) {
    filteredRoutes = filteredRoutes.filter(r => 
      (r.arrivalCitySlug || '').toLowerCase().includes(params.to.toLowerCase())
    );
  }

  // Filter by price range
  if (params.minPrice) {
    filteredRoutes = filteredRoutes.filter(r => {
      const price = typeof r.price === 'string' ? parseFloat(r.price) : r.price;
      return price >= params.minPrice!;
    });
  }
  if (params.maxPrice) {
    filteredRoutes = filteredRoutes.filter(r => {
      const price = typeof r.price === 'string' ? parseFloat(r.price) : r.price;
      return price <= params.maxPrice!;
    });
  }

  // Filter by vehicle type
  if (params.vehicleType) {
    filteredRoutes = filteredRoutes.filter(r => r.busType === params.vehicleType);
  }

  // Filter by amenities
  if (params.amenities && params.amenities.length > 0) {
    filteredRoutes = filteredRoutes.filter(r =>
      params.amenities!.every((a: string) => r.amenities.includes(a))
    );
  }

  // Sort
  if (params.sortBy) {
    filteredRoutes.sort((a, b) => {
      let comparison = 0;
      const priceA = typeof a.price === 'string' ? parseFloat(a.price) : a.price;
      const priceB = typeof b.price === 'string' ? parseFloat(b.price) : b.price;
      switch (params.sortBy) {
        case 'price':
          comparison = priceA - priceB;
          break;
        case 'departureTime':
          comparison = a.departureTime.localeCompare(b.departureTime);
          break;
        case 'rating':
          comparison = (a.operator?.rating ?? 0) - (b.operator?.rating ?? 0);
          break;
      }
      return params.sortOrder === 'desc' ? -comparison : comparison;
    });
  }

  // Pagination
  const page = params.page || 1;
  const limit = params.limit || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedRoutes = filteredRoutes.slice(startIndex, endIndex);

  return {
    routes: paginatedRoutes,
    pagination: {
      page,
      limit,
      total: filteredRoutes.length,
      totalPages: Math.ceil(filteredRoutes.length / limit)
    }
  };
}
