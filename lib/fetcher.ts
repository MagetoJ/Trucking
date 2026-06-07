import { useAuthStore } from '@/lib/store'

export const authenticatedFetcher = async (url: string) => {
  const token = useAuthStore.getState().token;
  
  // Guard clause: Avoid placing a broken call onto the browser request stack if unauthenticated
  if (!token) {
    throw new Error('No active user authorization credentials found.');
  }

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error encountered. Status: ${res.status}`);
  }

  return res.json();
};