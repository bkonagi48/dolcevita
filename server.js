const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const express = require('express');
const cookieParser = require('cookie-parser');
const multer = require('multer');

const ROOT = __dirname;
const CONTENT_FILE = path.join(ROOT, 'content.json');
const SLOTS_FILE = path.join(ROOT, '.image-slots.state.json');
const BG_FILE = path.join(ROOT, 'assets', 'pano-wide.png');
const SITE_FILE = path.join(ROOT, 'Dolce Vita Bodrum.dc.html');

const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'dolcevita2026';
const PORT = process.env.PORT || 3000;
const COOKIE_NAME = 'dv_admin';

if (!fs.existsSync(SLOTS_FILE)) fs.writeFileSync(SLOTS_FILE, '{}');

const validTokens = new Set();

function timingSafeEqualStr(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function requireAdmin(req, res, next) {
  const token = req.cookies && req.cookies[COOKIE_NAME];
  if (token && validTokens.has(token)) return next();
  res.status(401).json({ ok: false, error: 'unauthorized' });
}

const app = express();
app.use(cookieParser());
app.use(express.json({ limit: '15mb' }));

app.post('/api/login', (req, res) => {
  const { username, password } = req.body || {};
  const userOk = timingSafeEqualStr(username || '', ADMIN_USER);
  const passOk = timingSafeEqualStr(password || '', ADMIN_PASSWORD);
  if (!userOk || !passOk) return res.status(401).json({ ok: false, error: 'invalid credentials' });
  const token = crypto.randomBytes(24).toString('hex');
  validTokens.add(token);
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
  res.json({ ok: true });
});

app.post('/api/logout', (req, res) => {
  const token = req.cookies && req.cookies[COOKIE_NAME];
  if (token) validTokens.delete(token);
  res.clearCookie(COOKIE_NAME);
  res.json({ ok: true });
});

app.get('/api/whoami', (req, res) => {
  const token = req.cookies && req.cookies[COOKIE_NAME];
  res.json({ authenticated: !!(token && validTokens.has(token)) });
});

app.post('/api/content', requireAdmin, (req, res) => {
  const body = req.body;
  if (!body || typeof body !== 'object' || !body.S || !body.bungalowsData) {
    return res.status(400).json({ ok: false, error: 'invalid content shape' });
  }
  fs.writeFile(CONTENT_FILE, JSON.stringify(body, null, 2), (err) => {
    if (err) return res.status(500).json({ ok: false, error: 'write failed' });
    res.json({ ok: true });
  });
});

app.post('/api/write-file', requireAdmin, (req, res) => {
  const { name, content } = req.body || {};
  if (name !== '.image-slots.state.json' || typeof content !== 'string') {
    return res.status(400).json({ ok: false, error: 'invalid write target' });
  }
  fs.writeFile(SLOTS_FILE, content, (err) => {
    if (err) return res.status(500).json({ ok: false, error: 'write failed' });
    res.json({ ok: true });
  });
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = ['image/png', 'image/jpeg', 'image/webp'].includes(file.mimetype);
    cb(ok ? null : new Error('unsupported image type'), ok);
  }
});

app.post('/api/upload-bg', requireAdmin, (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err) return res.status(400).json({ ok: false, error: err.message });
    if (!req.file) return res.status(400).json({ ok: false, error: 'no file' });
    fs.writeFile(BG_FILE, req.file.buffer, (writeErr) => {
      if (writeErr) return res.status(500).json({ ok: false, error: 'write failed' });
      res.json({ ok: true });
    });
  });
});

const serveStatic = express.static(ROOT, { dotfiles: 'allow' });

app.use((req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return next();
  serveStatic(req, res, next);
});

app.get('/', (req, res) => res.sendFile(SITE_FILE));

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Dolce Vita site running at http://localhost:${PORT}`);
    console.log(`Admin panel at http://localhost:${PORT}/admin.html (user: ${ADMIN_USER})`);
  });
}

module.exports = app;
