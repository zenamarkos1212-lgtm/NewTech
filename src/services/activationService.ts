/**
 * Elimination / Elimagu-style Device Activation System
 * Generates a unique Device ID per installation and validates cryptographic activation keys.
 * Developed by Tesfaye Hailu Gellaw for New-Tech Institute.
 */

const STORAGE_KEY_ACTIVATED = 'newtech_is_activated';
const STORAGE_KEY_LICENSE = 'newtech_license_key';
const STORAGE_KEY_DEVICE_ID = 'newtech_device_id';
const STORAGE_KEY_ACTIVATED_AT = 'newtech_activated_at';

// Secret salt for key derivation
const SECRET_SALT = 'TESFAYE_HAILU_GELLAW_NEWTECH_ETHIOPIA_2026';

// Universal master developer keys for Tesfaye Hailu Gellaw
const MASTER_KEYS = [
  'TESFAYE-HAILU-GELLAW-2026',
  'NT-MASTER-9988-7766',
  'NEWTECH-TV-RECOVERY-PRO',
];

/**
 * Generates or retrieves the unique persistent Device Hardware ID for this phone / PC.
 */
export function getOrCreateDeviceId(): string {
  try {
    const existing = localStorage.getItem(STORAGE_KEY_DEVICE_ID);
    if (existing && existing.startsWith('NT-') && existing.length >= 14) {
      return existing;
    }

    // Generate hardware-anchored seed
    const nav = typeof window !== 'undefined' ? window.navigator : ({} as any);
    const scr = typeof window !== 'undefined' ? window.screen : ({} as any);

    const entropy = [
      nav.userAgent || 'unknown',
      nav.language || 'am',
      scr.width || '1080',
      scr.height || '2400',
      scr.colorDepth || '24',
      Intl.DateTimeFormat().resolvedOptions().timeZone || 'Africa/Addis_Ababa',
      Date.now().toString(36),
      Math.random().toString(36).substring(2, 9),
    ].join('###');

    // Simple hash
    let hash = 0x811c9dc5;
    for (let i = 0; i < entropy.length; i++) {
      hash ^= entropy.charCodeAt(i);
      hash = (hash * 0x01000193) >>> 0;
    }

    const hex1 = ((hash >>> 16) & 0xffff).toString(16).toUpperCase().padStart(4, '0');
    const hex2 = (hash & 0xffff).toString(16).toUpperCase().padStart(4, '0');

    // Random component
    const r1 = Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase().padStart(4, '0');
    const r2 = Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase().padStart(4, '0');

    const generated = `NT-${hex1}-${hex2}-${r1}`;
    localStorage.setItem(STORAGE_KEY_DEVICE_ID, generated);
    return generated;
  } catch {
    return 'NT-8842-991A-F2C4';
  }
}

/**
 * Deterministically computes the valid Activation Key for a given Device ID.
 * Key format: ACT-XXXX-YYYY-ZZZZ
 */
export function generateKeyForDevice(deviceId: string): string {
  const cleanId = (deviceId || '').trim().toUpperCase();
  const input = `${cleanId}:::${SECRET_SALT}`;

  let h1 = 0x12345678;
  let h2 = 0x9abcdef0;

  for (let i = 0; i < input.length; i++) {
    const code = input.charCodeAt(i);
    h1 = ((h1 << 5) - h1 + code) >>> 0;
    h2 = ((h2 << 7) - h2 + code) >>> 0;
  }

  const p1 = (h1 & 0xffff).toString(16).toUpperCase().padStart(4, '0');
  const p2 = ((h1 >>> 16) & 0xffff).toString(16).toUpperCase().padStart(4, '0');
  const p3 = (h2 & 0xffff).toString(16).toUpperCase().padStart(4, '0');
  const p4 = ((h2 >>> 16) & 0xffff).toString(16).toUpperCase().padStart(4, '0');

  return `ACT-${p1}-${p2}-${p3}`;
}

/**
 * Checks whether the app is currently activated on this device.
 */
export function isAppActivated(): boolean {
  try {
    const isAct = localStorage.getItem(STORAGE_KEY_ACTIVATED);
    const key = localStorage.getItem(STORAGE_KEY_LICENSE);
    const devId = getOrCreateDeviceId();

    if (isAct !== 'true' || !key) {
      return false;
    }

    // Check if key is a master key
    if (MASTER_KEYS.includes(key.trim().toUpperCase())) {
      return true;
    }

    // Check if key matches this device ID
    const expected = generateKeyForDevice(devId);
    return key.trim().toUpperCase() === expected.toUpperCase();
  } catch {
    return false;
  }
}

/**
 * Attempts to activate the app with a user-provided license key.
 */
export function activateApp(userKey: string): { success: boolean; message: string } {
  const trimmed = (userKey || '').trim().toUpperCase();
  if (!trimmed) {
    return { success: false, message: 'እባክዎ የማግበሪያ ቁልፍ ያስገቡ (Please enter an activation key)' };
  }

  const devId = getOrCreateDeviceId();
  const expectedKey = generateKeyForDevice(devId);

  const isValid =
    MASTER_KEYS.includes(trimmed) ||
    trimmed === expectedKey ||
    trimmed === expectedKey.replace('ACT-', 'NT-');

  if (isValid) {
    try {
      localStorage.setItem(STORAGE_KEY_ACTIVATED, 'true');
      localStorage.setItem(STORAGE_KEY_LICENSE, trimmed);
      localStorage.setItem(STORAGE_KEY_ACTIVATED_AT, new Date().toISOString());
      return { success: true, message: 'አፕሊኬሽኑ በተሳካ ሁኔታ ነቅቷል! (Activated successfully)' };
    } catch (e: any) {
      return { success: false, message: e.message || 'Storage error' };
    }
  }

  return {
    success: false,
    message: 'የተሳሳተ የማግበሪያ ቁልፍ ነው! እባክዎ ትክክለኛውን ቁልፍ ከገንቢው ተስፋዬ ሀይሉ ገላው ያግኙ።',
  };
}

/**
 * Resets activation state (for testing or re-locking).
 */
export function resetAppActivation(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_ACTIVATED);
    localStorage.removeItem(STORAGE_KEY_LICENSE);
    localStorage.removeItem(STORAGE_KEY_ACTIVATED_AT);
  } catch {
    // ignore
  }
}
