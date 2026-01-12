import type { Meta, StoryObj } from '@storybook/react';
import { RouteCard } from './route-card';
import type { Route } from '@vexeviet/types';

const mockRoute: Route = {
  id: 'route-001',
  operatorId: 'op-001',
  operatorName: 'Sao Viet Express',
  operatorLogo: 'https://via.placeholder.com/150',
  operatorRating: 4.8,
  origin: {
    city: 'Hanoi',
    address: 'My Dinh Bus Station, Nam Tu Liem District',
    lat: 21.0278,
    lng: 105.8342,
  },
  destination: {
    city: 'Sapa',
    address: 'Sapa Bus Station, Lao Cai Province',
    lat: 22.3364,
    lng: 103.8438,
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
    { id: 'pickup-002', name: 'Long Bien Station', address: 'Nguyen Van Linh Street', time: '22:30' },
  ],
  dropoffPoints: [
    { id: 'dropoff-001', name: 'Sapa Bus Station', address: 'Fansipan Road', time: '05:30' },
  ],
  cancellationPolicy: 'Free cancellation up to 24 hours before departure',
};

const cheapRoute: Route = {
  ...mockRoute,
  id: 'route-002',
  operatorName: 'Phuong Trang Express',
  operatorRating: 4.5,
  busType: 'STANDARD',
  price: 150000,
  availableSeats: 25,
  amenities: ['ac', 'water'],
  origin: { city: 'Ho Chi Minh City', address: 'Mien Tay Bus Station' },
  destination: { city: 'Can Tho', address: 'Can Tho Bus Station' },
  departureTime: '2026-02-15T06:30:00Z',
  arrivalTime: '2026-02-15T10:30:00Z',
  cancellationPolicy: 'No refund for cancellations within 12 hours',
};

const luxuryRoute: Route = {
  ...mockRoute,
  id: 'route-003',
  operatorName: 'Hoang Long Limousine',
  operatorRating: 4.9,
  busType: 'LIMOUSINE',
  price: 250000,
  availableSeats: 8,
  totalSeats: 12,
  amenities: ['wifi', 'ac', 'massage-seat', 'water', 'snack', 'blanket'],
  origin: { city: 'Hanoi', address: 'Noi Bai Airport' },
  destination: { city: 'Ha Long', address: 'Ha Long Bus Station' },
  departureTime: '2026-02-15T10:00:00Z',
  arrivalTime: '2026-02-15T13:30:00Z',
  cancellationPolicy: 'Free cancellation up to 48 hours, 50% refund within 24 hours',
};

const meta = {
  title: 'Features/RouteCard',
  component: RouteCard,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    showCompare: {
      control: 'boolean',
      description: 'Show compare checkbox',
    },
    isComparing: {
      control: 'boolean',
      description: 'Whether route is being compared',
    },
  },
} satisfies Meta<typeof RouteCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    route: mockRoute,
    onSelect: (id) => {
      console.log('Selected route:', id);
      alert(`Selected route: ${id}`);
    },
  },
};

export const WithCompare: Story = {
  args: {
    route: mockRoute,
    showCompare: true,
    isComparing: false,
    onSelect: (id) => console.log('Selected route:', id),
    onCompare: (id) => console.log('Compare toggled:', id),
  },
};

export const Comparing: Story = {
  args: {
    route: mockRoute,
    showCompare: true,
    isComparing: true,
    onSelect: (id) => console.log('Selected route:', id),
    onCompare: (id) => console.log('Compare toggled:', id),
  },
};

export const CheapRoute: Story = {
  args: {
    route: cheapRoute,
    onSelect: (id) => console.log('Selected route:', id),
  },
};

export const LuxuryRoute: Story = {
  args: {
    route: luxuryRoute,
    onSelect: (id) => console.log('Selected route:', id),
  },
};

export const LowAvailability: Story = {
  args: {
    route: {
      ...mockRoute,
      availableSeats: 3,
    },
    onSelect: (id) => console.log('Selected route:', id),
  },
};

export const MultipleRoutes: Story = {
  args: {
    route: mockRoute,
    onSelect: (id) => console.log('Selected:', id),
  },
  render: (args) => (
    <div className="space-y-4">
      <RouteCard
        {...args}
        showCompare
      />
      <RouteCard
        {...args}
        route={cheapRoute}
        showCompare
      />
      <RouteCard
        {...args}
        route={luxuryRoute}
        showCompare
      />
    </div>
  ),
};
