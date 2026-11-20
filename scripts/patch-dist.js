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

// 2. Write index.html with SVG fishing background + correct paths
// Build SVG in JS (plain string), then URL-encode for data URI
const svgRaw = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="900" viewBox="0 0 800 900">
<defs>
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#060d12"/>
    <stop offset="30%" stop-color="#0a1a1f"/>
    <stop offset="55%" stop-color="#0d2318"/>
    <stop offset="100%" stop-color="#091a12"/>
  </linearGradient>
  <linearGradient id="glow_sky" x1="0.7" y1="0" x2="0.3" y2="0.6">
    <stop offset="0%" stop-color="#c8a84b" stop-opacity="0.18"/>
    <stop offset="100%" stop-color="#c8a84b" stop-opacity="0"/>
  </linearGradient>
  <linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#091820" stop-opacity="1"/>
    <stop offset="100%" stop-color="#040c10" stop-opacity="1"/>
  </linearGradient>
  <linearGradient id="moon_grad" x1="0" y1="0" x2="0.3" y2="1">
    <stop offset="0%" stop-color="#fef0a0"/>
    <stop offset="100%" stop-color="#c8a84b"/>
  </linearGradient>
  <radialGradient id="moon_halo" cx="50%" cy="50%" r="50%">
    <stop offset="0%" stop-color="#c8a84b" stop-opacity="0.25"/>
    <stop offset="60%" stop-color="#c8a84b" stop-opacity="0.08"/>
    <stop offset="100%" stop-color="#c8a84b" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="moon_refl" cx="50%" cy="10%" r="90%">
    <stop offset="0%" stop-color="#c8a84b" stop-opacity="0.22"/>
    <stop offset="100%" stop-color="#c8a84b" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="fog_l" cx="20%" cy="80%" r="60%">
    <stop offset="0%" stop-color="#1a3d28" stop-opacity="0.55"/>
    <stop offset="100%" stop-color="#1a3d28" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="fog_r" cx="80%" cy="80%" r="60%">
    <stop offset="0%" stop-color="#1a3d28" stop-opacity="0.55"/>
    <stop offset="100%" stop-color="#1a3d28" stop-opacity="0"/>
  </radialGradient>
  <filter id="blur_sm"><feGaussianBlur stdDeviation="2"/></filter>
  <filter id="blur_md"><feGaussianBlur stdDeviation="6"/></filter>
  <filter id="blur_lg"><feGaussianBlur stdDeviation="14"/></filter>
  <filter id="blur_xl"><feGaussianBlur stdDeviation="28"/></filter>
</defs>

<!-- Sky base -->
<rect width="800" height="900" fill="url(#sky)"/>
<!-- Moonlight wash across sky -->
<rect width="800" height="900" fill="url(#glow_sky)"/>

<!-- Stars -->
<circle cx="80"  cy="38"  r="0.9" fill="#fff" opacity="0.55"/>
<circle cx="155" cy="22"  r="0.6" fill="#fff" opacity="0.4"/>
<circle cx="230" cy="55"  r="1.1" fill="#fff" opacity="0.65"/>
<circle cx="310" cy="18"  r="0.7" fill="#fff" opacity="0.45"/>
<circle cx="395" cy="42"  r="1.3" fill="#fff" opacity="0.7"/>
<circle cx="460" cy="28"  r="0.8" fill="#fff" opacity="0.4"/>
<circle cx="540" cy="60"  r="0.6" fill="#fff" opacity="0.35"/>
<circle cx="610" cy="20"  r="1.0" fill="#fff" opacity="0.55"/>
<circle cx="45"  cy="85"  r="0.7" fill="#fff" opacity="0.3"/>
<circle cx="185" cy="78"  r="0.5" fill="#fff" opacity="0.35"/>
<circle cx="280" cy="92"  r="0.9" fill="#fff" opacity="0.4"/>
<circle cx="430" cy="75"  r="0.6" fill="#fff" opacity="0.3"/>
<circle cx="505" cy="88"  r="0.8" fill="#fff" opacity="0.4"/>
<circle cx="680" cy="55"  r="0.7" fill="#fff" opacity="0.35"/>
<circle cx="740" cy="32"  r="1.1" fill="#fff" opacity="0.5"/>
<circle cx="770" cy="90"  r="0.6" fill="#fff" opacity="0.3"/>

<!-- Moon halo (blurred) -->
<circle cx="650" cy="95" r="80" fill="url(#moon_halo)" filter="url(#blur_lg)"/>
<!-- Moon glow soft ring -->
<circle cx="650" cy="95" r="38" fill="#c8a84b" opacity="0.12" filter="url(#blur_md)"/>
<!-- Moon disk -->
<circle cx="650" cy="95" r="24" fill="url(#moon_grad)" opacity="0.92"/>
<!-- Moon subtle crater shadow -->
<circle cx="641" cy="88" r="9"  fill="#8a6820" opacity="0.14"/>
<circle cx="659" cy="102" r="5" fill="#8a6820" opacity="0.10"/>

<!-- Back treeline left — distant, blurred, dark -->
<path d="M-10 430 C20 390 35 350 55 310 C70 350 85 390 110 430
         C125 395 140 355 165 300 C185 352 195 395 220 430
         C240 388 258 342 285 285 C302 345 315 392 340 430
         C355 395 368 358 388 310 C405 362 415 400 435 430 L-10 430Z"
      fill="#0d2218" opacity="0.7" filter="url(#blur_sm)"/>

<!-- Mid treeline right — distant -->
<path d="M380 435 C410 388 428 345 455 290 C472 348 485 392 510 435
         C530 390 548 348 572 295 C590 352 602 395 625 435
         C645 388 665 342 690 288 C708 348 718 395 745 435
         C762 392 778 352 800 300 L810 440 L380 440Z"
      fill="#0d2218" opacity="0.7" filter="url(#blur_sm)"/>

<!-- Front treeline left — organic curves, layered -->
<path d="M-10 455
  C5 418 18 395 38 358 C52 395 60 418 75 455
  C88 412 102 382 125 338 C140 382 150 415 168 455
  C180 415 195 385 218 340 C233 385 242 418 258 455
  C270 418 282 392 302 352 C316 395 322 422 338 455
  C350 418 362 390 382 348 C396 392 404 420 420 455
  L-10 455Z"
      fill="#122a1a"/>
<path d="M-10 455
  C8 428 20 410 42 378 C55 410 65 432 80 455
  C92 422 108 398 132 362 C146 400 155 428 172 455
  C184 425 198 400 222 362 C237 400 246 428 262 455
  L-10 455Z"
      fill="#183222" opacity="0.85"/>

<!-- Front treeline right -->
<path d="M560 455
  C575 415 590 382 612 338 C628 382 638 418 655 455
  C668 412 682 378 705 332 C720 380 730 415 748 455
  C762 415 775 385 795 342 L810 455Z"
      fill="#122a1a"/>
<path d="M540 455
  C558 425 572 400 595 365 C610 402 620 428 638 455
  C652 422 668 395 690 358 C706 398 714 428 732 455
  C748 422 762 395 782 358 L810 455 L540 455Z"
      fill="#183222" opacity="0.85"/>

<!-- Ground bank -->
<path d="M-10 455 Q200 448 400 458 Q600 466 810 452 L810 480 L-10 480Z" fill="#0f2318"/>

<!-- Fog / mist at water edge -->
<rect x="0" y="445" width="800" height="50" fill="url(#fog_l)" filter="url(#blur_md)"/>
<rect x="0" y="445" width="800" height="50" fill="url(#fog_r)" filter="url(#blur_md)"/>

<!-- Water -->
<rect x="0" y="458" width="800" height="442" fill="url(#water)"/>

<!-- Moon reflection column -->
<rect x="630" y="460" width="38" height="440" fill="url(#moon_refl)" filter="url(#blur_md)"/>
<!-- Bright highlight center -->
<rect x="644" y="460" width="10" height="300" fill="#c8a84b" opacity="0.07" filter="url(#blur_sm)"/>

<!-- Water surface shimmer lines -->
<path d="M0 468 Q400 462 800 470"   stroke="#1e4a35" stroke-width="1.2" fill="none" opacity="0.6"/>
<path d="M0 482 Q400 476 800 484"   stroke="#19402e" stroke-width="1"   fill="none" opacity="0.45"/>
<path d="M0 500 Q400 494 800 502"   stroke="#163828" stroke-width="1"   fill="none" opacity="0.38"/>
<path d="M0 522 Q400 516 800 524"   stroke="#122e22" stroke-width="0.8" fill="none" opacity="0.3"/>
<path d="M0 548 Q400 542 800 550"   stroke="#0f2820" stroke-width="0.8" fill="none" opacity="0.25"/>
<path d="M100 490 Q300 487 500 492" stroke="#c8a84b" stroke-width="0.6" fill="none" opacity="0.12"/>
<path d="M200 510 Q400 506 600 512" stroke="#c8a84b" stroke-width="0.5" fill="none" opacity="0.09"/>

<!-- Fishing rod — slim, elegant -->
<line x1="168" y1="448" x2="310" y2="400" stroke="#6b4423" stroke-width="2.2" stroke-linecap="round" opacity="0.8"/>
<line x1="310" y1="400" x2="325" y2="472" stroke="#c8a84b" stroke-width="0.7" stroke-dasharray="4,5" opacity="0.55"/>
<circle cx="325" cy="473" r="2.8" fill="#c8a84b" opacity="0.65"/>
<circle cx="325" cy="473" r="5"   fill="#c8a84b" opacity="0.15" filter="url(#blur_sm)"/>
</svg>`;

const SVG_BG = 'url("data:image/svg+xml,' + encodeURIComponent(svgRaw) + '")';

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
        background-color:#0a1f10;
        background-image: ${SVG_BG};
        background-size: cover;
        background-position: center top;
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
