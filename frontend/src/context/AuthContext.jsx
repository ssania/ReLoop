// ── AuthContext ───────────────────────────────────────────────────────────────
// Provides auth state globally: the logged-in user object + JWT token.
// Persists token in localStorage so the user stays logged in on refresh.
//
// Exposes:
//   user       – { id, name, email } or null
//   token      – JWT string or null
//   loading    – true while checking localStorage on first render
//   login()    – POST /api/auth/login → stores token + user
//   register() – POST /api/auth/register → returns server message (no auto-login, email verification required)
//   logout()   – clears token + user

import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

const API = 'http://localhost:5002/api/auth';

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount: restore session from localStorage (survives page refresh).
  useEffect(() => {
    const storedToken = localStorage.getItem('rl_token');
    const storedUser  = localStorage.getItem('rl_user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Shared helper: save to state + localStorage.
  function persist(data) {
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('rl_token', data.token);
    localStorage.setItem('rl_user', JSON.stringify(data.user));
  }

  // login: throws on error so the caller can show the message in the UI.
  async function login(email, password) {
    const res  = await fetch(`${API}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    persist(data);
  }

  // register: creates the account but does NOT log the user in.
  // They must verify their @umass.edu email before they can login.
  // Returns the server message so the UI can show it.
  async function register(name, email, password) {
    const res  = await fetch(`${API}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');
    return data.message;
  }

  // logout: wipe everything.
  function logout() {
    setToken(null);
    setUser(null);
    localStorage.removeItem('rl_token');
    localStorage.removeItem('rl_user');
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// useAuth: convenience hook — import this in any component.
export function useAuth() {
  return useContext(AuthContext);
}