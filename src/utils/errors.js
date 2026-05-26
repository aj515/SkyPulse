export function classifyApiError(error) {
  if (!navigator.onLine) {
    return { code: 'OFFLINE', message: 'No internet connection' };
  }
  if (error.name === 'CanceledError' || error.name === 'AbortError') {
    return { code: 'ABORTED', message: 'Request was cancelled' };
  }
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout') || error.name === 'TimeoutError') {
    return { code: 'TIMEOUT', message: 'Request timed out — check your connection' };
  }

  const status = error.response?.status;
  const serverCode = error.response?.data?.code;

  if (status === 401 || serverCode === 'UNAUTHORIZED') {
    return { code: 'UNAUTHORIZED', message: 'Invalid API key — check your settings' };
  }
  if (status === 429 || serverCode === 'RATE_LIMITED') {
    return { code: 'RATE_LIMITED', message: 'Rate limit exceeded — try again in a minute' };
  }
  if (serverCode === 'NO_KEY') {
    return { code: 'NO_KEY', message: 'No API key configured on server — add OWM_API_KEY to Vercel env vars' };
  }
  if (status >= 500 || serverCode === 'SERVER_ERROR' || serverCode === 'UPSTREAM_ERROR') {
    return { code: 'SERVER_ERROR', message: 'Weather service is temporarily unavailable' };
  }

  return { code: 'UNKNOWN', message: 'Something went wrong — try again' };
}
