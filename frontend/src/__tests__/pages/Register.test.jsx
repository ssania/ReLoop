import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Register from '../../pages/Register';

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '../../context/AuthContext';

function renderRegister() {
  return render(<MemoryRouter><Register /></MemoryRouter>);
}

describe('Register page', () => {
  beforeEach(() => {
    useAuth.mockReturnValue({ register: vi.fn() });
  });

  it('renders all form fields', () => {
    renderRegister();
    expect(screen.getByPlaceholderText('e.g. Sania Khan')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('yourname@umass.edu')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Min. 6 characters')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
  });

  it('renders Create account button', () => {
    renderRegister();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('shows error for non-umass email on submit', async () => {
    renderRegister();
    fireEvent.change(screen.getByPlaceholderText('e.g. Sania Khan'), { target: { value: 'John' } });
    fireEvent.change(screen.getByPlaceholderText('yourname@umass.edu'), { target: { value: 'john@gmail.com' } });
    fireEvent.change(screen.getByPlaceholderText('Min. 6 characters'), { target: { value: 'password' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'password' } });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    await waitFor(() => expect(screen.getByText(/Only @umass.edu/)).toBeInTheDocument());
  });

  it('shows error when passwords do not match', async () => {
    renderRegister();
    fireEvent.change(screen.getByPlaceholderText('e.g. Sania Khan'), { target: { value: 'John' } });
    fireEvent.change(screen.getByPlaceholderText('yourname@umass.edu'), { target: { value: 'john@umass.edu' } });
    fireEvent.change(screen.getByPlaceholderText('Min. 6 characters'), { target: { value: 'password' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'different' } });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    await waitFor(() => expect(screen.getByText(/Passwords do not match/)).toBeInTheDocument());
  });

  it('shows error when password too short', async () => {
    renderRegister();
    fireEvent.change(screen.getByPlaceholderText('e.g. Sania Khan'), { target: { value: 'John' } });
    fireEvent.change(screen.getByPlaceholderText('yourname@umass.edu'), { target: { value: 'john@umass.edu' } });
    fireEvent.change(screen.getByPlaceholderText('Min. 6 characters'), { target: { value: 'abc' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'abc' } });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    await waitFor(() => expect(screen.getByText(/at least 6 characters/)).toBeInTheDocument());
  });

  it('shows success state after successful registration', async () => {
    const mockRegister = vi.fn().mockResolvedValue('Account created!');
    useAuth.mockReturnValue({ register: mockRegister });
    renderRegister();
    fireEvent.change(screen.getByPlaceholderText('e.g. Sania Khan'), { target: { value: 'John' } });
    fireEvent.change(screen.getByPlaceholderText('yourname@umass.edu'), { target: { value: 'john@umass.edu' } });
    fireEvent.change(screen.getByPlaceholderText('Min. 6 characters'), { target: { value: 'password' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'password' } });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    await waitFor(() => expect(screen.getByText(/Check your inbox/)).toBeInTheDocument());
  });

  it('shows inline error when email is not umass', () => {
    renderRegister();
    fireEvent.change(screen.getByPlaceholderText('yourname@umass.edu'), { target: { value: 'bad@gmail.com' } });
    expect(screen.getByText(/Only @umass.edu/)).toBeInTheDocument();
  });

  it('shows link to login page', () => {
    renderRegister();
    expect(screen.getByText('Sign in')).toBeInTheDocument();
  });

  it('shows register again button on success screen', async () => {
    const mockRegister = vi.fn().mockResolvedValue('Done');
    useAuth.mockReturnValue({ register: mockRegister });
    renderRegister();
    fireEvent.change(screen.getByPlaceholderText('e.g. Sania Khan'), { target: { value: 'Jane' } });
    fireEvent.change(screen.getByPlaceholderText('yourname@umass.edu'), { target: { value: 'jane@umass.edu' } });
    fireEvent.change(screen.getByPlaceholderText('Min. 6 characters'), { target: { value: 'password' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'password' } });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    await waitFor(() => expect(screen.getByText('Register again')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Register again'));
    await waitFor(() => expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument());
  });
});
