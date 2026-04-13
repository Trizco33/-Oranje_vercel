// Storage helpers — priority order:
//   1. S3-compatible (AWS S3 / Cloudflare R2 / Backblaze B2) — via STORAGE_S3_* env vars
//   2. Forge proxy (Replit Object Storage)                    — via BUILT_IN_FORGE_API_* env vars
//   3. Local disk (ephemeral on Railway — for dev only)       — fallback

import { ENV } from './_core/env';
import path from 'path';
import fs from 'fs';

// ── Local disk storage ───────────────────────────────────────────────────────
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
  const url = `/api/uploads/${fileName}`;
  return { key: relKey, url };
}

// ── S3-compatible storage (AWS S3, Cloudflare R2, Backblaze B2) ─────────────
interface S3Config {
  endpoint?: string;
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  publicUrl: string;
}

function getS3Config(): S3Config | null {
  const bucket = process.env.STORAGE_S3_BUCKET;
  const accessKeyId = process.env.STORAGE_S3_ACCESS_KEY;
  const secretAccessKey = process.env.STORAGE_S3_SECRET_KEY;
  const publicUrl = process.env.STORAGE_S3_PUBLIC_URL;
  const region = process.env.STORAGE_S3_REGION || 'auto';
  const endpoint = process.env.STORAGE_S3_ENDPOINT;

  if (!bucket || !accessKeyId || !secretAccessKey || !publicUrl) return null;
  return { bucket, accessKeyId, secretAccessKey, publicUrl, region, endpoint };
}

async function s3Put(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType: string,
  config: S3Config
): Promise<{ key: string; url: string }> {
  const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');

  const client = new S3Client({
    region: config.region,
    ...(config.endpoint ? { endpoint: config.endpoint } : {}),
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });

  const key = relKey.replace(/^\/+/, '');
  const buf = typeof data === 'string' ? Buffer.from(data) : Buffer.from(data as any);

  await client.send(new PutObjectCommand({
    Bucket: config.bucket,
    Key: key,
    Body: buf,
    ContentType: contentType,
    CacheControl: 'public, max-age=31536000, immutable',
  }));

  const publicUrl = config.publicUrl.replace(/\/+$/, '');
  const url = `${publicUrl}/${key}`;
  return { key, url };
}

// ── Forge proxy storage (Replit Object Storage) ──────────────────────────────
type ForgeConfig = { baseUrl: string; apiKey: string };

function getForgeConfig(): ForgeConfig | null {
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

async function forgePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType: string,
  config: ForgeConfig
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
    headers: { Authorization: `Bearer ${config.apiKey}` },
    body: form,
  });

  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(`Forge upload failed (${response.status}): ${message}`);
  }
  const url = (await response.json()).url;
  return { key, url };
}

// ── Public API ───────────────────────────────────────────────────────────────

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = 'application/octet-stream'
): Promise<{ key: string; url: string }> {
  // 1. S3-compatible (persistent, recommended for Railway)
  const s3Config = getS3Config();
  if (s3Config) {
    try {
      return await s3Put(relKey, data, contentType, s3Config);
    } catch (err) {
      console.warn('[Storage] S3 upload failed, trying Forge:', (err as Error).message);
    }
  }

  // 2. Forge (Replit Object Storage)
  const forgeConfig = getForgeConfig();
  if (forgeConfig) {
    try {
      return await forgePut(relKey, data, contentType, forgeConfig);
    } catch (err) {
      console.warn('[Storage] Forge upload failed, falling back to local:', (err as Error).message);
    }
  }

  // 3. Local disk (ephemeral — dev only, files lost on Railway restart)
  if (process.env.NODE_ENV === 'production') {
    console.warn('[Storage] WARNING: Using ephemeral local disk in production. Configure STORAGE_S3_* env vars for persistent uploads.');
  }
  return localPut(relKey, data, contentType);
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const s3Config = getS3Config();
  if (s3Config) {
    const key = relKey.replace(/^\/+/, '');
    const publicUrl = s3Config.publicUrl.replace(/\/+$/, '');
    return { key, url: `${publicUrl}/${key}` };
  }

  const forgeConfig = getForgeConfig();
  if (forgeConfig) {
    const key = normalizeKey(relKey);
    const downloadApiUrl = new URL('v1/storage/downloadUrl', ensureTrailingSlash(forgeConfig.baseUrl));
    downloadApiUrl.searchParams.set('path', key);
    const response = await fetch(downloadApiUrl, {
      method: 'GET',
      headers: { Authorization: `Bearer ${forgeConfig.apiKey}` },
    });
    return { key, url: (await response.json()).url };
  }

  const fileName = relKey.replace(/^uploads\//, '');
  return { key: relKey, url: `/api/uploads/${fileName}` };
}

export function getUploadDir() {
  ensureUploadDir();
  return UPLOAD_DIR;
}
