#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Create a simple canvas-based favicon generator
function generateFavicon(size) {
  const canvas = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { margin: 0; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
      </style>
    </head>
    <body>
      <svg id="fav" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#4361ee"/>
            <stop offset="100%" stop-color="#3a52d8"/>
          </linearGradient>
        </defs>
        <rect width="${size}" height="${size}" rx="${size * 0.22}" fill="url(#bg)"/>
        <path d="M${size * 0.656} ${size * 0.375}c-${size * 0.021} 0-${size * 0.042} ${size * 0.004}-${size * 0.063} ${size * 0.012}l-${size * 0.021} ${size * 0.125}c-${size * 0.004} ${size * 0.025}-${size * 0.013} ${size * 0.046}-${size * 0.025} ${size * 0.063} ${size * 0.025}-${size * 0.038} ${size * 0.063} ${size * 0.031}-${size * 0.038} ${size * 0.062}-${size * 0.025} ${size * 0.038}-${size * 0.025} ${size * 0.031} ${size * 0.025}-${size * 0.031} ${size * 0.025} ${size * 0.038} 0c-${size * 0.042} 0-${size * 0.063} ${size * 0.012}-${size * 0.05} ${size * 0.125} ${size * 0.032} ${size * 0.025} ${size * 0.038}-${size * 0.042} ${size * 0.031} ${size * 0.025} ${size * 0.062} ${size * 0.05} ${size * 0.038}l${size * 0.05} ${size * 0.05}c${size * 0.004} ${size * 0.006} ${size * 0.017} ${size * 0.006} ${size * 0.017} ${size * 0.02} ${size * 0.006} ${size * 0.006}l${size * 0.05} ${size * 0.05}c${size * 0.012} ${size * 0.012} ${size * 0.031} ${size * 0.025} ${size * 0.006} ${size * 0.031}-${size * 0.006} ${size * 0.062} ${size * 0.033} ${size * 0.042} l${size * 0.05} -${size * 0.05} c-${size * 0.012} -${size * 0.012} -${size * 0.031} -${size * 0.025} -${size * 062} -${size * 0.033} -${size * 0.042} z" fill="white"/>
      </svg>
      <script>
        const svg = document.getElementById('fav');
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        canvas.width = ${size};
        canvas.height = ${size};
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL('image/png');
          console.log(dataUrl);
        };
        img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
      </script>
    </body>
    </html>
  `;
  console.log(`Open ${size}x${size} favicon generator:\n${canvas}`);
}

// Generate for different sizes
console.log('\n=== Favicon Generator ===\n');
console.log('To generate matching favicons:\n');
console.log('1. Copy the SVG below to a browser-based SVG to PNG converter');
console.log('2. Or use an online tool like: https://realfavicongenerator.net/\n');
console.log('SVG code for favicon.svg:\n');
console.log('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">');
console.log('  <defs>');
console.log('    <linearGradient id="bg" x1="0" y1="0" x2="128" y2="128">');
console.log('      <stop offset="0" stop-color="#4361ee"/>');
console.log('      <stop offset="1" stop-color="#3a52d8"/>');
console.log('    </linearGradient>');
console.log('  </defs>');
console.log('  <rect width="128" height="128" rx="28" fill="url(#bg)"/>');
console.log('  <path d="M84 48c-2.67 0-5.33.53-8 1.6l-2.67 16c-.53 3.2-1.6 5.87-3.2 8 3.2-4.27 4.27-9.6 4.8-14.4l6.4-38.4c.53-3.2 2.13-5.87 4.8-8 3.73-4.27 1.07-9.6-1.6-14.4L53.6 13.6c-1.07 1.07-2.67 1.6-4.8 1.6-5.33 0-8-5.33-8-16V24c0-1.07.53-2.13 1.6-2.67l6.4-6.4c1.07-1.07 2.67-1.6 4.27-1.6s3.2.53 4.8 1.6l6.4 6.4c1.6 1.6 2.67 4 2.67 6.67v32c0 2.67-.53 5.33-1.6 8-1.6 2.67-4 4.27-4.8 8-1.6l6.4-6.4c-1.6-1.6-4-2.67-6.67-2.67z" fill="white"/>');
console.log('</svg>');
