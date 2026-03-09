/**
 * shared/encryption.js
 * End-to-end encryption helpers shared by frontend & backend.
 * Uses the Web Crypto API (browser) or Node's built-in crypto.
 *
 * Strategy: AES-GCM 256-bit symmetric key derived from a shared
 * passphrase via PBKDF2. Key is never sent over the wire.
 */

const isNode = typeof window === "undefined";

// ─── Helpers ────────────────────────────────────────────────────────────────

function getSubtle() {
  if (isNode) return require("crypto").webcrypto.subtle;
  return window.crypto.subtle;
}

function getRandomValues(arr) {
  if (isNode) return require("crypto").webcrypto.getRandomValues(arr);
  return window.crypto.getRandomValues(arr);
}

function buf2hex(buf) {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hex2buf(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++)
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  return bytes.buffer;
}

// ─── Key derivation ──────────────────────────────────────────────────────────

/**
 * Derive a CryptoKey from a passphrase using PBKDF2.
 * @param {string} passphrase  - Shared secret (e.g. env var APP_SHARED_SECRET)
 * @param {string} saltHex     - Hex-encoded 16-byte salt
 */
async function deriveKey(passphrase, saltHex) {
  const subtle = getSubtle();
  const enc = new TextEncoder();
  const baseKey = await subtle.importKey(
    "raw",
    enc.encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: hex2buf(saltHex),
      iterations: 200_000,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

// ─── Encrypt ─────────────────────────────────────────────────────────────────

/**
 * Encrypt plaintext with AES-GCM.
 * Returns a single hex string: salt(32) + iv(24) + ciphertext.
 */
async function encryptMessage(plaintext, passphrase) {
  const subtle = getSubtle();
  const salt = new Uint8Array(16);
  const iv = new Uint8Array(12);
  getRandomValues(salt);
  getRandomValues(iv);

  const saltHex = buf2hex(salt);
  const key = await deriveKey(passphrase, saltHex);
  const enc = new TextEncoder();
  const cipherBuf = await subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(plaintext)
  );

  return saltHex + buf2hex(iv) + buf2hex(cipherBuf);
}

// ─── Decrypt ─────────────────────────────────────────────────────────────────

/**
 * Decrypt a hex string produced by encryptMessage.
 */
async function decryptMessage(hexPayload, passphrase) {
  const subtle = getSubtle();
  const saltHex = hexPayload.slice(0, 32);       // 16 bytes → 32 hex chars
  const ivHex   = hexPayload.slice(32, 56);       // 12 bytes → 24 hex chars
  const cipherHex = hexPayload.slice(56);

  const iv = new Uint8Array(hex2buf(ivHex));
  const key = await deriveKey(passphrase, saltHex);

  const plainBuf = await subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    hex2buf(cipherHex)
  );
  return new TextDecoder().decode(plainBuf);
}

// ─── Exports ─────────────────────────────────────────────────────────────────

if (isNode) {
  module.exports = { encryptMessage, decryptMessage };
} else {
  window.E2E = { encryptMessage, decryptMessage };
}

export { encryptMessage, decryptMessage };
