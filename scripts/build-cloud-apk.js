import fs from 'node:fs';
import path from 'node:path';

const appUrl = 'https://ais-pre-eujgkebi55zalgaggbxekw-116513744057.europe-west2.run.app';

const options = {
  additionalTrustedOrigins: [],
  appVersion: "1.0.0.0",
  appVersionCode: 1,
  backgroundColor: "#0a0d14",
  display: "standalone",
  enableSiteSettingsShortcut: true,
  enableNotifications: false,
  includeSourceCode: false,
  fallbackType: "customtabs",
  features: {
    locationDelegation: { enabled: false },
    playBilling: { enabled: false }
  },
  host: appUrl,
  iconUrl: `${appUrl}/pwa-512x512.png`,
  launcherName: "TV Recovery",
  name: "New-Tech TV Recovery Tool",
  maskableIconUrl: `${appUrl}/pwa-maskable-512x512.png`,
  navigationColor: "#0a0d14",
  navigationColorDark: "#0a0d14",
  navigationDividerColor: "#0a0d14",
  navigationDividerColorDark: "#0a0d14",
  orientation: "default",
  packageId: "com.newtech.tvrecovery",
  pwaUrl: appUrl,
  shortcuts: [],
  signingMode: "new",
  signing: {
    file: null,
    alias: "newtech-key",
    fullName: "New-Tech Institute",
    organization: "Electronics Repair Center",
    organizationalUnit: "Engineering",
    countryCode: "ET",
    keyPassword: "NewTechPassword123!",
    storePassword: "NewTechStorePass123!"
  },
  splashScreenFadeOutDuration: 300,
  startUrl: "/",
  themeColor: "#0a0d14",
  themeColorDark: "#0a0d14",
  webManifestUrl: `${appUrl}/manifest.webmanifest`
};

async function build() {
  console.log("Enqueuing CloudAPK build job...");
  const res = await fetch("https://pwabuilder-cloudapk.azurewebsites.net/enqueuePackageJob", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "platform-identifier": "ServerUI",
      "platform-identifier-version": "1.0.0"
    },
    body: JSON.stringify(options)
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Enqueue failed (${res.status}): ${text}`);
  }

  const { id: jobId, accessToken } = await res.json();
  console.log(`Enqueued Job ID: ${jobId}. Polling for completion...`);

  let completed = false;
  let attempts = 0;
  while (!completed && attempts < 60) {
    attempts++;
    await new Promise((r) => setTimeout(r, 4000));

    const pollRes = await fetch(`https://pwabuilder-cloudapk.azurewebsites.net/getPackageJob?id=${encodeURIComponent(jobId)}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!pollRes.ok) {
      console.warn(`Poll status: ${pollRes.status}`);
      continue;
    }

    const job = await pollRes.json();
    console.log(`Job status: ${job.status}`);

    if (job.status === "Completed") {
      completed = true;
      console.log("Job completed! Downloading package zip...");
      const zipRes = await fetch(`https://pwabuilder-cloudapk.azurewebsites.net/downloadPackageZip?id=${encodeURIComponent(jobId)}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (!zipRes.ok) {
        throw new Error(`Failed to download zip: ${zipRes.status}`);
      }

      const arrayBuffer = await zipRes.arrayBuffer();
      const zipBuffer = Buffer.from(arrayBuffer);
      const zipPath = path.resolve("./public/NewTech_TV_Recovery_Package.zip");
      fs.writeFileSync(zipPath, zipBuffer);
      console.log(`Saved package zip (${zipBuffer.length} bytes) to ${zipPath}`);

      // Now extract the .apk inside the zip or save as apk!
      return;
    }

    if (job.status === "Failed") {
      console.error("Job failed with logs:", job.logs);
      throw new Error("CloudAPK build failed");
    }
  }

  throw new Error("Build timed out");
}

build().catch((err) => {
  console.error("Build error:", err);
  process.exit(1);
});
