import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import HousingImageCarousel from '../../components/HousingImageCarousel';

describe('HousingImageCarousel', () => {
  const mockHousingWithImages = {
    id: 'h1',
    name: 'Luxury Apartments',
    imageUrls: [{ url: 'image1.jpg' }, { url: 'image2.jpg' }],
    distance: 1.5,
    emoji: '🏢'
  };

  const mockHousingNoImages = {
    id: 'h2',
    name: 'Budget Studios',
    imageUrls: [],
    distance: 2.0,
    emoji: '🏠',
    amenities: ['Free WiFi', 'Gym'],
    busRoutes: ['30', '31']
  };

  it('renders images when provided', () => {
    const { container } = render(
      <HousingImageCarousel h={mockHousingWithImages} />
    );

    const images = container.querySelectorAll('img');
    expect(images.length).toBe(2);
    expect(images[0]).toHaveAttribute('src', 'image1.jpg');
    expect(images[1]).toHaveAttribute('src', 'image2.jpg');
  });

  it('renders placeholder slides when no images are provided', () => {
    render(
      <HousingImageCarousel h={mockHousingNoImages} />
    );

    expect(screen.getByText('Budget Studios')).toBeInTheDocument();
    expect(screen.getByText('Community View')).toBeInTheDocument();
    expect(screen.getByText('Free WiFi')).toBeInTheDocument(); // Headline from amenities
  });

  it('shows controls and navigates when showControls is true', () => {
    const { container } = render(
      <HousingImageCarousel h={mockHousingWithImages} showControls={true} />
    );

    const prevBtn = screen.getByLabelText('Previous image');
    const nextBtn = screen.getByLabelText('Next image');
    expect(prevBtn).toBeInTheDocument();
    expect(nextBtn).toBeInTheDocument();

    const track = container.querySelector('.housing-carousel-track');
    expect(track).toHaveStyle('transform: translateX(-0%)');

    fireEvent.click(nextBtn);
    expect(track).toHaveStyle('transform: translateX(-50%)'); // Since there are 2 slides

    fireEvent.click(prevBtn);
    expect(track).toHaveStyle('transform: translateX(-0%)');
  });

  it('shows dots when showDots is true', () => {
    render(
      <HousingImageCarousel h={mockHousingWithImages} showDots={true} />
    );

    const dots = screen.getAllByRole('button', { name: /Go to image/ });
    expect(dots.length).toBe(2);

    // Initial state
    expect(dots[0]).toHaveClass('active');
    expect(dots[1]).not.toHaveClass('active');

    // Click second dot
    fireEvent.click(dots[1]);
    expect(dots[0]).not.toHaveClass('active');
    expect(dots[1]).toHaveClass('active');
  });
});
