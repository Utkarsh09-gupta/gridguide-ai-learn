import crypto from "crypto";

const SESSION_SECRET = process.env.SESSION_SECRET || "gridguide_ai_secret_session_key_32_chars";

// Derive a 32-byte key from the secret for AES-256-CBC
const SECRET_KEY = crypto.scryptSync(SESSION_SECRET, "gridguide-salt", 32);

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
  return `pbkdf2_sha512$10000$${salt}$${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const parts = storedHash.split("$");
    if (parts.length !== 4) return false;
    const [, , salt, hash] = parts;
    const testHash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
    return testHash === hash;
  } catch {
    return false;
  }
}

export function encryptSession(userId: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", SECRET_KEY, iv);
  let encrypted = cipher.update(userId, "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${iv.toString("hex")}:${encrypted}`;
}

export function decryptSession(token: string): string | null {
  try {
    const [ivHex, encrypted] = token.split(":");
    if (!ivHex || !encrypted) return null;
    const iv = Buffer.from(ivHex, "hex");
    const decipher = crypto.createDecipheriv("aes-256-cbc", SECRET_KEY, iv);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch {
    return null;
  }
}
