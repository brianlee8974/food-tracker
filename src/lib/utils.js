// Generate a unique ID for new items
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// Calculate days until a given date string (YYYY-MM-DD)
// Returns null if no date provided, negative if expired
export function daysUntil(dateStr) {
  if (!dateStr) return null;
  const expiry = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
}

// Return a CSS class and label for an expiry date
export function expiryBadge(dateStr) {
  const days = daysUntil(dateStr);
  if (days === null) return { className: 'badge-none', text: 'No date' };
  if (days < 0) return { className: 'badge-expired', text: 'Expired' };
  if (days === 0) return { className: 'badge-expired', text: 'Today' };
  if (days <= 3) return { className: 'badge-hard-warning', text: `${days}d left` };
  if (days <= 7) return { className: 'badge-warning', text: `${days}d left` };
  return { className: 'badge-fresh', text: `${days}d left` };
}

// Format a date string for display
export function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
