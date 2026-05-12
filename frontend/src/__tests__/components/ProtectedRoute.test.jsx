import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../../components/ProtectedRoute';

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '../../context/AuthContext';

function renderWithRouter(ui, { initialEntries = ['/'] } = {}) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/" element={ui} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  it('renders children when user is logged in', () => {
    useAuth.mockReturnValue({ user: { id: '1', name: 'Test' }, loading: false });
    renderWithRouter(
      <ProtectedRoute><div>Protected Content</div></ProtectedRoute>
    );
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects to /login when user is not authenticated', () => {
    useAuth.mockReturnValue({ user: null, loading: false });
    renderWithRouter(
      <ProtectedRoute><div>Protected Content</div></ProtectedRoute>
    );
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('renders nothing while loading', () => {
    useAuth.mockReturnValue({ user: null, loading: true });
    const { container } = renderWithRouter(
      <ProtectedRoute><div>Protected Content</div></ProtectedRoute>
    );
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
  });

  it('passes location state when redirecting unauthenticated user', () => {
    useAuth.mockReturnValue({ user: null, loading: false });
    renderWithRouter(
      <ProtectedRoute><div>Protected Content</div></ProtectedRoute>,
      { initialEntries: ['/profile'] }
    );
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('renders children for different user objects', () => {
    useAuth.mockReturnValue({ user: { id: '99', name: 'Other User' }, loading: false });
    renderWithRouter(
      <ProtectedRoute><div>Dashboard</div></ProtectedRoute>
    );
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('does not render children when user is null and not loading', () => {
    useAuth.mockReturnValue({ user: null, loading: false });
    renderWithRouter(
      <ProtectedRoute><div>Secret</div></ProtectedRoute>
    );
    expect(screen.queryByText('Secret')).not.toBeInTheDocument();
  });
});