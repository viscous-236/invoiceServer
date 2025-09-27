// api/cors-test.js - CORS testing endpoint
export default function handler(req, res) {
  // Set CORS headers  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control');
  res.setHeader('Content-Type', 'application/json');

  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    console.log('CORS preflight request received');
    res.status(200).end();
    return;
  }

  console.log('CORS test request:', {
    method: req.method,
    url: req.url,
    origin: req.headers.origin,
    userAgent: req.headers['user-agent']
  });

  // Return CORS test response
  res.status(200).json({
    message: 'CORS test successful',
    method: req.method,
    origin: req.headers.origin || 'no-origin',
    userAgent: req.headers['user-agent'] || 'no-user-agent',
    timestamp: new Date().toISOString(),
    requestHeaders: req.headers,
    corsEnabled: true
  });
}