import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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
    address: 'My Dinh Bus Station',
  },
  destination: {
    city: 'Sapa',
    address: 'Sapa Bus Station',
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
  ],
  dropoffPoints: [
    { id: 'dropoff-001', name: 'Sapa Bus Station', address: 'Fansipan Road', time: '05:30' },
  ],
  cancellationPolicy: 'Free cancellation up to 24 hours before departure',
};

describe('RouteCard', () => {
  it('renders route information correctly', () => {
    const onSelect = vi.fn();
    render(<RouteCard route={mockRoute} onSelect={onSelect} />);

    expect(screen.getByText('Sao Viet Express')).toBeInTheDocument();
    expect(screen.getByText('Hanoi')).toBeInTheDocument();
    expect(screen.getByText('Sapa')).toBeInTheDocument();
    expect(screen.getByText('12 seats available')).toBeInTheDocument();
    expect(screen.getByText('LIMOUSINE')).toBeInTheDocument();
  });

  it('formats price correctly as VND', () => {
    const onSelect = vi.fn();
    render(<RouteCard route={mockRoute} onSelect={onSelect} />);

    const priceElement = screen.getByText(/350\.000/);
    expect(priceElement).toBeInTheDocument();
  });

  it('calls onSelect when Select button is clicked', () => {
    const onSelect = vi.fn();
    render(<RouteCard route={mockRoute} onSelect={onSelect} />);

    const selectButton = screen.getByRole('button', { name: /select/i });
    fireEvent.click(selectButton);

    expect(onSelect).toHaveBeenCalledWith('route-001');
  });

  it('expands to show details on click', () => {
    const onSelect = vi.fn();
    render(<RouteCard route={mockRoute} onSelect={onSelect} />);

    const detailsButton = screen.getByText(/show details/i);
    fireEvent.click(detailsButton);

    expect(screen.getByText('Amenities')).toBeInTheDocument();
    expect(screen.getByText('Cancellation Policy')).toBeInTheDocument();
    expect(screen.getByText('Pickup Points')).toBeInTheDocument();
  });

  it('renders compare checkbox when showCompare is true', () => {
    const onSelect = vi.fn();
    const onCompare = vi.fn();
    render(
      <RouteCard
        route={mockRoute}
        onSelect={onSelect}
        showCompare={true}
        onCompare={onCompare}
      />
    );

    const compareCheckbox = screen.getByRole('checkbox');
    expect(compareCheckbox).toBeInTheDocument();
  });

  it('calls onCompare when checkbox is toggled', () => {
    const onSelect = vi.fn();
    const onCompare = vi.fn();
    render(
      <RouteCard
        route={mockRoute}
        onSelect={onSelect}
        showCompare={true}
        onCompare={onCompare}
      />
    );

    const compareCheckbox = screen.getByRole('checkbox');
    fireEvent.click(compareCheckbox);

    expect(onCompare).toHaveBeenCalledWith('route-001');
  });

  it('displays rating stars correctly', () => {
    const onSelect = vi.fn();
    render(<RouteCard route={mockRoute} onSelect={onSelect} />);

    expect(screen.getByText('4.8')).toBeInTheDocument();
  });

  it('shows amenities with proper truncation', () => {
    const onSelect = vi.fn();
    render(<RouteCard route={mockRoute} onSelect={onSelect} />);

    expect(screen.getByText('wifi')).toBeInTheDocument();
    expect(screen.getByText('ac')).toBeInTheDocument();
    expect(screen.getByText('blanket')).toBeInTheDocument();
    expect(screen.getByText('+1')).toBeInTheDocument();
  });
});
