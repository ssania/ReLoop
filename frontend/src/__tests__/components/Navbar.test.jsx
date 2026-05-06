import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Navbar from '../../components/Navbar';

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

import { useAuth } from '../../context/AuthContext';

function renderNavbar() {
  return render(<MemoryRouter><Navbar /></MemoryRouter>);
}

describe('Navbar', () => {
  it('shows Login link when user is not logged in', () => {
    useAuth.mockReturnValue({ user: null, logout: vi.fn() });
    renderNavbar();
    expect(screen.getAllByText('Login').length).toBeGreaterThan(0);
    expect(screen.queryByText('Logout')).not.toBeInTheDocument();
  });

  it('shows Logout button when user is logged in', () => {
    useAuth.mockReturnValue({ user: { id: '1', name: 'Test User' }, logout: vi.fn() });
    renderNavbar();
    expect(screen.getAllByText('Logout').length).toBeGreaterThan(0);
    expect(screen.queryByText('Login')).not.toBeInTheDocument();
  });

  it('shows Profile link when user is logged in', () => {
    useAuth.mockReturnValue({ user: { id: '1', name: 'Test User' }, logout: vi.fn() });
    renderNavbar();
    expect(screen.getAllByText('Profile').length).toBeGreaterThan(0);
  });

  it('hides Profile link when user is not logged in', () => {
    useAuth.mockReturnValue({ user: null, logout: vi.fn() });
    renderNavbar();
    expect(screen.queryByText('Profile')).not.toBeInTheDocument();
  });

  it('calls logout and navigates home on Logout click', () => {
    const mockLogout = vi.fn();
    useAuth.mockReturnValue({ user: { id: '1', name: 'Test' }, logout: mockLogout });
    renderNavbar();
    fireEvent.click(screen.getAllByText('Logout')[0]);
    expect(mockLogout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('renders ReLoop logo text', () => {
    useAuth.mockReturnValue({ user: null, logout: vi.fn() });
    renderNavbar();
    expect(screen.getByText('ReLoop')).toBeInTheDocument();
  });

  it('renders main nav links', () => {
    useAuth.mockReturnValue({ user: null, logout: vi.fn() });
    renderNavbar();
    expect(screen.getAllByText('Home').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Housing Hub').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Marketplace').length).toBeGreaterThan(0);
  });
});
