'use client';

export function saveSession({ access_token, user }) {
  localStorage.setItem('access_token', access_token);
  localStorage.setItem('user', JSON.stringify(user));
}

export function getCurrentUser() {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('user');
  return raw ? JSON.parse(raw) : null;
}

export function logout() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('user');
  window.location.href = '/login';
}

export function isLoggedIn() {
  return !!(typeof window !== 'undefined' && localStorage.getItem('access_token'));
}
