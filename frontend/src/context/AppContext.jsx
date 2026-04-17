// ── Global application state ──────────────────────────────────────────────────
// AppContext is the single source of truth for data shared across components:
//   • listings   – marketplace items fetched from GET /api/listings
//   • housing    – neighbourhood data fetched from GET /api/housing
//   • savedIds   – Set of listing IDs the user has heart-saved, persisted via /api/saves
//   • toast      – current notification state { msg, icon, visible }
//
// On mount, AppProvider fetches listings, housing, and saves in parallel from
// the Express backend (localhost:5002).

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

  // savedIds: Set of numeric IDs the user has saved, synced with /api/saves.
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
        const [listRes, housingRes, savesRes] = await Promise.all([
          fetch(`${API}/listings`),
          fetch(`${API}/housing`),
          fetch(`${API}/saves`),
        ]);

        const [listData, housingData, savesData] = await Promise.all([
          listRes.json(),
          housingRes.json(),
          savesRes.json(),
        ]);

        setListings(listData);
        setHousing(housingData);
        setSavedIds(new Set(savesData));
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

  // toggleSave: persist the save/unsave to /api/saves, then sync local state.
  const toggleSave = useCallback(async (id) => {
    const isSaved = savedIds.has(id);
    try {
      await fetch(`${API}/saves/${id}`, { method: isSaved ? 'DELETE' : 'POST' });
      setSavedIds(prev => {
        const next = new Set(prev);
        if (isSaved) { next.delete(id); } else { next.add(id); }
        return next;
      });
      showToast(isSaved ? 'Removed from saved' : 'Saved!', isSaved ? '🗑️' : '❤️');
    } catch (err) {
      console.error('Failed to toggle save:', err);
      showToast('Could not update saved', '⚠️');
    }
  }, [savedIds, showToast]);

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

  // updateListing: PATCH /api/listings/:id then sync local state with the returned object.
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

  return (
    <AppContext.Provider value={{
      listings, housing, loading,
      addListing, updateListing, deleteListing, savedIds, toggleSave, showToast, toast,
    }}>
      {children}
    </AppContext.Provider>
  );
}

// useApp: convenience hook so consumers don't need to import useContext too.
export function useApp() {
  return useContext(AppContext);
}
