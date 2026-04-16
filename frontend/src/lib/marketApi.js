import { apiRequest } from './api';
import { getAuthToken } from './portfolioApi';

export function searchMarketAssets(query, options = {}) {
  const params = new URLSearchParams({ q: query });
  return apiRequest(
    `/api/market/search?${params.toString()}`,
    {
      method: 'GET',
      ...options,
    },
    getAuthToken()
  );
}

export function getMarketQuotes(symbols = [], options = {}) {
  const params = new URLSearchParams({ symbols: symbols.join(',') });
  return apiRequest(
    `/api/market/quotes?${params.toString()}`,
    {
      method: 'GET',
      ...options,
    },
    getAuthToken()
  );
}

export function getAssetHistory(symbol, options = {}) {
  const params = new URLSearchParams();
  if (options.range) {
    params.set('range', options.range);
  }
  if (options.interval) {
    params.set('interval', options.interval);
  }

  const query = params.toString();
  return apiRequest(
    `/api/market/${encodeURIComponent(symbol)}/history${query ? `?${query}` : ''}`,
    {
      method: 'GET',
      ...options,
    },
    getAuthToken()
  );
}
