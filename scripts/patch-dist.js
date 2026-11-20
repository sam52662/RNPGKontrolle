const fs = require('fs');
const path = require('path');

const DIST = 'C:/Claude/RNPG/dist';
const BASE = '/RNPGKontrolle';

// Dynamically find the JS bundle
const jsDir = path.join(DIST, '_expo/static/js/web');
const jsFiles = fs.readdirSync(jsDir).filter(f => f.startsWith('index-') && f.endsWith('.js'));
if (!jsFiles.length) { console.error('No bundle found in', jsDir); process.exit(1); }
const JS_NAME = jsFiles[0];
const JS_FILE = path.join(jsDir, JS_NAME);
console.log('Bundle:', JS_NAME);

// 1. Patch JS bundle
let js = fs.readFileSync(JS_FILE, 'utf8');
const before = (js.match(/\/assets\//g) || []).length;
js = js.replace(/"\/assets\//g, '"/RNPGKontrolle/assets/');
const after = (js.match(/\/RNPGKontrolle\/assets\//g) || []).length;
fs.writeFileSync(JS_FILE, js);
console.log(`JS bundle: patched ${after} asset paths (was ${before})`);

// 2. Write index.html — professional dark pattern background
const svgPattern = `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60">
  <rect width="60" height="60" fill="#1a3d28"/>
  <path d="M30 0 L60 30 L30 60 L0 30 Z" fill="none" stroke="#ffffff" stroke-width="0.5" stroke-opacity="0.10"/>
  <circle cx="30" cy="30" r="1.4" fill="#ffffff" fill-opacity="0.08"/>
  <circle cx="0"  cy="0"  r="1"   fill="#ffffff" fill-opacity="0.06"/>
  <circle cx="60" cy="0"  r="1"   fill="#ffffff" fill-opacity="0.06"/>
  <circle cx="0"  cy="60" r="1"   fill="#ffffff" fill-opacity="0.06"/>
  <circle cx="60" cy="60" r="1"   fill="#ffffff" fill-opacity="0.06"/>
</svg>`;
const SVG_BG = 'url("data:image/svg+xml,' + encodeURIComponent(svgPattern) + '")';

const html = `<!DOCTYPE html>
<html lang='de'>
  <head>
    <meta charset='utf-8' />
    <meta name='viewport' content='width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1.00001, viewport-fit=cover' />
    <title>RNPG Kontrolle</title>
    <style>
      html,body,#root{width:100%;-webkit-overflow-scrolling:touch;margin:0;padding:0;min-height:100%}
      #root{flex-shrink:0;flex-basis:auto;flex-grow:1;display:flex;flex:1;position:relative;z-index:1;background:transparent!important}
      html{scroll-behavior:smooth;-webkit-text-size-adjust:100%;height:calc(100% + env(safe-area-inset-top))}
      body{
        display:flex;overflow-y:auto;overscroll-behavior-y:none;
        text-rendering:optimizeLegibility;-webkit-font-smoothing:antialiased;
        background-color:#1a3d28;
        background-image: ${SVG_BG};
        background-size: 60px 60px;
        background-position: center center;
        background-attachment: fixed;
      }
    </style>
    <meta name='theme-color' content='#1a4a2e'>
    <meta name='description' content='Fischereikontrolle App - Pachtgemeinschaft Kurpfalz e.V.'>
    <link rel='shortcut icon' href='/RNPGKontrolle/favicon.ico' />
    <link rel='manifest' href='/RNPGKontrolle/manifest.json' />
    <meta name='mobile-web-app-capable' content='yes' />
    <meta name='apple-mobile-web-app-capable' content='yes' />
    <meta name='apple-mobile-web-app-status-bar-style' content='black-translucent' />
    <meta name='apple-mobile-web-app-title' content='RNPG' />
    <link rel='apple-touch-icon' href='/RNPGKontrolle/icons/icon-192.png' />
    <script>if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/RNPGKontrolle/sw.js',{scope:'/RNPGKontrolle/'})})}</script>
  </head>
  <body>
    <div id='root'></div>
    <script src='/RNPGKontrolle/_expo/static/js/web/${JS_NAME}' defer></script>
  </body>
</html>`;

fs.writeFileSync(path.join(DIST, 'index.html'), html);
console.log('index.html written with SVG background + correct paths');
console.log('Done. Ready to push.');
