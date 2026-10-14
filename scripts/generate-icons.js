import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const svgBuffer = fs.readFileSync(path.resolve('./public/icon.svg'));

async function generate() {
  // 192x192
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.resolve('./public/pwa-192x192.png'));
  console.log('Created pwa-192x192.png');

  // 512x512
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.resolve('./public/pwa-512x512.png'));
  console.log('Created pwa-512x512.png');

  // maskable 512x512 with safe padding (80% inside)
  await sharp(svgBuffer)
    .resize(410, 410)
    .extend({
      top: 51,
      bottom: 51,
      left: 51,
      right: 51,
      background: '#0a0d14'
    })
    .png()
    .toFile(path.resolve('./public/pwa-maskable-512x512.png'));
  console.log('Created pwa-maskable-512x512.png');

  // Apple touch icon 180x180
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.resolve('./public/apple-touch-icon.png'));
  console.log('Created apple-touch-icon.png');

  // 32x32 favicon
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.resolve('./public/favicon.ico'));
  console.log('Created favicon.ico');
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});
