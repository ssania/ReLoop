import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../context/AuthContext';

function TestComponent() {
  const { user, token, loading, login, register, logout } = useAuth();
  return (
    <div>
      <div data-testid="loading">{String(loading)}</div>
      <div data-testid="user">{user ? user.name : 'null'}</div>
      <div data-testid="token">{token || 'null'}</div>
      <button onClick={() => login('test@umass.edu', 'password123')}>Login</button>
      <button onClick={() => register('Test User', 'test@umass.edu', 'password123')}>Register</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('starts with loading true then false', async () => {
    render(<AuthProvider><TestComponent /></AuthProvider>);
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
  });

  it('starts with null user and token', async () => {
    render(<AuthProvider><TestComponent /></AuthProvider>);
    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('null');
      expect(screen.getByTestId('token').textContent).toBe('null');
    });
  });

  it('restores user from localStorage on mount', async () => {
    localStorage.setItem('rl_token', 'mytoken');
    localStorage.setItem('rl_user', JSON.stringify({ id: '1', name: 'Stored User' }));
    render(<AuthProvider><TestComponent /></AuthProvider>);
    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('Stored User');
      expect(screen.getByTestId('token').textContent).toBe('mytoken');
    });
  });

  it('login stores user and token', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ token: 'jwt123', user: { id: '1', name: 'John Doe' } }),
    });
    render(<AuthProvider><TestComponent /></AuthProvider>);
    await act(async () => {
      screen.getByText('Login').click();
    });
    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('John Doe');
      expect(screen.getByTestId('token').textContent).toBe('jwt123');
    });
  });

  it('login throws on failure', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'Invalid credentials' }),
    });
    let error;
    function TestError() {
      const { login } = useAuth();
      return <button onClick={async () => { try { await login('a@umass.edu', 'bad'); } catch (e) { error = e; } }}>Login</button>;
    }
    render(<AuthProvider><TestError /></AuthProvider>);
    await act(async () => { screen.getByText('Login').click(); });
    expect(error?.message).toBe('Invalid credentials');
  });

  it('logout clears user and token', async () => {
    localStorage.setItem('rl_token', 'mytoken');
    localStorage.setItem('rl_user', JSON.stringify({ id: '1', name: 'John' }));
    render(<AuthProvider><TestComponent /></AuthProvider>);
    await waitFor(() => expect(screen.getByTestId('user').textContent).toBe('John'));
    await act(async () => { screen.getByText('Logout').click(); });
    expect(screen.getByTestId('user').textContent).toBe('null');
    expect(screen.getByTestId('token').textContent).toBe('null');
    expect(localStorage.getItem('rl_token')).toBeNull();
  });

  it('register calls API and returns message', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'Check your inbox' }),
    });
    let msg;
    function TestRegister() {
      const { register } = useAuth();
      return <button onClick={async () => { msg = await register('Jane', 'jane@umass.edu', 'pass123'); }}>Register</button>;
    }
    render(<AuthProvider><TestRegister /></AuthProvider>);
    await act(async () => { screen.getByText('Register').click(); });
    expect(msg).toBe('Check your inbox');
  });
});
