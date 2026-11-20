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
const SVG_BG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='900' viewBox='0 0 800 900'%3E%3Cdefs%3E%3ClinearGradient id='sky' x1='0' y1='0' x2='0' y2='1'%3E%3Cstop offset='0%25' stop-color='%230a1f10'/%3E%3Cstop offset='45%25' stop-color='%23112d18'/%3E%3Cstop offset='60%25' stop-color='%230d2b1a'/%3E%3Cstop offset='100%25' stop-color='%230a1e14'/%3E%3C/linearGradient%3E%3ClinearGradient id='water' x1='0' y1='0' x2='0' y2='1'%3E%3Cstop offset='0%25' stop-color='%23082030' stop-opacity='0.95'/%3E%3Cstop offset='100%25' stop-color='%23050f18' stop-opacity='1'/%3E%3C/linearGradient%3E%3ClinearGradient id='moon' x1='0' y1='0' x2='0' y2='1'%3E%3Cstop offset='0%25' stop-color='%23f0d980'/%3E%3Cstop offset='100%25' stop-color='%23c8a84b'/%3E%3C/linearGradient%3E%3Cfilter id='glow'%3E%3CfeGaussianBlur stdDeviation='4' result='blur'/%3E%3CfeMerge%3E%3CfeMergeNode in='blur'/%3E%3CfeMergeNode in='SourceGraphic'/%3E%3C/feMerge%3E%3C/filter%3E%3C/defs%3E%3Crect width='800' height='900' fill='url(%23sky)'/%3E%3Ccircle cx='120' cy='60' r='1.2' fill='%23fff' opacity='0.5'/%3E%3Ccircle cx='240' cy='35' r='0.8' fill='%23fff' opacity='0.4'/%3E%3Ccircle cx='380' cy='25' r='1.4' fill='%23fff' opacity='0.6'/%3E%3Ccircle cx='520' cy='55' r='0.9' fill='%23fff' opacity='0.35'/%3E%3Ccircle cx='650' cy='30' r='1.1' fill='%23fff' opacity='0.5'/%3E%3Ccircle cx='720' cy='70' r='0.7' fill='%23fff' opacity='0.3'/%3E%3Ccircle cx='60' cy='100' r='0.8' fill='%23fff' opacity='0.3'/%3E%3Ccircle cx='310' cy='80' r='0.6' fill='%23fff' opacity='0.4'/%3E%3Ccircle cx='580' cy='90' r='1.0' fill='%23fff' opacity='0.45'/%3E%3Ccircle cx='760' cy='110' r='0.8' fill='%23fff' opacity='0.3'/%3E%3Ccircle cx='660' cy='100' r='38' fill='%23c8a84b' opacity='0.07' filter='url(%23glow)'/%3E%3Ccircle cx='660' cy='100' r='22' fill='url(%23moon)' opacity='0.85' filter='url(%23glow)'/%3E%3Ccircle cx='652' cy='94' r='8' fill='%230a1f10' opacity='0.18'/%3E%3Cellipse cx='660' cy='570' rx='8' ry='40' fill='%23c8a84b' opacity='0.12'/%3E%3Cellipse cx='660' cy='570' rx='3' ry='20' fill='%23e8c96b' opacity='0.18'/%3E%3Cpath d='M-10 400 L30 320 L70 400 Z' fill='%23122a18' opacity='0.6'/%3E%3Cpath d='M20 410 L65 310 L110 410 Z' fill='%23122a18' opacity='0.6'/%3E%3Cpath d='M55 405 L100 295 L145 405 Z' fill='%23152e1c' opacity='0.65'/%3E%3Cpath d='M90 415 L130 320 L170 415 Z' fill='%23122a18' opacity='0.6'/%3E%3Cpath d='M-10 430 L40 335 L90 430 Z' fill='%231a3d22'/%3E%3Cpath d='M35 435 L85 325 L135 435 Z' fill='%231e4426'/%3E%3Cpath d='M75 430 L128 310 L180 430 Z' fill='%231a3d22'/%3E%3Cpath d='M120 435 L165 330 L210 435 Z' fill='%231c4024'/%3E%3Cpath d='M155 428 L195 335 L235 428 Z' fill='%231a3d22'/%3E%3Cpath d='M-10 430 Q100 420 220 435 L220 480 L-10 480 Z' fill='%23122a18'/%3E%3Cpath d='M570 410 L610 315 L650 410 Z' fill='%23122a18' opacity='0.6'/%3E%3Cpath d='M610 405 L655 295 L700 405 Z' fill='%23152e1c' opacity='0.65'/%3E%3Cpath d='M650 410 L690 320 L730 410 Z' fill='%23122a18' opacity='0.6'/%3E%3Cpath d='M700 415 L740 310 L780 415 Z' fill='%23122a18' opacity='0.6'/%3E%3Cpath d='M565 435 L615 330 L665 435 Z' fill='%231a3d22'/%3E%3Cpath d='M610 430 L662 315 L714 430 Z' fill='%231e4426'/%3E%3Cpath d='M655 435 L700 320 L745 435 Z' fill='%231c4024'/%3E%3Cpath d='M700 428 L742 330 L784 428 Z' fill='%231a3d22'/%3E%3Cpath d='M740 432 L778 338 L816 432 Z' fill='%231e4426'/%3E%3Cpath d='M565 435 Q680 420 820 435 L820 480 L565 480 Z' fill='%23122a18'/%3E%3Crect x='0' y='460' width='800' height='440' fill='url(%23water)'/%3E%3Cpath d='M0 460 Q200 455 400 462 Q600 468 800 460' stroke='%2320503a' stroke-width='1.5' fill='none' opacity='0.6'/%3E%3Cellipse cx='400' cy='490' rx='180' ry='4' fill='none' stroke='%231a4a3a' stroke-width='1' opacity='0.5'/%3E%3Cellipse cx='400' cy='510' rx='220' ry='5' fill='none' stroke='%23163d30' stroke-width='1' opacity='0.4'/%3E%3Cellipse cx='400' cy='535' rx='260' ry='5' fill='none' stroke='%23122e25' stroke-width='1' opacity='0.35'/%3E%3Cellipse cx='200' cy='520' rx='100' ry='3' fill='none' stroke='%231a4a3a' stroke-width='0.8' opacity='0.3'/%3E%3Cellipse cx='600' cy='515' rx='120' ry='3' fill='none' stroke='%231a4a3a' stroke-width='0.8' opacity='0.3'/%3E%3Cpath d='M40 460 Q50 500 42 560' stroke='%231a3d22' stroke-width='8' opacity='0.15' fill='none'/%3E%3Cpath d='M100 460 Q108 510 102 580' stroke='%231a3d22' stroke-width='10' opacity='0.12' fill='none'/%3E%3Cpath d='M700 460 Q710 505 703 570' stroke='%231a3d22' stroke-width='9' opacity='0.14' fill='none'/%3E%3Cpath d='M740 460 Q748 495 742 555' stroke='%231a3d22' stroke-width='7' opacity='0.12' fill='none'/%3E%3Cline x1='175' y1='445' x2='340' y2='390' stroke='%238B5E3C' stroke-width='2.5' stroke-linecap='round' opacity='0.7'/%3E%3Cline x1='340' y1='390' x2='358' y2='465' stroke='%23c8a84b' stroke-width='0.8' stroke-dasharray='3,4' opacity='0.5'/%3E%3Ccircle cx='358' cy='466' r='2.5' fill='%23c8a84b' opacity='0.6'/%3E%3Crect x='0' y='440' width='800' height='40' fill='url(%23sky)' opacity='0.3'/%3E%3C/svg%3E")`;

const html = `<!DOCTYPE html>
<html lang='de'>
  <head>
    <meta charset='utf-8' />
    <meta name='viewport' content='width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1.00001, viewport-fit=cover' />
    <title>RNPG Kontrolle</title>
    <style>
      html,body,#root{width:100%;-webkit-overflow-scrolling:touch;margin:0;padding:0;min-height:100%}
      #root{flex-shrink:0;flex-basis:auto;flex-grow:1;display:flex;flex:1;position:relative;z-index:1}
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
