const http = require('http');
const fs = require('fs');
const path = require('path');
const {
  validateBookingPayload,
  sendBookingToTelegram,
  getCorsHeaders
} = require('./lib/telegram-send');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2'
};

function sendJson(res, statusCode, payload, headers = {}) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    ...headers
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8');
        resolve(raw ? JSON.parse(raw) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

async function handleTelegramApi(req, res) {
  const corsHeaders = getCorsHeaders(req.headers.origin);

  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders);
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    sendJson(res, 405, { ok: false, error: 'Method not allowed' }, corsHeaders);
    return;
  }

  try {
    const body = await readBody(req);
    const validation = validateBookingPayload(body);

    if (!validation.ok) {
      sendJson(res, 400, { ok: false, error: validation.error }, corsHeaders);
      return;
    }

    await sendBookingToTelegram(validation.data);
    sendJson(res, 200, { ok: true }, corsHeaders);
  } catch (error) {
    if (error.code === 'NOT_CONFIGURED') {
      sendJson(res, 500, { ok: false, error: 'Bot not configured' }, corsHeaders);
      return;
    }

    console.error('Telegram send error:', error.details || error.message);
    sendJson(res, 502, { ok: false, error: 'Failed to send message' }, corsHeaders);
  }
}

function serveStatic(req, res) {
  let urlPath = decodeURIComponent(new URL(req.url, `http://${req.headers.host}`).pathname);
  if (urlPath.endsWith('/')) urlPath += 'index.html';
  if (urlPath === '/api/telegram') return false;

  const filePath = path.normalize(path.join(ROOT, urlPath));
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end('Forbidden');
    return true;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      if (urlPath !== '/index.html') {
        const indexPath = path.join(ROOT, 'index.html');
        fs.readFile(indexPath, (indexError, indexData) => {
          if (indexError) {
            res.writeHead(404);
            res.end('Not found');
            return;
          }
          res.writeHead(200, { 'Content-Type': MIME_TYPES['.html'] });
          res.end(indexData);
        });
        return;
      }

      res.writeHead(404);
      res.end('Not found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    res.end(data);
  });

  return true;
}

const server = http.createServer(async (req, res) => {
  if (req.url.startsWith('/api/telegram')) {
    await handleTelegramApi(req, res);
    return;
  }

  serveStatic(req, res);
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
