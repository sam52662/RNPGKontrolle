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
        position:fixed;top:0;left:0;right:0;height:175px;z-index:0;overflow:hidden;
      }
      /* Sky */
      #lake-header-sky{
        position:absolute;top:0;left:0;right:0;height:95px;
        background:linear-gradient(180deg, #1a4a28 0%, #2d6e3a 40%, #3a7a46 70%, #2a5e32 100%);
      }
      /* Forest silhouette — dark organic shapes */
      #lake-header-forest{
        position:absolute;top:20px;left:0;right:0;height:85px;
        background:
          radial-gradient(ellipse 55px 90px at  4% 100%, #071a0d 50%, transparent 51%),
          radial-gradient(ellipse 48px 80px at  9% 100%, #091e10 50%, transparent 51%),
          radial-gradient(ellipse 60px 95px at 15% 100%, #061508 50%, transparent 51%),
          radial-gradient(ellipse 50px 85px at 21% 100%, #081c0f 50%, transparent 51%),
          radial-gradient(ellipse 55px 92px at 27% 100%, #071a0d 50%, transparent 51%),
          radial-gradient(ellipse 45px 75px at 33% 100%, #0a2012 50%, transparent 51%),
          radial-gradient(ellipse 58px 88px at 39% 100%, #061508 50%, transparent 51%),
          radial-gradient(ellipse 52px 82px at 45% 100%, #091e10 50%, transparent 51%),
          radial-gradient(ellipse 48px 78px at 51% 100%, #081c0f 50%, transparent 51%),
          radial-gradient(ellipse 55px 90px at 57% 100%, #071a0d 50%, transparent 51%),
          radial-gradient(ellipse 60px 95px at 63% 100%, #061508 50%, transparent 51%),
          radial-gradient(ellipse 50px 83px at 69% 100%, #0a2012 50%, transparent 51%),
          radial-gradient(ellipse 55px 88px at 75% 100%, #081c0f 50%, transparent 51%),
          radial-gradient(ellipse 48px 80px at 81% 100%, #091e10 50%, transparent 51%),
          radial-gradient(ellipse 52px 86px at 87% 100%, #071a0d 50%, transparent 51%),
          radial-gradient(ellipse 58px 92px at 93% 100%, #061508 50%, transparent 51%),
          radial-gradient(ellipse 45px 76px at 98% 100%, #0a2012 50%, transparent 51%);
      }
      /* Hill behind forest */
      #lake-header-hill{
        position:absolute;top:35px;left:30%;right:-5%;height:70px;
        background:#1a3d20;
        border-radius:50% 60% 0 0;
        opacity:0.7;
      }
      /* Water */
      #lake-header-water{
        position:absolute;top:88px;left:0;right:0;bottom:0;
        background:linear-gradient(180deg, #1e4a2a 0%, #163d22 40%, #0f2e18 100%);
      }
      /* Water shimmer lines */
      #lake-header-water::after{
        content:'';position:absolute;top:0;left:0;right:0;bottom:0;
        background:repeating-linear-gradient(
          180deg,
          transparent, transparent 7px,
          rgba(255,255,255,0.025) 7px, rgba(255,255,255,0.025) 8px
        );
      }
      /* Center glow — sunrise/mist light on water */
      #lake-glow{
        position:absolute;top:35%;left:50%;transform:translate(-50%,-50%);
        width:320px;height:140px;
        background:radial-gradient(ellipse, rgba(200,230,180,0.22) 0%, rgba(200,230,180,0.08) 40%, transparent 70%);
        pointer-events:none;
      }
      /* Wave transition to content */
      #lake-header-wave{
        position:absolute;bottom:-20px;left:-5%;right:-5%;height:50px;
        background:#163d22;
        border-radius:50% 50% 0 0;
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
    <div id='lake-header'>
      <div id='lake-header-sky'></div>
      <div id='lake-header-hill'></div>
      <div id='lake-header-forest'></div>
      <div id='lake-header-water'></div>
      <div id='lake-glow'></div>
      <div id='lake-header-wave'></div>
    </div>
    <div id='root'></div>
    <script src='/RNPGKontrolle/_expo/static/js/web/${JS_NAME}' defer></script>
  </body>
</html>`;

fs.writeFileSync(path.join(DIST, 'index.html'), html);
console.log('index.html written with SVG background + correct paths');
console.log('Done. Ready to push.');
