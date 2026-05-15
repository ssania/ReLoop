import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Login from '../../pages/Login';

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

import { useAuth } from '../../context/AuthContext';

function renderLogin(search = '') {
  return render(
    <MemoryRouter initialEntries={[`/login${search}`]}>
      <Routes>
        <Route path="/login" element={<Login />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('Login page', () => {
  beforeEach(() => {
    useAuth.mockReturnValue({ login: vi.fn() });
    mockNavigate.mockClear();
  });

  it('renders email and password fields', () => {
    renderLogin();
    expect(screen.getByPlaceholderText('yourname@umass.edu')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
  });

  it('renders Sign in button', () => {
    renderLogin();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows error for non-umass email', async () => {
    renderLogin();
    fireEvent.change(screen.getByPlaceholderText('yourname@umass.edu'), { target: { value: 'test@gmail.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'password' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => {
      expect(screen.getByText(/Only @umass.edu/)).toBeInTheDocument();
    });
  });

  it('calls login with correct credentials', async () => {
    const mockLogin = vi.fn().mockResolvedValue();
    useAuth.mockReturnValue({ login: mockLogin });
    renderLogin();
    fireEvent.change(screen.getByPlaceholderText('yourname@umass.edu'), { target: { value: 'test@umass.edu' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@umass.edu', 'password123');
    });
  });

  it('shows error message from failed login', async () => {
    const mockLogin = vi.fn().mockRejectedValue(new Error('Invalid credentials'));
    useAuth.mockReturnValue({ login: mockLogin });
    renderLogin();
    fireEvent.change(screen.getByPlaceholderText('yourname@umass.edu'), { target: { value: 'test@umass.edu' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => {
      expect(screen.getByText(/Invalid credentials/)).toBeInTheDocument();
    });
  });

  it('shows verified banner when ?verified=true in URL', () => {
    renderLogin('?verified=true');
    expect(screen.getByText(/Email verified/)).toBeInTheDocument();
  });

  it('shows link to register page', () => {
    renderLogin();
    expect(screen.getByText('Create one')).toBeInTheDocument();
  });

  it('shows inline error on non-umass email input', () => {
    renderLogin();
    fireEvent.change(screen.getByPlaceholderText('yourname@umass.edu'), { target: { value: 'bad@gmail.com' } });
    expect(screen.getByText(/Only @umass.edu/)).toBeInTheDocument();
  });
});
