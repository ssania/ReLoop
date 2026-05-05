import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import HousingCard from '../../components/HousingCard';

vi.mock('../../components/HousingImageCarousel', () => ({
  default: () => <div data-testid="carousel" />,
}));

const mockHousing = {
  id: 101,
  name: 'Puffton Village',
  type: 'Apartments',
  distance: 1.0,
  rentMin: 1200,
  rentMax: 2500,
  busRoutes: ['PVTA #30', 'PVTA #31'],
  amenities: ['Near grocery stores', 'Good maintenance'],
  averageRating: 4.2,
  reviewCount: 10,
  imageUrls: [],
};

describe('HousingCard', () => {
  it('renders housing name', () => {
    render(<HousingCard h={mockHousing} onClick={vi.fn()} />);
    expect(screen.getByText('Puffton Village')).toBeInTheDocument();
  });

  it('renders distance from campus', () => {
    render(<HousingCard h={mockHousing} onClick={vi.fn()} />);
    expect(screen.getByText('1 mi from campus')).toBeInTheDocument();
  });

  it('renders rent range', () => {
    render(<HousingCard h={mockHousing} onClick={vi.fn()} />);
    expect(screen.getByText('$1,200 – $2,500')).toBeInTheDocument();
  });

  it('renders bus routes', () => {
    render(<HousingCard h={mockHousing} onClick={vi.fn()} />);
    expect(screen.getByText('PVTA #30')).toBeInTheDocument();
    expect(screen.getByText('PVTA #31')).toBeInTheDocument();
  });

  it('renders amenity chips', () => {
    render(<HousingCard h={mockHousing} onClick={vi.fn()} />);
    expect(screen.getByText('Near grocery stores')).toBeInTheDocument();
  });

  it('renders review count and rating', () => {
    render(<HousingCard h={mockHousing} onClick={vi.fn()} />);
    expect(screen.getByText(/4.2/)).toBeInTheDocument();
    expect(screen.getByText(/10 reviews/)).toBeInTheDocument();
  });

  it('renders "No reviews yet" when reviewCount is 0', () => {
    render(<HousingCard h={{ ...mockHousing, reviewCount: 0 }} onClick={vi.fn()} />);
    expect(screen.getByText('No reviews yet')).toBeInTheDocument();
  });

  it('renders singular "review" for reviewCount of 1', () => {
    render(<HousingCard h={{ ...mockHousing, reviewCount: 1, averageRating: 5.0 }} onClick={vi.fn()} />);
    expect(screen.getByText(/1 review\b/)).toBeInTheDocument();
  });

  it('calls onClick when card is clicked', () => {
    const handleClick = vi.fn();
    render(<HousingCard h={mockHousing} onClick={handleClick} />);
    fireEvent.click(screen.getByText('Puffton Village'));
    expect(handleClick).toHaveBeenCalledWith(mockHousing);
  });

  it('renders property type badge', () => {
    render(<HousingCard h={mockHousing} onClick={vi.fn()} />);
    expect(screen.getByText('Apartments')).toBeInTheDocument();
  });
});
