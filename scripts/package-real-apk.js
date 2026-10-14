import fs, { mkdirSync } from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import JSZip from 'jszip';

async function packageApk() {
  console.log('[1/5] Reading base APK template...');
  const baseApkBuffer = fs.readFileSync('/tmp/smartwebview.apk');
  const zip = await JSZip.loadAsync(baseApkBuffer);

  console.log('[2/5] Removing old signatures...');
  const metaInfFiles = Object.keys(zip.files).filter((f) => f.startsWith('META-INF/'));
  for (const f of metaInfFiles) {
    zip.remove(f);
  }

  console.log('[3/5] Updating assets/swv.properties to load New-Tech Tool locally...');
  let swvProps = await zip.file('assets/swv.properties').async('text');
  swvProps = swvProps.replace(
    /app\.url=.*/g,
    'app.url=file:///android_asset/web/index.html'
  );
  swvProps = swvProps.replace(
    /offline\.url=.*/g,
    'offline.url=file:///android_asset/web/index.html'
  );
  zip.file('assets/swv.properties', swvProps);

  console.log('[4/5] Injecting compiled New-Tech app bundle into assets/web/...');
  const distDir = path.resolve('./dist');

  function addDirToZip(currentDir, zipPrefix) {
    const files = fs.readdirSync(currentDir);
    for (const file of files) {
      const fullPath = path.join(currentDir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        addDirToZip(fullPath, `${zipPrefix}/${file}`);
      } else {
        const content = fs.readFileSync(fullPath);
        zip.file(`${zipPrefix}/${file}`, content);
      }
    }
  }

  addDirToZip(distDir, 'assets/web');

  // Replace splash icons with New-Tech logo
  const iconBuffer = fs.readFileSync(path.resolve('./public/pwa-512x512.png'));
  zip.file('assets/web/swv_splash.png', iconBuffer);
  zip.file('assets/web/swv_splash_white.png', iconBuffer);

  console.log('[5/5] Generating unsigned APK archive...');
  const unsignedBuffer = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });

  const unsignedPath = '/tmp/NewTech_unsigned.apk';
  fs.writeFileSync(unsignedPath, unsignedBuffer);
  console.log(`Unsigned APK created: ${unsignedPath} (${(unsignedBuffer.length / 1024 / 1024).toFixed(2)} MB)`);

  console.log('Signing APK with uber-apk-signer (v1, v2, v3, zipalign)...');
  mkdirSync('/tmp/signed_out', { recursive: true });
  execSync(
    'java -jar /tmp/uber-apk-signer.jar -a /tmp/NewTech_unsigned.apk --out /tmp/signed_out',
    { stdio: 'inherit' }
  );

  const signedFiles = fs.readdirSync('/tmp/signed_out');
  console.log('Signed output files:', signedFiles);

  const finalSigned = signedFiles.find((f) => f.endsWith('.apk'));
  if (!finalSigned) {
    throw new Error('No signed APK generated');
  }

  const finalSource = path.join('/tmp/signed_out', finalSigned);
  const targetApk = path.resolve('./public/NewTech_TV_Recovery.apk');
  fs.copyFileSync(finalSource, targetApk);

  const targetStat = fs.statSync(targetApk);
  console.log(`\n======================================================`);
  console.log(`SUCCESS! Final APK created at: ${targetApk}`);
  console.log(`Size: ${(targetStat.size / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Downloadable via: /NewTech_TV_Recovery.apk`);
  console.log(`======================================================\n`);
}

packageApk().catch((err) => {
  console.error('Packaging failed:', err);
  process.exit(1);
});
