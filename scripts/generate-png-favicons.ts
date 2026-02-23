#!/usr/bin/env tsx

import sharp from 'sharp'
import fs from 'fs'
import path from 'path'

// Favicon sizes to generate
const SIZES = [
  { name: 'favicon-16x16.png', size: 16, viewBox: '0 0 128 128' },
  { name: 'favicon-32x32.png', size: 32, viewBox: '0 0 128 128' },
  { name: 'apple-touch-icon.png', size: 180, viewBox: '0 0 180 180' },
  { name: 'android-chrome-192x192.png', size: 192, viewBox: '0 0 128 128' },
  { name: 'android-chrome-512x512.png', size: 512, viewBox: '0 0 180 180' },
]

// SVG template for 128x128 viewBox (lightning bolt icon)
function getSvg128(size: number): string {
  const radius = Math.round(size * 0.22)
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="128" y2="128" gradientUnits="userSpaceOnUse">
          <stop offset="0" stop-color="#4361ee"/>
          <stop offset="1" stop-color="#3a52d8"/>
        </linearGradient>
      </defs>
      <rect width="128" height="128" rx="${radius}" fill="url(#bg)"/>
      <path d="M84 48c-2.67 0-5.33.53-8 1.6l-2.67 16c-.53 3.2-1.6 5.87-3.2 8 3.2-4.27 4.27-9.6 4.8-14.4l6.4-38.4c.53-3.2 2.13-5.87 4.8-8 3.73-4.27 1.07-9.6-1.6-14.4L53.6 13.6c-1.07 1.07-2.67 1.6-4.8 1.6-5.33 0-8-5.33-8-16V24c0-1.07.53-2.13 1.6-2.67l6.4-6.4c1.07-1.07 2.67-1.6 4.27-1.6s3.2.53 4.8 1.6l6.4 6.4c1.6 1.6 2.67 4 2.67 6.67v32c0 2.67-.53 5.33-1.6 8-1.6 2.67-4 4.27-4.8 8-1.6l6.4-6.4c-1.6-1.6-4-2.67-6.67-2.67z" fill="white"/>
    </svg>
  `
}

// SVG template for 180x180 viewBox (lightning bolt icon)
function getSvg180(size: number): string {
  const radius = Math.round(size * 0.22)
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="180" y2="180" gradientUnits="userSpaceOnUse">
          <stop offset="0" stop-color="#4361ee"/>
          <stop offset="1" stop-color="#3a52d8"/>
        </linearGradient>
      </defs>
      <rect width="180" height="180" rx="${radius}" fill="url(#bg)"/>
      <path d="M118 67c-3.75 0-7.5.75-11.25 2.25l-3.75 22.5c-.75 4.5-2.25 8.25-4.5 11.25 4.5-6 6-13.5 6.75-20.25l9-54.75c.75-4.5 3-8.25 6.75-11.25 5.25-6 1.5-13.5-2.25-20.25L75 19c-1.5 1.5-3.75 2.25-6.75 2.25-7.5 0-11.25-7.5-11.25-20V33.75c0-1.5.75-3.2 2.25-3.375l9-9c1.5-1.5 3.75-2.25 6.375-2.25s4.875.75 6.75 2.25l9 9c2.25 2.25 4 6 4 10.125v45c0 3.75-.75 7.5-2.25 10.5-2.25 4-6 6.375-6.75 11.25-2.25l9-9c-2.25-2.25-6-4-10.125-6.75z" fill="white"/>
    </svg>
  `
}

async function generateFavicons() {
  const outputDir = path.join(process.cwd(), 'public', 'favicons')

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  console.log('🎨 Generating PNG favicons...\n')

  for (const { name, size, viewBox } of SIZES) {
    const svg = viewBox.startsWith('0 0 180')
      ? getSvg180(size)
      : getSvg128(size)

    const outputPath = path.join(outputDir, name)

    try {
      await sharp(Buffer.from(svg.trim()))
        .png()
        .toFile(outputPath)

      console.log(`  ✅ Generated ${name} (${size}×${size})`)
    } catch (error) {
      console.error(`  ❌ Error generating ${name}:`, error)
    }
  }

  console.log('\n✨ All favicons generated successfully!')
  console.log(`📁 Files saved to: ${outputDir}`)
}

// Run the script
generateFavicons().catch(console.error)
