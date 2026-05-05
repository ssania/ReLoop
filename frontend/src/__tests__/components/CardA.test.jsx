import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CardA from '../../components/CardA';

vi.mock('../../context/AppContext', () => ({
  useApp: vi.fn(),
}));

import { useApp } from '../../context/AppContext';

const mockItem = {
  id: '1',
  title: 'IKEA Desk',
  category: 'Furniture',
  price: 80,
  condition: 'Good',
  status: 'Available',
  emoji: '🛋️',
  imageUrls: [],
  owner: { name: 'John Doe', avgRating: 4.5 },
};

describe('CardA', () => {
  beforeEach(() => {
    useApp.mockReturnValue({ favoriteIds: new Set(), toggleFavorite: vi.fn() });
  });

  it('renders item title and price', () => {
    render(<CardA item={mockItem} onClick={vi.fn()} />);
    expect(screen.getByText('IKEA Desk')).toBeInTheDocument();
    expect(screen.getByText('$80')).toBeInTheDocument();
  });

  it('renders category and condition', () => {
    render(<CardA item={mockItem} onClick={vi.fn()} />);
    expect(screen.getByText('Furniture')).toBeInTheDocument();
    expect(screen.getByText('Good')).toBeInTheDocument();
  });

  it('renders owner name and rating', () => {
    render(<CardA item={mockItem} onClick={vi.fn()} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('⭐ 4.5')).toBeInTheDocument();
  });

  it('renders Available status badge', () => {
    render(<CardA item={mockItem} onClick={vi.fn()} />);
    expect(screen.getByText('Available')).toBeInTheDocument();
  });

  it('renders Sold status badge', () => {
    render(<CardA item={{ ...mockItem, status: 'Sold' }} onClick={vi.fn()} />);
    expect(screen.getByText('Sold')).toBeInTheDocument();
  });

  it('calls onClick when card is clicked', () => {
    const handleClick = vi.fn();
    render(<CardA item={mockItem} onClick={handleClick} />);
    fireEvent.click(screen.getByText('IKEA Desk'));
    expect(handleClick).toHaveBeenCalledWith(mockItem);
  });

  it('shows unfavorited heart when not saved', () => {
    render(<CardA item={mockItem} onClick={vi.fn()} />);
    expect(screen.getByText('♡')).toBeInTheDocument();
  });

  it('shows favorited heart when saved', () => {
    useApp.mockReturnValue({ favoriteIds: new Set(['1']), toggleFavorite: vi.fn() });
    render(<CardA item={mockItem} onClick={vi.fn()} />);
    expect(screen.getByText('♥')).toBeInTheDocument();
  });

  it('calls toggleFavorite when heart is clicked', () => {
    const mockToggle = vi.fn();
    useApp.mockReturnValue({ favoriteIds: new Set(), toggleFavorite: mockToggle });
    render(<CardA item={mockItem} onClick={vi.fn()} />);
    fireEvent.click(screen.getByText('♡'));
    expect(mockToggle).toHaveBeenCalledWith('1');
  });

  it('renders emoji when no image urls', () => {
    render(<CardA item={mockItem} onClick={vi.fn()} />);
    expect(screen.getByText('🛋️')).toBeInTheDocument();
  });

  it('renders image when imageUrls present', () => {
    const itemWithImage = { ...mockItem, imageUrls: [{ url: 'https://example.com/img.jpg' }] };
    render(<CardA item={itemWithImage} onClick={vi.fn()} />);
    expect(screen.getByRole('img')).toHaveAttribute('src', 'https://example.com/img.jpg');
  });

  it('renders owner initials from name', () => {
    render(<CardA item={mockItem} onClick={vi.fn()} />);
    expect(screen.getByText('JD')).toBeInTheDocument();
  });
});
