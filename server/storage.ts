// Storage helpers — uses Forge proxy when configured, falls back to local disk
// Local disk storage serves files via /api/uploads/:filename

import { ENV } from './_core/env';
import path from 'path';
import fs from 'fs';

// ── Local disk storage ──────────────────────────────────────────────────────
const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');

function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

async function localPut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  _contentType: string
): Promise<{ key: string; url: string }> {
  ensureUploadDir();
  const fileName = relKey.replace(/^uploads\//, '');
  const filePath = path.join(UPLOAD_DIR, fileName);
  const buf = typeof data === 'string' ? Buffer.from(data) : Buffer.from(data);
  fs.writeFileSync(filePath, buf);
  // Return relative URL — Express will serve this
  const url = `/api/uploads/${fileName}`;
  return { key: relKey, url };
}

// ── Forge proxy storage ─────────────────────────────────────────────────────
type StorageConfig = { baseUrl: string; apiKey: string };

function getForgeConfig(): StorageConfig | null {
  const baseUrl = ENV.forgeApiUrl;
  const apiKey = ENV.forgeApiKey;
  if (!baseUrl || !apiKey) return null;
  return { baseUrl: baseUrl.replace(/\/+$/, ''), apiKey };
}

function ensureTrailingSlash(value: string): string {
  return value.endsWith('/') ? value : `${value}/`;
}

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, '');
}

function buildAuthHeaders(apiKey: string): HeadersInit {
  return { Authorization: `Bearer ${apiKey}` };
}

async function forgePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType: string,
  config: StorageConfig
): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);
  const uploadUrl = new URL('v1/storage/upload', ensureTrailingSlash(config.baseUrl));
  uploadUrl.searchParams.set('path', key);

  const blob =
    typeof data === 'string'
      ? new Blob([data], { type: contentType })
      : new Blob([data as any], { type: contentType });
  const form = new FormData();
  form.append('file', blob, key.split('/').pop() ?? key);

  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: buildAuthHeaders(config.apiKey),
    body: form,
  });

  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(`Storage upload failed (${response.status}): ${message}`);
  }
  const url = (await response.json()).url;
  return { key, url };
}

// ── Public API ──────────────────────────────────────────────────────────────

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = 'application/octet-stream'
): Promise<{ key: string; url: string }> {
  const forgeConfig = getForgeConfig();
  if (forgeConfig) {
    try {
      return await forgePut(relKey, data, contentType, forgeConfig);
    } catch (err) {
      console.warn('[Storage] Forge upload failed, falling back to local:', (err as Error).message);
    }
  }
  return localPut(relKey, data, contentType);
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const forgeConfig = getForgeConfig();
  if (forgeConfig) {
    const key = normalizeKey(relKey);
    const downloadApiUrl = new URL('v1/storage/downloadUrl', ensureTrailingSlash(forgeConfig.baseUrl));
    downloadApiUrl.searchParams.set('path', key);
    const response = await fetch(downloadApiUrl, {
      method: 'GET',
      headers: buildAuthHeaders(forgeConfig.apiKey),
    });
    return { key, url: (await response.json()).url };
  }
  // Local fallback
  const fileName = relKey.replace(/^uploads\//, '');
  return { key: relKey, url: `/api/uploads/${fileName}` };
}

// ── Express static serve helper ─────────────────────────────────────────────
export function getUploadDir() {
  ensureUploadDir();
  return UPLOAD_DIR;
}
