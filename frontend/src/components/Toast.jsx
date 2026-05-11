// ── Toast notification ────────────────────────────────────────────────────────
// A fixed-position overlay that slides up from the bottom-right corner when
// AppContext.showToast() is called from anywhere in the app.
//
// The component is purely display-driven: it reads toast.visible from context
// and adds/removes the CSS .show class, which triggers the CSS slide-up
// transition defined in index.css (.toast-reloop / .toast-reloop.show).
//
// It does NOT manage its own timer; that responsibility belongs to showToast()
// in AppContext so the toast auto-hides 2.8 s after it appears.

import { useApp } from '../context/AppContext';

export default function Toast() {
  const { toast } = useApp(); // { msg, icon, visible }

  return (
    // .toast-reloop is always in the DOM (hidden by default via opacity:0 +
    // transform:translateY(80px)). The .show class makes it visible.
    <div className={`toast-reloop${toast.visible ? ' show' : ''}`}>
      <span>{toast.icon}</span>
      <span>{toast.msg}</span>
    </div>
  );
}
