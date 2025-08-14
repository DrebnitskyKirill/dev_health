const isBrowser = typeof window !== 'undefined';
const isDev = isBrowser && window.location && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
export const API_BASE_URL: string = (isBrowser && (window as any).__API_BASE_URL__) || (isDev ? 'http://localhost:3001/api' : '/api');

