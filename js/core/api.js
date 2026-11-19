const API_BASE_URL = window.MEDTRIAGE_API_URL || 'http://localhost:8080';

function getToken() {
  return localStorage.getItem('medtriage_token');
}

function setToken(token) {
  localStorage.setItem('medtriage_token', token);
}

function clearSession() {
  localStorage.removeItem('medtriage_token');
  localStorage.removeItem('medtriage_user');
}

function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

function isTokenExpired(token) {
  const payload = parseJwt(token);
  if (!payload || !payload.exp) return true;
  return Date.now() >= payload.exp * 1000;
}

async function apiRequest(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    if (isTokenExpired(token)) {
      clearSession();
      window.location.href = 'index.html?expired=1';
      throw new Error('Sessão expirada. Faça login novamente.');
    }
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  if (response.status === 401) {
    clearSession();
    const paginaAtual = window.location.pathname.substring(window.location.pathname.lastIndexOf('/') + 1);
    if (paginaAtual !== 'index.html' && paginaAtual !== '') {
      window.location.href = 'index.html?expired=1';
    }
  }

  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { response: text };
  }

  if (!response.ok) {
    const msg = (data && (data.response || data.message || data.error)) || `Erro HTTP ${response.status}`;
    throw new Error(msg);
  }

  return data;
}

window.MedTriageAPI = {
  API_BASE_URL,
  getToken,
  setToken,
  clearSession,
  parseJwt,
  isTokenExpired,
  request: apiRequest
};
