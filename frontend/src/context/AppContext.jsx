// ── Global application state ──────────────────────────────────────────────────
// AppContext is the single source of truth for data shared across components:
//   • listings    – marketplace items fetched from GET /api/listings
//   • housing     – neighbourhood data fetched from GET /api/housing
//   • favoriteIds – Set of listing IDs the user has favorited, persisted via /api/favorites
//   • toast       – current notification state { msg, icon, visible }
//
// On mount, AppProvider fetches listings, housing, and favorites in parallel from
// the Express backend (localhost:5002).

import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

const API = 'http://localhost:5002/api';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [listings, setListings] = useState([]);
  const [housing, setHousing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [toast, setToast] = useState({ msg: '', icon: '✓', visible: false });
  const toastTimer = useRef(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [listRes, housingRes, favRes] = await Promise.all([
          fetch(`${API}/listings`),
          fetch(`${API}/housing`),
          fetch(`${API}/favorites`),
        ]);

        const [listData, housingData, favData] = await Promise.all([
          listRes.json(),
          housingRes.json(),
          favRes.json(),
        ]);

        setListings(listData);
        setHousing(housingData);
        setFavoriteIds(new Set(favData));
      } catch (err) {
        console.error('Failed to fetch data from backend:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const showToast = useCallback((msg, icon = '✓') => {
    setToast({ msg, icon, visible: true });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, visible: false })), 2800);
  }, []);

  const toggleFavorite = useCallback(async (id) => {
    const isFavorited = favoriteIds.has(id);
    try {
      await fetch(`${API}/favorites/${id}`, { method: isFavorited ? 'DELETE' : 'POST' });
      setFavoriteIds(prev => {
        const next = new Set(prev);
        if (isFavorited) { next.delete(id); } else { next.add(id); }
        return next;
      });
      showToast(isFavorited ? 'Removed from favorites' : 'Added to favorites!', isFavorited ? '🗑️' : '❤️');
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
      showToast('Could not update favorites', '⚠️');
    }
  }, [favoriteIds, showToast]);

  // CreateListingModal handles the API call itself and passes the created listing here
  const addListing = useCallback((item) => {
    setListings(prev => [item, ...prev]);
  }, []);

  const updateListing = useCallback(async (id, changes) => {
    try {
      const res = await fetch(`${API}/listings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changes),
      });
      const updated = await res.json();
      setListings(prev => prev.map(l => l.id === id ? updated : l));
    } catch (err) {
      console.error('Failed to update listing:', err);
      showToast('Could not update listing', '⚠️');
    }
  }, [showToast]);

  const deleteListing = useCallback(async (id) => {
    try {
      await fetch(`${API}/listings/${id}`, { method: 'DELETE' });
      setListings(prev => prev.filter(l => l.id !== id));
      setFavoriteIds(prev => { const next = new Set(prev); next.delete(id); return next; });
    } catch (err) {
      console.error('Failed to delete listing:', err);
      showToast('Could not delete listing', '⚠️');
    }
  }, [showToast]);

  const confirmPurchase = useCallback(async (id) => {
    try {
      const res = await fetch(`${API}/listings/${id}/confirm`, { method: 'PATCH' });
      const data = await res.json();
      if (!res.ok) { showToast(data.message || 'Could not confirm purchase', '⚠️'); return false; }
      setListings(prev => prev.map(l => l.id === id ? { ...l, status: 'Sold' } : l));
      showToast('Purchase confirmed!', '✅');
      return true;
    } catch (err) {
      console.error('Failed to confirm purchase:', err);
      showToast('Could not confirm purchase', '⚠️');
      return false;
    }
  }, [showToast]);

  const rejectPurchase = useCallback(async (id) => {
    try {
      const res = await fetch(`${API}/listings/${id}/reject`, { method: 'PATCH' });
      const data = await res.json();
      if (!res.ok) { showToast(data.message || 'Could not reject purchase', '⚠️'); return false; }
      setListings(prev => prev.map(l => l.id === id ? { ...l, status: 'Available', buyer: null } : l));
      showToast('Purchase rejected — listing back to Available', '❌');
      return true;
    } catch (err) {
      console.error('Failed to reject purchase:', err);
      showToast('Could not reject purchase', '⚠️');
      return false;
    }
  }, [showToast]);

  return (
    <AppContext.Provider value={{
      listings, housing, loading,
      addListing, updateListing, deleteListing, favoriteIds, toggleFavorite,
      confirmPurchase, rejectPurchase, showToast, toast,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
