// ── Entry point ──────────────────────────────────────────────────────────────
// Vite renders the React tree into the <div id="root"> in index.html.
// BrowserRouter is mounted here (outermost level) so every component in the
// tree can use React Router hooks (useNavigate, NavLink, etc.) without having
// to wrap each one individually.

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

// Bootstrap CSS must be imported before our custom index.css so that our
// overrides and design-token rules win when specificity is equal.
import 'bootstrap/dist/css/bootstrap.min.css'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  // StrictMode renders components twice in development to surface side-effects.
  <React.StrictMode>
    {/* BrowserRouter enables client-side routing via the HTML5 history API. */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
