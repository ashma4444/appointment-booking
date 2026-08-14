import { scryptSync, randomBytes, createHmac, timingSafeEqual } from "crypto";

const SESSION_SECRET =
  process.env.SESSION_SECRET || "dev-insecure-secret-change-me";

export const SESSION_COOKIE_NAME = "session";
export const SESSION_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

export function hashPin(pin: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(pin, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPinHash(pin: string, storedHash: string): boolean {
  const [salt, hash] = storedHash.split(":");
  if (!salt || !hash) return false;
  const hashBuffer = Buffer.from(hash, "hex");
  const candidateBuffer = scryptSync(pin, salt, 64);
  return timingSafeEqual(hashBuffer, candidateBuffer);
}

export function createSessionToken(): string {
  const expiry = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE;
  const signature = createHmac("sha256", SESSION_SECRET)
    .update(String(expiry))
    .digest("hex");
  return `${expiry}.${signature}`;
}

export function verifySessionToken(token: string): boolean {
  const dotIndex = token.indexOf(".");
  if (dotIndex === -1) return false;

  const expiryStr = token.slice(0, dotIndex);
  const signature = token.slice(dotIndex + 1);
  if (!expiryStr || !signature) return false;

  const expiry = Number(expiryStr);
  if (Number.isNaN(expiry) || expiry < Math.floor(Date.now() / 1000)) {
    return false;
  }

  const expectedSignature = createHmac("sha256", SESSION_SECRET)
    .update(expiryStr)
    .digest("hex");

  try {
    return timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(expectedSignature, "hex")
    );
  } catch {
    return false;
  }
}
