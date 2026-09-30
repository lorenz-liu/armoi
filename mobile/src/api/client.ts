/**
 * Thin fetch wrapper: base URL, timeout, retry-with-backoff on transport
 * failures, Bearer auth, and a typed error every caller can branch on.
 */

import { API } from '@/config';

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly detail: string,
    readonly url: string,
  ) {
    super(detail);
    this.name = 'ApiError';
  }

  /** True when the request never reached the server. */
  get isNetworkError(): boolean {
    return this.status === 0;
  }
}

type AuthHandlers = {
  getAccessToken: () => Promise<string | null>;
  refreshAccessToken: () => Promise<string | null>;
  onUnauthorized: () => Promise<void>;
};

let authHandlers: AuthHandlers | null = null;

/** Wired once by AuthProvider so the client stays free of a circular import. */
export function setAuthHandlers(handlers: AuthHandlers | null): void {
  authHandlers = handlers;
}

export const apiUrl = (path: string): string => `${API.baseUrl}${API.prefix}${path}`;

/** Media paths come back from the API already rooted at `/media`, or as absolute URLs. */
export const mediaUrl = (path: string): string =>
  path.startsWith('http') ? path : `${API.baseUrl}${path}`;

export function buildQuery(params: Record<string, unknown> | undefined): string {
  if (!params) return '';
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    // Array values repeat the key, which is what FastAPI's `list[T]` expects.
    if (Array.isArray(value)) {
      for (const entry of value) search.append(key, String(entry));
    } else {
      search.append(key, String(value));
    }
  }
  const query = search.toString();
  return query ? `?${query}` : '';
}

async function readDetail(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { detail?: unknown };
    if (typeof body.detail === 'string') return body.detail;
    if (Array.isArray(body.detail)) {
      return body.detail
        .map((entry: { msg?: string }) => entry?.msg ?? '')
        .filter(Boolean)
        .join('; ');
    }
  } catch {
    // fall through to the status text
  }
  return response.statusText || `HTTP ${response.status}`;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function once(url: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), API.timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function mergeHeaders(init: RequestInit, token: string | null): Headers {
  const headers = new Headers(init.headers);
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return headers;
}

export async function request<T>(
  path: string,
  init: RequestInit = {},
  query?: Record<string, unknown>,
): Promise<T> {
  const url = apiUrl(path) + buildQuery(query);
  let lastError: unknown;
  let token = authHandlers ? await authHandlers.getAccessToken() : null;
  let didRefresh = false;

  for (let attempt = 0; attempt <= API.retries; attempt += 1) {
    try {
      const response = await once(url, { ...init, headers: mergeHeaders(init, token) });
      if (response.status === 401 && authHandlers && !didRefresh) {
        didRefresh = true;
        token = await authHandlers.refreshAccessToken();
        if (token) {
          attempt -= 1;
          continue;
        }
        await authHandlers.onUnauthorized();
        throw new ApiError(401, await readDetail(response), url);
      }
      if (!response.ok) {
        // 4xx are the caller's problem; retrying cannot change the answer.
        throw new ApiError(response.status, await readDetail(response), url);
      }
      if (response.status === 204) return undefined as T;
      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      lastError = error;
      if (attempt < API.retries) await sleep(API.retryBackoffMs * 2 ** attempt);
    }
  }

  throw new ApiError(0, lastError instanceof Error ? lastError.message : 'Network error', url);
}

export const json = {
  get: <T,>(path: string, query?: Record<string, unknown>) => request<T>(path, {}, query),
  post: <T,>(path: string, body: unknown) =>
    request<T>(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
  put: <T,>(path: string, body: unknown) =>
    request<T>(path, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
  delete: (path: string) => request<void>(path, { method: 'DELETE' }),
};

/** Multipart upload; the boundary is left to the runtime. */
export async function upload<T>(path: string, form: FormData): Promise<T> {
  return request<T>(path, { method: 'POST', body: form });
}
