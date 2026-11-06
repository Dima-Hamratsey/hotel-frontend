/** Базова адреса бекенду. Береться з VITE_API_URL, за замовчуванням — локальний FastAPI. */
export const API_URL: string = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/+$/, '');

/** Перетворює відносний шлях до файлу (`/static/uploads/x.svg`) на абсолютний URL. */
export function mediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}
