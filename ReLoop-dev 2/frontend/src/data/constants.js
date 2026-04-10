// ── Frontend UI constants ──────────────────────────────────────────────────────
// These are purely presentational mappings used by components to pick
// emoji and gradient backgrounds by category. They do not come from the
// backend — they are fixed UI decisions that live in the frontend.

// EMOJI: maps a listing category to its display emoji.
export const EMOJI = {
  Furniture: '🛋️',
  Textbooks: '📚',
  Electronics: '💻',
  Clothing: '👗',
  Appliances: '🍳',
  Sports: '🚴',
  Other: '📦',
};

// IMG_BG: maps a listing category to a CSS gradient string used as the
// card image placeholder background when no real photo has been uploaded.
export const IMG_BG = {
  Furniture: 'linear-gradient(135deg,#f5ede2,#e8d8c4)',
  Textbooks: 'linear-gradient(135deg,#edf5e8,#cce4c4)',
  Electronics: 'linear-gradient(135deg,#e8f0f5,#ccdcec)',
  Clothing: 'linear-gradient(135deg,#f5e8f5,#e0c8e0)',
  Appliances: 'linear-gradient(135deg,#f5f0e8,#e8e0cc)',
  Sports: 'linear-gradient(135deg,#e8f5e8,#c4e0c4)',
  Other: 'linear-gradient(135deg,#f0f0f0,#e0e0e0)',
};
