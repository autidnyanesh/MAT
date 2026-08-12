import CryptoJS from "crypto-js";

/**
 * Matches backend AESCrypt (WAR):
 * PBKDF2-HMAC-SHA256 (65536, 256-bit) + AES-CBC + zero IV.
 * Wire format: { data: base64Ciphertext, hmac: base64Hmac }
 */

const SECRET =
  process.env.REACT_APP_PAYLOAD_SECRET ||
  "6FEA14735E4498A90175052342443AF11DAF83B0D93862C1692DF0E3226092F8";
const SALT =
  process.env.REACT_APP_PAYLOAD_SALT || "DB65FC256FE33913";

const HMAC_ENABLED = process.env.REACT_APP_PAYLOAD_HMAC !== "false";
const PAYLOAD_ENABLED = process.env.REACT_APP_PAYLOAD_ENCRYPTION !== "false";

function deriveKey() {
  return CryptoJS.PBKDF2(SECRET, CryptoJS.enc.Utf8.parse(SALT), {
    keySize: 256 / 32,
    iterations: 65536,
    hasher: CryptoJS.algo.SHA256,
  });
}

function zeroIv() {
  return CryptoJS.lib.WordArray.create(new Array(16).fill(0));
}

export function isPayloadEncryptionEnabled() {
  return PAYLOAD_ENABLED;
}

export function encryptPayload(plainObjectOrString) {
  const plain =
    typeof plainObjectOrString === "string"
      ? plainObjectOrString
      : JSON.stringify(plainObjectOrString ?? {});

  const key = deriveKey();
  const encrypted = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(plain), key, {
    iv: zeroIv(),
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  // ciphertext only (Base64), matching Java Base64(cipher.doFinal(...))
  const data = CryptoJS.enc.Base64.stringify(encrypted.ciphertext);
  const hmac = HMAC_ENABLED ? generateHmac(data) : null;
  return { data, hmac };
}

export function decryptPayload(envelope) {
  if (!envelope || typeof envelope.data !== "string") {
    return envelope;
  }
  if (HMAC_ENABLED && !verifyHmac(envelope.data, envelope.hmac)) {
    throw new Error("Invalid payload HMAC");
  }

  const key = deriveKey();
  const cipherParams = CryptoJS.lib.CipherParams.create({
    ciphertext: CryptoJS.enc.Base64.parse(envelope.data),
  });
  const decrypted = CryptoJS.AES.decrypt(cipherParams, key, {
    iv: zeroIv(),
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  const text = decrypted.toString(CryptoJS.enc.Utf8);
  if (!text) {
    throw new Error("Payload decryption failed");
  }
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export function generateHmac(encryptedInput) {
  const hash = CryptoJS.HmacSHA256(encryptedInput, SECRET);
  return CryptoJS.enc.Base64.stringify(hash);
}

export function verifyHmac(encryptedInput, hmac) {
  if (!HMAC_ENABLED) return true;
  if (!hmac) return false;
  return generateHmac(encryptedInput) === hmac;
}
