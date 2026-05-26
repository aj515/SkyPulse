// Vercel serverless proxy — keeps OWM_API_KEY server-side and never bundled into client JS.
// Frontend calls /api/owm?endpoint=/data/3.0/onecall&lat=...&lon=... etc.
export default async function handler(req, res) {
  const { endpoint, ...params } = req.query;

  if (!endpoint) {
    return res.status(400).json({ error: 'Missing endpoint param', code: 'BAD_REQUEST' });
  }

  // OWM_API_KEY (no VITE_ prefix) is never bundled into client JS
  const apiKey = process.env.OWM_API_KEY;
  if (!apiKey || apiKey === 'demo_key_replace_me' || apiKey === 'your_openweathermap_api_key_here') {
    return res.status(503).json({ error: 'API key not configured on server', code: 'NO_KEY' });
  }

  const url = new URL(`https://api.openweathermap.org${endpoint}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  url.searchParams.set('appid', apiKey);

  try {
    const upstream = await fetch(url.toString(), {
      signal: AbortSignal.timeout(10000),
    });
    const data = await upstream.json();

    if (!upstream.ok) {
      const code =
        upstream.status === 401 ? 'UNAUTHORIZED' :
        upstream.status === 429 ? 'RATE_LIMITED' :
        'SERVER_ERROR';
      return res.status(upstream.status).json({ error: data.message || 'Upstream error', code });
    }

    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=60');
    return res.status(200).json(data);
  } catch (err) {
    const isTimeout = err.name === 'TimeoutError';
    return res.status(504).json({
      error: isTimeout ? 'Upstream timed out' : 'Failed to reach weather service',
      code: isTimeout ? 'TIMEOUT' : 'UPSTREAM_ERROR',
    });
  }
}
