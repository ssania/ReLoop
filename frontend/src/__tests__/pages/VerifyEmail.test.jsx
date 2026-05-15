import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import VerifyEmail from '../../pages/VerifyEmail';

describe('VerifyEmail', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('shows verifying state initially with valid token', () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));
    render(
      <MemoryRouter initialEntries={['/verify-email?token=abc123']}>
        <Routes><Route path="/verify-email" element={<VerifyEmail />} /></Routes>
      </MemoryRouter>
    );
    expect(screen.getByText(/Verifying your email/)).toBeInTheDocument();
  });

  it('shows error state when no token in URL', () => {
    render(
      <MemoryRouter initialEntries={['/verify-email']}>
        <Routes><Route path="/verify-email" element={<VerifyEmail />} /></Routes>
      </MemoryRouter>
    );
    expect(screen.getByText(/Invalid or expired link/)).toBeInTheDocument();
  });

  it('shows error state when fetch fails', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
    render(
      <MemoryRouter initialEntries={['/verify-email?token=badtoken']}>
        <Routes><Route path="/verify-email" element={<VerifyEmail />} /></Routes>
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText(/Invalid or expired link/)).toBeInTheDocument();
    });
  });

  it('shows error state when fetch returns non-ok response', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, type: 'basic', redirected: false, status: 400 });
    render(
      <MemoryRouter initialEntries={['/verify-email?token=expiredtoken']}>
        <Routes><Route path="/verify-email" element={<VerifyEmail />} /></Routes>
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText(/Invalid or expired link/)).toBeInTheDocument();
    });
  });

  it('shows Back to register link in error state', () => {
    render(
      <MemoryRouter initialEntries={['/verify-email']}>
        <Routes><Route path="/verify-email" element={<VerifyEmail />} /></Routes>
      </MemoryRouter>
    );
    expect(screen.getByText('Back to register')).toBeInTheDocument();
  });
});
