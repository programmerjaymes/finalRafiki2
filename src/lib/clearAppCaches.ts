/**
 * Clears browser caches (Cache API, service workers) and asks the server
 * to revalidate Next.js data cache tags for public listings.
 */
export async function clearAppCaches(): Promise<void> {
  if (typeof window === 'undefined') return;

  if ('caches' in window) {
    const keys = await caches.keys();
    await Promise.all(keys.map((key) => caches.delete(key)));
  }

  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((reg) => reg.unregister()));
  }

  try {
    await fetch('/api/cache/revalidate', {
      method: 'POST',
      cache: 'no-store',
    });
  } catch {
    // Server revalidation is best-effort; browser caches are still cleared.
  }
}
