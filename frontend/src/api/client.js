const EVENTOS_URL = import.meta.env.VITE_EVENTOS_URL || 'http://localhost:3000';
const MASTER_URL = import.meta.env.VITE_MASTER_URL || 'http://localhost:8080';
const RESERVAS_URL = import.meta.env.VITE_RESERVAS_URL || 'http://localhost:3001';

const ACCESS_TOKEN_KEY = 'tickgo.accessToken';
const REFRESH_TOKEN_KEY = 'tickgo.refreshToken';

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens({ accessToken, refreshToken }) {
  if (accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

async function extractErrorMessage(response) {
  try {
    const data = await response.json();
    const message = data?.message ?? `Error ${response.status}`;
    return Array.isArray(message) ? message.join(', ') : message;
  } catch {
    return `Error ${response.status}`;
  }
}

async function tryRefreshSession() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  const response = await fetch(`${MASTER_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${refreshToken}` },
  });
  if (!response.ok) {
    clearTokens();
    return false;
  }
  const data = await response.json();
  setTokens(data);
  return true;
}

async function request(baseUrl, path, { method = 'GET', body, auth = false, retry = true } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth) {
    const token = getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401 && auth && retry) {
    const refreshed = await tryRefreshSession();
    if (refreshed) {
      return request(baseUrl, path, { method, body, auth, retry: false });
    }
  }

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response));
  }

  if (response.status === 204) return null;
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

export const eventosApi = {
  get: (path) => request(EVENTOS_URL, path),
  post: (path, body) => request(EVENTOS_URL, path, { method: 'POST', body }),
  patch: (path, body) => request(EVENTOS_URL, path, { method: 'PATCH', body }),
  delete: (path) => request(EVENTOS_URL, path, { method: 'DELETE' }),
};

export const masterApi = {
  get: (path) => request(MASTER_URL, path, { auth: true }),
  post: (path, body, { auth = true } = {}) => request(MASTER_URL, path, { method: 'POST', body, auth }),
  patch: (path, body) => request(MASTER_URL, path, { method: 'PATCH', body, auth: true }),
  delete: (path) => request(MASTER_URL, path, { method: 'DELETE', auth: true }),
};

export const reservasApi = {
  get: (path) => request(RESERVAS_URL, path, { auth: true }),
  post: (path, body) => request(RESERVAS_URL, path, { method: 'POST', body, auth: true }),
  getBlob: async (path) => {
    const token = getAccessToken();
    const response = await fetch(`${RESERVAS_URL}${path}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error(await extractErrorMessage(response));
    return response.blob();
  },
};
