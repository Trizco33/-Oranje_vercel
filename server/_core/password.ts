import { randomBytes, scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);
const SCRYPT_KEY_LENGTH = 64;
const PASSWORD_PREFIX = "scrypt";

export async function hashPassword(password: string): Promise<string> {
  const normalizedPassword = password.trim();
  if (normalizedPassword.length < 8) {
    throw new Error("PASSWORD_TOO_SHORT");
  }

  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scryptAsync(
    normalizedPassword,
    salt,
    SCRYPT_KEY_LENGTH
  )) as Buffer;

  return `${PASSWORD_PREFIX}:${salt}:${derivedKey.toString("hex")}`;
}

export async function verifyPassword(
  password: string,
  storedHash: string | null | undefined
): Promise<boolean> {
  if (!storedHash) return false;

  const [prefix, salt, expectedHash] = storedHash.split(":");
  if (
    prefix !== PASSWORD_PREFIX ||
    !salt ||
    !expectedHash
  ) {
    return false;
  }

  const normalizedPassword = password.trim();
  const derivedKey = (await scryptAsync(
    normalizedPassword,
    salt,
    SCRYPT_KEY_LENGTH
  )) as Buffer;

  const expectedBuffer = Buffer.from(expectedHash, "hex");
  if (expectedBuffer.length !== derivedKey.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, derivedKey);
}
