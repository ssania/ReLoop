// ── Global application state ──────────────────────────────────────────────────
// AppContext is the single source of truth for data that multiple components
// need to share:
//   • listings   – array of marketplace items (seeded from mockData, new items prepended)
//   • savedIds   – Set of listing IDs the user has heart-saved
//   • toast      – current notification state { msg, icon, visible }
//
// All mutations are exposed as stable callbacks (useCallback) so child
// components won't re-render just because the parent re-renders.

import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { initialListings } from '../data/mockData';

// Create the context with null as the default so useApp() can detect misuse
// (calling useApp() outside of AppProvider throws a descriptive error).
const AppContext = createContext(null);

export function AppProvider({ children }) {
  // listings: starts from mock data; new items are prepended via addListing.
  const [listings, setListings] = useState(initialListings);

  // savedIds: a Set of numeric IDs. We always create a new Set on mutation so
  // React detects the reference change and triggers a re-render.
  const [savedIds, setSavedIds] = useState(new Set());

  // toast: controls the floating notification bar rendered by <Toast />.
  const [toast, setToast] = useState({ msg: '', icon: '✓', visible: false });

  // useRef keeps the timer ID across renders without causing extra re-renders.
  const toastTimer = useRef(null);

  // showToast: display a message for 2.8 s then hide it.
  // clearTimeout before setting a new timer handles rapid successive calls
  // (e.g. quickly saving/unsaving an item) without leaving stale timers.
  const showToast = useCallback((msg, icon = '✓') => {
    setToast({ msg, icon, visible: true });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, visible: false })), 2800);
  }, []);

  // toggleSave: add or remove an ID from the savedIds Set.
  // Using the functional updater form of setSavedIds ensures we always read
  // the latest Set even if multiple toggles fire in quick succession.
  const toggleSave = useCallback((id) => {
    setSavedIds(prev => {
      const next = new Set(prev); // clone to trigger re-render
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

  // addListing: prepend a newly created listing so it appears first in the list.
  const addListing = useCallback((item) => {
    setListings(prev => [item, ...prev]);
  }, []);

  return (
    // Expose all state and mutators through context value.
    <AppContext.Provider value={{ listings, addListing, savedIds, toggleSave, showToast, toast }}>
      {children}
    </AppContext.Provider>
  );
}

// useApp: convenience hook – import this instead of useContext(AppContext)
// directly in every consumer component.
export function useApp() {
  return useContext(AppContext);
}
