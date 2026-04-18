// Storage helpers — priority order:
//   1. S3-compatible (AWS S3 / Cloudflare R2 / Backblaze B2) — via STORAGE_S3_* env vars
//      • Se STORAGE_S3_PUBLIC_URL estiver definida → URL pública direta
//      • Caso contrário → proxy via Express em /api/uploads/:key
//   2. Replit Object Storage (GCS)                           — via DEFAULT_OBJECT_STORAGE_BUCKET_ID
//   3. Forge proxy (legacy Replit storage)                   — via BUILT_IN_FORGE_API_* env vars
//   4. Local disk (ephemeral — dev fallback only)

import { ENV } from './_core/env';
import path from 'path';
import fs from 'fs';
import type { IncomingMessage, ServerResponse } from 'http';

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
  publicUrl?: string;   // opcional — se ausente, usa proxy via Express
}

function getS3Config(): S3Config | null {
  const bucket = process.env.STORAGE_S3_BUCKET;
  const accessKeyId = process.env.STORAGE_S3_ACCESS_KEY;
  const secretAccessKey = process.env.STORAGE_S3_SECRET_KEY;
  const region = process.env.STORAGE_S3_REGION || 'auto';
  const endpoint = process.env.STORAGE_S3_ENDPOINT;
  const publicUrl = process.env.STORAGE_S3_PUBLIC_URL;  // opcional

  if (!bucket || !accessKeyId || !secretAccessKey) return null;
  return { bucket, accessKeyId, secretAccessKey, publicUrl, region, endpoint };
}

async function makeS3Client(config: S3Config) {
  const { S3Client } = await import('@aws-sdk/client-s3');
  return new S3Client({
    region: config.region,
    ...(config.endpoint ? { endpoint: config.endpoint } : {}),
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    // Cloudflare R2 requer path-style (não virtual-hosted-style)
    forcePathStyle: true,
  });
}

async function s3Put(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType: string,
  config: S3Config
): Promise<{ key: string; url: string }> {
  const { PutObjectCommand } = await import('@aws-sdk/client-s3');
  const client = await makeS3Client(config);

  // Normaliza: remove leading slashes e prefixo uploads/ duplicado
  const key = relKey.replace(/^\/+/, '').replace(/^uploads\//, '');
  const buf = typeof data === 'string' ? Buffer.from(data) : Buffer.from(data as any);

  await client.send(new PutObjectCommand({
    Bucket: config.bucket,
    Key: key,
    Body: buf,
    ContentType: contentType,
    CacheControl: 'public, max-age=31536000, immutable',
  }));

  // URL pública direta se configurada; caso contrário, proxy via Express
  const url = config.publicUrl
    ? `${config.publicUrl.replace(/\/+$/, '')}/${key}`
    : `/api/uploads/${key}`;  // key já é sem 'uploads/' prefix — Express adiciona via /api/uploads route

  console.log(`[Storage] R2/S3 upload OK (${config.publicUrl ? 'público' : 'proxy'}): ${url}`);
  return { key, url };
}

/**
 * Proxy um objeto do S3/R2 para a resposta HTTP do Express.
 * Retorna false se o objeto não existir.
 */
export async function s3ServeFile(
  key: string,
  _req: IncomingMessage,
  res: ServerResponse
): Promise<boolean> {
  const config = getS3Config();
  if (!config) return false;

  try {
    const { GetObjectCommand } = await import('@aws-sdk/client-s3');
    const client = await makeS3Client(config);

    const cmd = new GetObjectCommand({ Bucket: config.bucket, Key: key });
    const obj = await client.send(cmd);

    const contentType = (obj.ContentType as string) ?? 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    if (obj.ContentLength) {
      res.setHeader('Content-Length', obj.ContentLength);
    }

    const stream = obj.Body as any;
    await new Promise<void>((resolve, reject) => {
      stream.on('error', reject).on('end', resolve).pipe(res);
    });

    return true;
  } catch (err: any) {
    if (err?.name === 'NoSuchKey' || err?.$metadata?.httpStatusCode === 404) {
      return false;
    }
    console.error('[Storage] S3 serve error:', err.message);
    return false;
  }
}

// ── Replit Object Storage (Google Cloud Storage via sidecar auth) ─────────────
function getGcsBucketId(): string | null {
  return process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID ?? null;
}

async function gcsGetClient() {
  const { Storage } = await import('@google-cloud/storage');
  return new Storage();
}

async function gcsPut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType: string,
  bucketId: string
): Promise<{ key: string; url: string }> {
  const storage = await gcsGetClient();
  const bucket = storage.bucket(bucketId);

  const fileName = relKey.replace(/^uploads\//, '');
  const key = `uploads/${fileName}`;
  const file = bucket.file(key);
  const buf = typeof data === 'string' ? Buffer.from(data) : Buffer.from(data as any);

  await file.save(buf, {
    metadata: {
      contentType,
      cacheControl: 'public, max-age=31536000, immutable',
    },
  });

  try {
    await file.makePublic();
    const url = `https://storage.googleapis.com/${bucketId}/${key}`;
    console.log(`[Storage] GCS upload OK (público): ${url}`);
    return { key, url };
  } catch (_) {
    const url = `/api/uploads/${fileName}`;
    console.log(`[Storage] GCS upload OK (proxy): ${url}`);
    return { key, url };
  }
}

export async function gcsServeFile(
  fileName: string,
  req: IncomingMessage,
  res: ServerResponse
): Promise<boolean> {
  const bucketId = getGcsBucketId();
  if (!bucketId) return false;

  try {
    const storage = await gcsGetClient();
    const bucket = storage.bucket(bucketId);
    const file = bucket.file(`uploads/${fileName}`);

    const [exists] = await file.exists();
    if (!exists) return false;

    const [metadata] = await file.getMetadata();
    const contentType = (metadata as any).contentType ?? 'application/octet-stream';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

    await new Promise<void>((resolve, reject) => {
      file.createReadStream()
        .on('error', reject)
        .on('end', resolve)
        .pipe(res as any);
    });

    return true;
  } catch (err) {
    console.error('[Storage] GCS serve error:', (err as Error).message);
    return false;
  }
}

// ── Forge proxy storage (legacy Replit storage) ───────────────────────────────
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
  // 1. S3-compatible (persistente) — publicUrl opcional, proxy se ausente
  const s3Config = getS3Config();
  if (s3Config) {
    try {
      return await s3Put(relKey, data, contentType, s3Config);
    } catch (err) {
      console.warn('[Storage] S3 upload failed, trying GCS:', (err as Error).message);
    }
  }

  // 2. Replit Object Storage / GCS (persistente)
  const gcsBucketId = getGcsBucketId();
  if (gcsBucketId) {
    try {
      return await gcsPut(relKey, data, contentType, gcsBucketId);
    } catch (err) {
      console.warn('[Storage] GCS upload failed, trying Forge:', (err as Error).message);
    }
  }

  // 3. Forge proxy (legado)
  const forgeConfig = getForgeConfig();
  if (forgeConfig) {
    try {
      return await forgePut(relKey, data, contentType, forgeConfig);
    } catch (err) {
      console.warn('[Storage] Forge upload failed, falling back to local:', (err as Error).message);
    }
  }

  // 4. Disco local (efêmero — apenas dev)
  console.warn('[Storage] WARNING: Using ephemeral local disk. Configure STORAGE_S3_* for persistent uploads.');
  return localPut(relKey, data, contentType);
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const s3Config = getS3Config();
  if (s3Config) {
    const key = relKey.replace(/^\/+/, '');
    const url = s3Config.publicUrl
      ? `${s3Config.publicUrl.replace(/\/+$/, '')}/${key}`
      : `/api/uploads/${key}`;
    return { key, url };
  }

  const gcsBucketId = getGcsBucketId();
  if (gcsBucketId) {
    const fileName = relKey.replace(/^uploads\//, '');
    return { key: relKey, url: `/api/uploads/${fileName}` };
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

export function isS3Configured(): boolean {
  return !!getS3Config();
}

export function isGcsConfigured(): boolean {
  return !!getGcsBucketId();
}
