import crypto from "crypto";

// RFC 4648 base32 (no padding) — the standard encoding authenticator apps
// (Google Authenticator, Authy, 1Password, etc.) expect for a TOTP secret.
const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

const base32Encode = (buffer: Buffer): string => {
  let bits = "";
  for (const byte of buffer) bits += byte.toString(2).padStart(8, "0");

  let output = "";
  for (let i = 0; i + 5 <= bits.length; i += 5) {
    output += BASE32_ALPHABET[parseInt(bits.slice(i, i + 5), 2)];
  }
  const remainder = bits.length % 5;
  if (remainder > 0) {
    const lastChunk = bits.slice(bits.length - remainder).padEnd(5, "0");
    output += BASE32_ALPHABET[parseInt(lastChunk, 2)];
  }
  return output;
};

const base32Decode = (encoded: string): Buffer => {
  const clean = encoded.toUpperCase().replace(/[^A-Z2-7]/g, "");
  let bits = "";
  for (const char of clean) {
    const index = BASE32_ALPHABET.indexOf(char);
    if (index === -1) continue;
    bits += index.toString(2).padStart(5, "0");
  }
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.slice(i, i + 8), 2));
  }
  return Buffer.from(bytes);
};

const TIME_STEP_SECONDS = 30;
const DIGITS = 6;

// RFC 6238 TOTP over an RFC 4226 HOTP core: HMAC-SHA1(secret, counter),
// dynamic truncation to a 6-digit code that rotates every 30 seconds.
const hotp = (secretBuffer: Buffer, counter: number): string => {
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigUInt64BE(BigInt(counter));

  const hmac = crypto.createHmac("sha1", secretBuffer).update(counterBuffer).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  return String(binary % 10 ** DIGITS).padStart(DIGITS, "0");
};

export const generateSecret = (): string => base32Encode(crypto.randomBytes(20));

export const otpauthUrl = (secret: string, accountEmail: string, issuer = "ERP Suite"): string => {
  const label = encodeURIComponent(`${issuer}:${accountEmail}`);
  const params = new URLSearchParams({
    secret,
    issuer,
    algorithm: "SHA1",
    digits: String(DIGITS),
    period: String(TIME_STEP_SECONDS),
  });
  return `otpauth://totp/${label}?${params.toString()}`;
};

export const generateToken = (secret: string, forTimeMs: number = Date.now()): string => {
  const counter = Math.floor(forTimeMs / 1000 / TIME_STEP_SECONDS);
  return hotp(base32Decode(secret), counter);
};

// Accepts a code from the current 30s window or one step either side, to
// tolerate normal clock drift between the server and the user's phone.
export const verifyToken = (secret: string, token: string, window = 1): boolean => {
  if (!/^\d{6}$/.test(token)) return false;

  const secretBuffer = base32Decode(secret);
  const counter = Math.floor(Date.now() / 1000 / TIME_STEP_SECONDS);

  for (let errorWindow = -window; errorWindow <= window; errorWindow++) {
    if (hotp(secretBuffer, counter + errorWindow) === token) return true;
  }
  return false;
};
