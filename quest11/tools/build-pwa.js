// Builds the installable app into pwa/: node tools/build-pwa.js
// Upload the whole pwa/ folder to any static host (e.g. Netlify Drop), open it on a phone/tablet and "Add to Home Screen".
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const root = path.join(__dirname, '..');
const out = path.join(root, 'pwa');
execFileSync('node', [path.join(__dirname, 'bundle.js'), path.join(out, 'index.html')]);
let html = fs.readFileSync(path.join(out, 'index.html'), 'utf8');
const version = Date.now().toString(36);
html = html.replace('</title>', `</title>
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" type="image/png" href="favicon-32.png">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<meta name="theme-color" content="#081420">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black">
<meta name="apple-mobile-web-app-title" content="11+ Quest">`);
html = html.replace('</body>', `<script>if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));</script>\n</body>`);
fs.writeFileSync(path.join(out, 'index.html'), html);
fs.writeFileSync(path.join(out, 'sw.js'), `// Offline cache for Breath of Knowledge (version ${version})
const CACHE = 'botk-${version}';
const CORE = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png', './favicon-32.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // network first for the game page (so updates arrive), cache first for everything else (fonts, icons)
  const isPage = e.request.mode === 'navigate';
  e.respondWith(isPage
    ? fetch(e.request).then(r => { const c = r.clone(); caches.open(CACHE).then(ca => ca.put(e.request, c)); return r; }).catch(() => caches.match('./index.html'))
    : caches.match(e.request).then(hit => hit || fetch(e.request).then(r => { if (r.ok || r.type === 'opaque') { const c = r.clone(); caches.open(CACHE).then(ca => ca.put(e.request, c)); } return r; })));
});
`);
console.log('PWA built in', out);
