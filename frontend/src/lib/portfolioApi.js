import { apiRequest } from './api';

export function getAuthToken() {
  return localStorage.getItem('token') || '';
}

export function fetchCurrentPortfolio() {
  return apiRequest('/api/portfolio/me', { method: 'GET' }, getAuthToken());
}

export function fetchPortfolio(userId) {
  return apiRequest(`/api/portfolio/${encodeURIComponent(userId)}`, { method: 'GET' }, getAuthToken());
}

export function createPortfolio(payload) {
  return apiRequest('/api/portfolio', { method: 'POST', body: payload }, getAuthToken());
}

export function updatePortfolio(id, payload) {
  return apiRequest(`/api/portfolio/${encodeURIComponent(id)}`, { method: 'PUT', body: payload }, getAuthToken());
}

export function deletePortfolio(id) {
  return apiRequest(`/api/portfolio/${encodeURIComponent(id)}`, { method: 'DELETE' }, getAuthToken());
}

export function analyzePortfolio(payload) {
  return apiRequest('/api/analyze', { method: 'POST', body: payload }, getAuthToken());
}
