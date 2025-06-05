export function getImageUrl(path: string) {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${API_URL}${path.startsWith('/') ? '' : '/'}${path}`;
} 