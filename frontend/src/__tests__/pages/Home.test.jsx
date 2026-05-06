import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from '../../pages/Home';

vi.mock('../../context/AppContext', () => ({ useApp: vi.fn() }));
vi.mock('../../context/AuthContext', () => ({ useAuth: vi.fn() }));
vi.mock('../../components/CardA', () => ({ default: ({ item }) => <div data-testid="card">{item.title}</div> }));
vi.mock('../../components/DetailModal', () => ({ default: ({ onClose }) => <div data-testid="detail-modal"><button onClick={onClose}>Close</button></div> }));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

const mockListings = [
  { id: '1', title: 'Desk', category: 'Furniture', price: 50, condition: 'Good', status: 'Available', emoji: '🛋️', imageUrls: [], owner: { name: 'Alice', avgRating: 4.0 } },
  { id: '2', title: 'Laptop', category: 'Electronics', price: 200, condition: 'New', status: 'Available', emoji: '💻', imageUrls: [], owner: { name: 'Bob', avgRating: 5.0 } },
];

describe('Home page', () => {
  beforeEach(() => {
    useApp.mockReturnValue({ listings: mockListings });
    useAuth.mockReturnValue({ user: null });
    mockNavigate.mockClear();
  });

  it('renders hero headline', () => {
    render(<MemoryRouter><Home /></MemoryRouter>);
    expect(screen.getByText(/Buy\. Sell\./)).toBeInTheDocument();
  });

  it('renders Housing Hub service card', () => {
    render(<MemoryRouter><Home /></MemoryRouter>);
    expect(screen.getByText('Housing Hub')).toBeInTheDocument();
  });

  it('renders Student Marketplace service card', () => {
    render(<MemoryRouter><Home /></MemoryRouter>);
    expect(screen.getByText('Student Marketplace')).toBeInTheDocument();
  });

  it('renders stats row', () => {
    render(<MemoryRouter><Home /></MemoryRouter>);
    expect(screen.getByText('Neighborhoods')).toBeInTheDocument();
    expect(screen.getByText('Verified students')).toBeInTheDocument();
  });

  it('does not show recent listings when user is not logged in', () => {
    render(<MemoryRouter><Home /></MemoryRouter>);
    expect(screen.queryByText('Recent listings')).not.toBeInTheDocument();
  });

  it('shows recent listings when user is logged in', () => {
    useAuth.mockReturnValue({ user: { id: '1', name: 'Test' } });
    render(<MemoryRouter><Home /></MemoryRouter>);
    expect(screen.getByText('Recent listings')).toBeInTheDocument();
    expect(screen.getAllByTestId('card')).toHaveLength(2);
  });

  it('navigates to /housing on Explore housing button click', () => {
    render(<MemoryRouter><Home /></MemoryRouter>);
    fireEvent.click(screen.getByText('Explore housing areas'));
    expect(mockNavigate).toHaveBeenCalledWith('/housing');
  });

  it('navigates to /login on Browse marketplace when not logged in', () => {
    render(<MemoryRouter><Home /></MemoryRouter>);
    fireEvent.click(screen.getByText('Browse marketplace'));
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('navigates to /marketplace on Browse marketplace when logged in', () => {
    useAuth.mockReturnValue({ user: { id: '1', name: 'Test' } });
    render(<MemoryRouter><Home /></MemoryRouter>);
    fireEvent.click(screen.getByText('Browse marketplace'));
    expect(mockNavigate).toHaveBeenCalledWith('/marketplace');
  });

  it('renders footer', () => {
    render(<MemoryRouter><Home /></MemoryRouter>);
    expect(screen.getByText(/ReLoop UMass/)).toBeInTheDocument();
  });
});
