// ── Root application component ────────────────────────────────────────────────
// App sits directly inside BrowserRouter (defined in main.jsx).
// It has three responsibilities:
//   1. Wraps the whole tree in <AppProvider> so every child can read global
//      state (listings, savedIds, toast) via the useApp() hook.
//   2. Renders <Navbar> and <Toast> which must be visible on every route.
//   3. Defines the client-side route table via React Router <Routes>.

import { Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import Home from './pages/Home';
import Housing from './pages/Housing';
import Marketplace from './pages/Marketplace';
import Profile from './pages/Profile';

export default function App() {
  return (
    // AppProvider supplies listings, savedIds, and showToast to the whole tree.
    <AppProvider>
      {/* Fixed top navbar – always visible regardless of active route. */}
      <Navbar />

      {/* paddingTop offsets the fixed navbar so page content is not hidden underneath. */}
      <main style={{ paddingTop: 'var(--nav-h)' }}>
        <Routes>
          {/* "/" – landing page with hero, service cards, and recent listings. */}
          <Route path="/" element={<Home />} />

          {/* "/housing" – public neighborhood research hub, no auth required. */}
          <Route path="/housing" element={<Housing />} />

          {/* "/marketplace" – verified student buy/sell board. */}
          <Route path="/marketplace" element={<Marketplace />} />

          {/* "/profile" – current user's listings, saved items, and reviews. */}
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>

      {/* Toast notification overlay – reads from AppContext and is shown app-wide. */}
      <Toast />
    </AppProvider>
  );
}
