// api/health.js - Health check endpoint
export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.setHeader('Content-Type', 'application/json');

  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET method
  if (req.method !== 'GET') {
    res.status(405).json({
      error: 'Method not allowed',
      allowedMethods: ['GET', 'OPTIONS']
    });
    return;
  }

  // Return health status
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: 'Vercel Serverless',
    cors: 'enabled',
    authorizationEnabled: false,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: '2.0.0'
  });
}