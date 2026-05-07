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
import { useAuth } from './AuthContext';

const API = import.meta.env.VITE_API_URL;

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [listings, setListings] = useState([]);
  const [housing, setHousing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [toast, setToast] = useState({ msg: '', icon: '✓', visible: false });
  const toastTimer = useRef(null);

  const { token } = useAuth();

  // Helper to build auth headers for protected requests.
  const authHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }), [token]);

  // Refetch all data whenever the logged-in user changes (login/logout).
  useEffect(() => {
    async function fetchData() {
      try {
        const [listRes, housingRes] = await Promise.all([
          fetch(`${API}/listings`),
          fetch(`${API}/housing`),
        ]);

        const [listData, housingData] = await Promise.all([
          listRes.json(),
          housingRes.json(),
        ]);

        setListings(Array.isArray(listData) ? listData : []);
        setHousing(Array.isArray(housingData) ? housingData : []);

        // Only fetch favorites if logged in.
        if (token) {
          const favRes  = await fetch(`${API}/favorites`, { headers: { Authorization: `Bearer ${token}` } });
          const favData = await favRes.json();
          setFavoriteIds(new Set(favData));
        } else {
          setFavoriteIds(new Set());
        }
      } catch (err) {
        console.error('Failed to fetch data from backend:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [token]);

  const showToast = useCallback((msg, icon = '✓') => {
    setToast({ msg, icon, visible: true });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, visible: false })), 2800);
  }, []);

  const toggleFavorite = useCallback(async (id) => {
    const isFavorited = favoriteIds.has(id);
    try {
      await fetch(`${API}/favorites/${id}`, {
        method: isFavorited ? 'DELETE' : 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
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
  }, [favoriteIds, showToast, token]);

  const addListing = useCallback((item) => {
    setListings(prev => [item, ...prev]);
  }, []);

  const updateListing = useCallback(async (id, changes) => {
    try {
      const res = await fetch(`${API}/listings/${id}`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify(changes),
      });
      const updated = await res.json();
      setListings(prev => prev.map(l => l.id === id ? updated : l));
    } catch (err) {
      console.error('Failed to update listing:', err);
      showToast('Could not update listing', '⚠️');
    }
  }, [showToast, authHeaders]);

  const deleteListing = useCallback(async (id) => {
    try {
      await fetch(`${API}/listings/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setListings(prev => prev.filter(l => l.id !== id));
      setFavoriteIds(prev => { const next = new Set(prev); next.delete(id); return next; });
    } catch (err) {
      console.error('Failed to delete listing:', err);
      showToast('Could not delete listing', '⚠️');
    }
  }, [showToast, token]);

  const confirmPurchase = useCallback(async (id) => {
    try {
      const res = await fetch(`${API}/listings/${id}/confirm`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
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
  }, [showToast, token]);

  const rejectPurchase = useCallback(async (id) => {
    try {
      const res = await fetch(`${API}/listings/${id}/reject`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
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
  }, [showToast, token]);

  const addHousingReview = useCallback(async (areaId, { stars, comment }) => {
    try {
      const res = await fetch(`${API}/housing/${areaId}/reviews`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ stars, comment }),
      });
      if (!res.ok) {
        const { message } = await res.json().catch(() => ({}));
        throw new Error(message || `HTTP ${res.status}`);
      }
      const { review, averageRating, reviewCount } = await res.json();
      setHousing(prev => prev.map(h => h.id === areaId
        ? { ...h, housingReviews: [review, ...h.housingReviews], averageRating, reviewCount }
        : h
      ));
      showToast('Review posted', '⭐');
      return true;
    } catch (err) {
      console.error('Failed to post housing review:', err);
      showToast('Could not post review', '⚠️');
      return false;
    }
  }, [showToast, authHeaders]);

  const editHousingReview = useCallback(async (areaId, reviewId, { stars, comment }) => {
    try {
      const res = await fetch(`${API}/housing/${areaId}/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ stars, comment }),
      });
      if (!res.ok) {
        const { message } = await res.json().catch(() => ({}));
        throw new Error(message || `HTTP ${res.status}`);
      }
      const { review, averageRating, reviewCount } = await res.json();
      setHousing(prev => prev.map(h => h.id === areaId
        ? { ...h, housingReviews: h.housingReviews.map(r => r.id === reviewId ? review : r), averageRating, reviewCount }
        : h
      ));
      showToast('Review updated', '✏️');
      return true;
    } catch (err) {
      console.error('Failed to edit housing review:', err);
      showToast('Could not update review', '⚠️');
      return false;
    }
  }, [showToast, authHeaders]);

  const deleteHousingReview = useCallback(async (areaId, reviewId) => {
    try {
      const res = await fetch(`${API}/housing/${areaId}/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const { message } = await res.json().catch(() => ({}));
        throw new Error(message || `HTTP ${res.status}`);
      }
      const { averageRating, reviewCount } = await res.json();
      setHousing(prev => prev.map(h => h.id === areaId
        ? { ...h, housingReviews: h.housingReviews.filter(r => r.id !== reviewId), averageRating, reviewCount }
        : h
      ));
      showToast('Review deleted', '🗑️');
      return true;
    } catch (err) {
      console.error('Failed to delete housing review:', err);
      showToast('Could not delete review', '⚠️');
      return false;
    }
  }, [showToast, token]);

  return (
    <AppContext.Provider value={{
      listings, housing, loading,
      addListing, updateListing, deleteListing, confirmPurchase, rejectPurchase,
      addHousingReview, editHousingReview, deleteHousingReview,
      favoriteIds, toggleFavorite, showToast, toast,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
