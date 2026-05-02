// ── Root application component ────────────────────────────────────────────────
// App sits directly inside BrowserRouter (defined in main.jsx).
// It has three responsibilities:
//   1. Wraps the whole tree in <AppProvider> so every child can read global
//      state (listings, favoriteIds, toast) via the useApp() hook.
//   2. Renders <Navbar> and <Toast> which must be visible on every route.
//   3. Defines the client-side route table via React Router <Routes>.

import { Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import Home from './pages/Home';
import Housing from './pages/Housing';
import Marketplace from './pages/Marketplace';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Navbar />
        <main style={{ paddingTop: 'var(--nav-h)' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/housing" element={<Housing />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
          </Routes>
        </main>
        <Toast />
      </AppProvider>
    </AuthProvider>
  );
}
