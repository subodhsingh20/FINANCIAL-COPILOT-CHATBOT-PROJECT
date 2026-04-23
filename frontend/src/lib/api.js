const runtimeConfig = typeof window !== 'undefined' ? window.__APP_CONFIG__ : undefined;
const normalizedBaseUrl = (
  import.meta.env.VITE_API_BASE_URL
  || import.meta.env.VITE_BACKEND_URL
  || import.meta.env.VITE_API_URL
  || runtimeConfig?.apiBaseUrl
  || ''
).replace(/\/$/, '');

const isLocalhost = typeof window !== 'undefined'
  && ['localhost', '127.0.0.1'].includes(window.location.hostname);

if (!normalizedBaseUrl && !import.meta.env.DEV && !isLocalhost) {
  console.warn(
    'Missing VITE_API_BASE_URL for a production build. Set the backend URL in Amplify so API requests do not target the frontend host.'
  );
}

export function apiUrl(path) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return normalizedBaseUrl ? `${normalizedBaseUrl}${normalizedPath}` : normalizedPath;
}

export async function apiRequest(path, options = {}, token) {
  if (!normalizedBaseUrl && !import.meta.env.DEV && !isLocalhost) {
    throw new Error(
      'The frontend was deployed without VITE_API_BASE_URL. Configure the backend URL in Amplify and redeploy.'
    );
  }

  const response = await fetch(apiUrl(path), {
    ...options,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || 'Request failed');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}
