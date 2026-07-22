// Utility helper for safe API calls with JSON verification
export async function safeJsonFetch(url, options = {}) {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const data = await res.json();
      return { ok: res.ok, status: res.status, data };
    } else {
      const text = await res.text();
      console.warn(`Non-JSON response received from ${url}:`, text.substring(0, 150));
      return { 
        ok: false, 
        status: res.status, 
        error: 'Server returned HTML response instead of JSON. Ensure backend API server is running.' 
      };
    }
  } catch (err) {
    console.error(`Fetch error for ${url}:`, err);
    return { ok: false, status: 0, error: err.message || 'Network error' };
  }
}
