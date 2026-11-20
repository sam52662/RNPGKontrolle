const fs = require('fs');
const path = require('path');

const DIST = 'C:/Claude/RNPG/dist';
const BASE = '/RNPGKontrolle';

// Dynamically find the JS bundle
const jsDir = path.join(DIST, '_expo/static/js/web');
const jsFiles = fs.readdirSync(jsDir)
  .filter(f => f.startsWith('index-') && f.endsWith('.js') && fs.statSync(path.join(jsDir, f)).size > 0)
  .sort((a, b) => fs.statSync(path.join(jsDir, b)).size - fs.statSync(path.join(jsDir, a)).size);
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
const svgPattern = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80">
  <rect width="80" height="80" fill="#163d22"/>
  <path d="M40 0 L80 40 L40 80 L0 40 Z" fill="none" stroke="#2a6e38" stroke-width="0.6" stroke-opacity="0.18"/>
  <circle cx="40" cy="40" r="1.5" fill="#2a6e38" fill-opacity="0.15"/>
  <circle cx="0"  cy="0"  r="1.2" fill="#2a6e38" fill-opacity="0.12"/>
  <circle cx="80" cy="0"  r="1.2" fill="#2a6e38" fill-opacity="0.12"/>
  <circle cx="0"  cy="80" r="1.2" fill="#2a6e38" fill-opacity="0.12"/>
  <circle cx="80" cy="80" r="1.2" fill="#2a6e38" fill-opacity="0.12"/>
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
        background-color:#163d22;
        background-image: ${SVG_BG};
        background-size: 80px 80px;
        background-position: center center;
        background-attachment: fixed;
      }
      /* Lake photo header — positioned behind React root */
      #lake-header{
        position:fixed;top:0;left:0;right:0;height:175px;z-index:0;
        background:
          linear-gradient(180deg, transparent 55%, #163d22 100%),
          linear-gradient(180deg,
            #3a7a4e 0%, #2d6840 18%,
            #1a4a28 28%, #0f2e18 38%,
            #1e5530 45%, #163d22 55%,
            #0e2a18 65%, #122e1a 100%
          );
        overflow:hidden;
      }
      /* Soft tree-top silhouette */
      #lake-header::before{
        content:'';position:absolute;top:30px;left:0;right:0;height:80px;
        background:
          radial-gradient(ellipse 60px 70px at 8%  100%, #0a2010 48%, transparent 50%),
          radial-gradient(ellipse 50px 65px at 16% 100%, #0d2814 48%, transparent 50%),
          radial-gradient(ellipse 55px 75px at 24% 100%, #091c0e 48%, transparent 50%),
          radial-gradient(ellipse 45px 60px at 31% 100%, #0b2212 48%, transparent 50%),
          radial-gradient(ellipse 60px 72px at 40% 100%, #0a1e0f 48%, transparent 50%),
          radial-gradient(ellipse 50px 68px at 52% 100%, #0c2414 48%, transparent 50%),
          radial-gradient(ellipse 58px 76px at 62% 100%, #091c0e 48%, transparent 50%),
          radial-gradient(ellipse 48px 64px at 71% 100%, #0b2010 48%, transparent 50%),
          radial-gradient(ellipse 55px 70px at 80% 100%, #0a1e0f 48%, transparent 50%),
          radial-gradient(ellipse 50px 66px at 90% 100%, #0c2414 48%, transparent 50%),
          radial-gradient(ellipse 45px 58px at 97% 100%, #091c0e 48%, transparent 50%);
      }
      /* Water shimmer reflection */
      #lake-header::after{
        content:'';position:absolute;bottom:0;left:0;right:0;height:55px;
        background:
          linear-gradient(180deg, transparent 0%, rgba(30,80,45,0.4) 100%),
          repeating-linear-gradient(
            180deg,
            transparent,
            transparent 5px,
            rgba(255,255,255,0.03) 5px,
            rgba(255,255,255,0.03) 6px
          );
      }
      /* Glow from center (morning mist / light on water) */
      #lake-glow{
        position:absolute;top:40%;left:50%;transform:translate(-50%,-50%);
        width:280px;height:120px;
        background:radial-gradient(ellipse, rgba(180,220,160,0.18) 0%, transparent 70%);
        pointer-events:none;
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
    <div id='lake-header'><div id='lake-glow'></div></div>
    <div id='root'></div>
    <script src='/RNPGKontrolle/_expo/static/js/web/${JS_NAME}' defer></script>
  </body>
</html>`;

fs.writeFileSync(path.join(DIST, 'index.html'), html);
console.log('index.html written with SVG background + correct paths');
console.log('Done. Ready to push.');
