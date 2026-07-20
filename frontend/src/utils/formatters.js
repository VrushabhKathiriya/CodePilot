// ─── Date formatters ─────────────────────────────────────────────────────────

export function formatDate(dateStr, opts = {}) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', ...opts,
  });
}

export function formatRelativeTime(dateStr) {
  if (!dateStr) return '—';
  const now = new Date();
  const then = new Date(dateStr);
  const diff = now - then; // ms

  const s = Math.floor(diff / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const day = Math.floor(h / 24);
  if (day < 30) return `${day}d ago`;
  const mo = Math.floor(day / 30);
  if (mo < 12) return `${mo}mo ago`;
  return `${Math.floor(mo / 12)}y ago`;
}

export function formatContestDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

// ─── Number formatters ────────────────────────────────────────────────────────

export function formatNumber(n) {
  if (n == null) return '—';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export function formatRating(rating) {
  if (rating == null || rating === 0) return 'N/A';
  return rating.toString();
}

export function formatPercent(val, total) {
  if (!total) return '0%';
  return `${Math.round((val / total) * 100)}%`;
}

export function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

// ─── String formatters ────────────────────────────────────────────────────────

export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function truncate(str, maxLen = 60) {
  if (!str) return '';
  return str.length > maxLen ? str.slice(0, maxLen) + '…' : str;
}

export function slugify(str) {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
}

// ─── Color helpers ────────────────────────────────────────────────────────────

export function getRatingColor(rating, platform = 'codeforces') {
  if (platform === 'codeforces') {
    if (rating >= 2600) return '#AA0000';
    if (rating >= 2400) return '#FF0000';
    if (rating >= 2100) return '#FF8C00';
    if (rating >= 1900) return '#AA00AA';
    if (rating >= 1600) return '#0000FF';
    if (rating >= 1400) return '#03A89E';
    if (rating >= 1200) return '#008000';
    return '#808080';
  }
  if (platform === 'leetcode') {
    if (rating >= 2800) return '#FF0000';
    if (rating >= 2500) return '#FF8C00';
    if (rating >= 2200) return '#FFD700';
    return '#A0A0A0';
  }
  return '#9B9B9B';
}

export function getCFRankName(rating) {
  if (rating >= 3000) return 'Legendary GM';
  if (rating >= 2600) return 'International GM';
  if (rating >= 2400) return 'Grandmaster';
  if (rating >= 2300) return 'International Master';
  if (rating >= 2100) return 'Master';
  if (rating >= 1900) return 'Candidate Master';
  if (rating >= 1600) return 'Expert';
  if (rating >= 1400) return 'Specialist';
  if (rating >= 1200) return 'Pupil';
  if (rating >= 0)    return 'Newbie';
  return 'Unrated';
}
