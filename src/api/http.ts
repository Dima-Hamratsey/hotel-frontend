import { API_URL } from './config';
import { tokenStorage } from './tokenStorage';

/** Помилка запиту до API з HTTP-статусом та повідомленням із поля `detail`. */
export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export const UNAUTHORIZED_EVENT = 'api:unauthorized';

type QueryValue = string | number | boolean | null | undefined | Array<string | number>;
export type Query = Record<string, QueryValue>;

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  query?: Query;
  signal?: AbortSignal;
}

function buildUrl(path: string, query?: Query): string {
  const url = new URL(`${API_URL}${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === '') continue;
      if (Array.isArray(value)) {
        if (value.length) url.searchParams.set(key, value.join(','));
      } else {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

interface ValidationIssue {
  loc?: Array<string | number>;
  msg?: string;
}

/** Витягує людиночитне повідомлення з тіла помилки FastAPI. */
function extractDetail(payload: unknown, status: number): string {
  if (payload && typeof payload === 'object' && 'detail' in payload) {
    const detail = (payload as { detail: unknown }).detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) {
      const parts = (detail as ValidationIssue[])
        .map((d) => {
          const field = d.loc?.filter((p) => p !== 'body' && p !== 'query').join('.');
          return field ? `${field}: ${d.msg ?? ''}` : (d.msg ?? '');
        })
        .filter(Boolean);
      if (parts.length) return `Помилка валідації — ${parts.join('; ')}`;
    }
  }
  if (status === 401) return 'Потрібна авторизація';
  if (status === 403) return 'Недостатньо прав доступу';
  if (status === 404) return 'Ресурс не знайдено';
  if (status >= 500) return 'Помилка сервера. Спробуйте пізніше';
  return `Помилка запиту (${status})`;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, query, signal } = options;
  const headers: Record<string, string> = { Accept: 'application/json' };
  const token = tokenStorage.get();
  if (token) headers.Authorization = `Bearer ${token}`;

  let payload: BodyInit | undefined;
  if (body instanceof FormData) {
    payload = body;
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), { method, headers, body: payload, signal });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err;
    throw new ApiError(0, 'Не вдалося з’єднатися з сервером. Перевірте, чи запущено бекенд.');
  }

  if (response.status === 204) return undefined as T;

  const text = await response.text();
  let data: unknown = undefined;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    if (response.status === 401 && token) {
      window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT));
    }
    throw new ApiError(response.status, extractDetail(data, response.status));
  }
  return data as T;
}

/** Тонка обгортка над fetch: додає Bearer-токен, серіалізує JSON, перетворює помилки на ApiError. */
export const http = {
  get: <T>(path: string, query?: Query, signal?: AbortSignal) => request<T>(path, { query, signal }),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body }),
  put: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PUT', body }),
  delete: <T = void>(path: string) => request<T>(path, { method: 'DELETE' }),
};

export function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return 'Невідома помилка';
}
