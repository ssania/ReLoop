// ── Global application state ──────────────────────────────────────────────────
// AppContext is the single source of truth for data shared across components:
//   • listings   – marketplace items fetched from GET /api/listings
//   • housing    – neighbourhood data fetched from GET /api/housing
//   • savedIds   – Set of listing IDs the user has heart-saved (client-only)
//   • toast      – current notification state { msg, icon, visible }
//
// On mount, AppProvider fetches both /api/listings and /api/housing from the
// Express backend (localhost:5002). New listings are POST-ed to the backend
// and then prepended to local state so the UI updates instantly.

import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

// Base URL for all API calls. In production this would be an env variable
// pointing to the deployed backend (e.g. https://api.reloop.com).
const API = 'http://localhost:5002/api';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // listings: fetched from the backend; starts empty until the first fetch resolves.
  const [listings, setListings] = useState([]);

  // housing: fetched from the backend; used by the Housing page.
  const [housing, setHousing] = useState([]);

  // loading: true while the initial data fetch is in flight.
  const [loading, setLoading] = useState(true);

  // savedIds: client-side only Set of numeric IDs the user has saved.
  // When auth + backend are ready this would persist to the DB per user.
  const [savedIds, setSavedIds] = useState(new Set());

  // toast: drives the <Toast /> overlay component.
  const [toast, setToast] = useState({ msg: '', icon: '✓', visible: false });

  // useRef stores the timer ID without triggering re-renders on change.
  const toastTimer = useRef(null);

  // ── Initial data fetch ───────────────────────────────────────────────────────
  // Runs once on mount. Fetches listings and housing in parallel so both are
  // ready at roughly the same time.
  useEffect(() => {
    async function fetchData() {
      try {
        const [listRes, housingRes] = await Promise.all([
          fetch(`${API}/listings`),
          fetch(`${API}/housing`),
        ]);

        // Parse both JSON responses concurrently.
        const [listData, housingData] = await Promise.all([
          listRes.json(),
          housingRes.json(),
        ]);

        setListings(listData);
        setHousing(housingData);
      } catch (err) {
        // If the backend is not running, log the error and leave arrays empty.
        // The UI will show empty states instead of crashing.
        console.error('Failed to fetch data from backend:', err);
      } finally {
        // Always clear the loading flag so the UI renders even on error.
        setLoading(false);
      }
    }

    fetchData();
  }, []); // empty dep array = run once on mount

  // showToast: display a message for 2.8 s then hide.
  // clearTimeout before setting prevents stale timers on rapid calls.
  const showToast = useCallback((msg, icon = '✓') => {
    setToast({ msg, icon, visible: true });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, visible: false })), 2800);
  }, []);

  // toggleSave: add or remove an ID from the savedIds Set.
  // new Set(prev) clones so React detects the reference change.
  const toggleSave = useCallback((id) => {
    setSavedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        showToast('Removed from saved', '🗑️');
      } else {
        next.add(id);
        showToast('Saved!', '❤️');
      }
      return next;
    });
  }, [showToast]);

  // addListing: POST the new listing to the backend, then prepend the returned
  // object (which has a server-assigned id) to local state.
  const addListing = useCallback(async (item) => {
    try {
      const res = await fetch(`${API}/listings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      const created = await res.json(); // backend returns the created listing with its id
      // Prepend so it appears at the top of the marketplace list immediately.
      setListings(prev => [created, ...prev]);
    } catch (err) {
      console.error('Failed to create listing:', err);
      showToast('Could not save listing', '⚠️');
    }
  }, [showToast]);

  // updateListing: replace a listing in local state by id with the edited fields.
  // When MongoDB is connected this will also PATCH /api/listings/:id.
  const updateListing = useCallback((id, changes) => {
    setListings(prev => prev.map(l => l.id === id ? { ...l, ...changes } : l));
  }, []);

  // deleteListing: DELETE /api/listings/:id then remove from local state.
  const deleteListing = useCallback(async (id) => {
    try {
      await fetch(`${API}/listings/${id}`, { method: 'DELETE' });
      setListings(prev => prev.filter(l => l.id !== id));
      // Also remove from savedIds if it was saved.
      setSavedIds(prev => { const next = new Set(prev); next.delete(id); return next; });
    } catch (err) {
      console.error('Failed to delete listing:', err);
      showToast('Could not delete listing', '⚠️');
    }
  }, [showToast]);

  // addHousingReview: POST /api/housing/:areaId/reviews and merge the response
  // into local housing state so HousingDetailModal updates without a refetch.
  // The backend returns { review, averageRating, reviewCount } and also keeps
  // the canonical totals on the housing area itself.
  const addHousingReview = useCallback(async (areaId, { reviewerName, stars, comment }) => {
    try {
      const res = await fetch(`${API}/housing/${areaId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewer: { name: reviewerName }, stars, comment }),
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
  }, [showToast]);

  return (
    <AppContext.Provider value={{
      listings, housing, loading,
      addListing, updateListing, deleteListing, addHousingReview,
      savedIds, toggleSave, showToast, toast,
    }}>
      {children}
    </AppContext.Provider>
  );
}

// useApp: convenience hook so consumers don't need to import useContext too.
export function useApp() {
  return useContext(AppContext);
}
