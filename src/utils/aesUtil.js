import CryptoJS from "crypto-js";

/**
 * Matches backend exactly:
 *   AesUtil aesUtil      = new AesUtil(128, 1000);
 *   String passPhrase    = "MATSECRETKEY2026";
 *   decrypt(salt, iv, passphrase, ciphertext)
 *
 * Backend generateKey uses PBKDF2:
 *   keySize        = 128 bits  → 128/32 = 4 words in CryptoJS
 *   iterationCount = 1000
 *   cipher         = AES/CBC/PKCS5Padding
 *
 * Backend decrypt param order: (salt, iv, passphrase, ciphertext)
 * Frontend encrypt must produce:  { ciphertext, salt, iv }
 * so backend can call:  decrypt(salt, iv, passphrase, ciphertext)
 */

const KEY_SIZE   = 128 / 32;  // 4 words = 128 bits
const ITERATIONS = 1000;
const PASSPHRASE = "MATSECRETKEY2026";

/**
 * Derives a 128-bit AES key using PBKDF2.
 * Matches backend generateKey(salt, passphrase).
 *
 * @param {string} saltHex   - random hex salt
 * @param {string} passphrase - shared secret (must match backend)
 */
const generateKey = (saltHex, passphrase) =>
  CryptoJS.PBKDF2(
    passphrase,
    CryptoJS.enc.Hex.parse(saltHex),
    {
      keySize:    KEY_SIZE,
      iterations: ITERATIONS,
      hasher:     CryptoJS.algo.SHA1, // Java PBKDF2 default uses SHA-1
    }
  );

/**
 * Encrypts plainText using AES-128-CBC with PBKDF2 key derivation.
 * Matches backend encrypt(salt, iv, passphrase, plaintext).
 *
 * @param {string} plainText   - value to encrypt (e.g. password)
 * @param {string} passphrase  - must match backend passphrase (default: MATSECRETKEY2026)
 *
 * @returns {{ ciphertext: string, salt: string, iv: string }}
 *   ciphertext : Base64 string  → send as "password" field
 *   salt       : Hex string     → send as "salt" field
 *   iv         : Hex string     → send as "iv" field
 *
 * Backend call will be: aesUtil.decrypt(salt, iv, passPhrase, ciphertext)
 */
export const aesEncrypt = (plainText, passphrase = PASSPHRASE) => {
  const saltHex = CryptoJS.lib.WordArray.random(16).toString(CryptoJS.enc.Hex);
  const ivHex   = CryptoJS.lib.WordArray.random(16).toString(CryptoJS.enc.Hex);

  const key = generateKey(saltHex, passphrase);
  const iv  = CryptoJS.enc.Hex.parse(ivHex);

  const encrypted = CryptoJS.AES.encrypt(
    CryptoJS.enc.Utf8.parse(plainText),
    key,
    {
      iv,
      mode:    CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7, // PKCS5Padding in Java = PKCS7 in CryptoJS
    }
  );

  return {
    ciphertext: encrypted.toString(), // Base64
    salt:       saltHex,              // Hex
    iv:         ivHex,                // Hex
  };
};

/**
 * Decrypts ciphertext — useful for local testing only.
 * Mirrors backend: decrypt(salt, iv, passphrase, ciphertext)
 */
export const aesDecrypt = (saltHex, ivHex, passphrase = PASSPHRASE, ciphertext) => {
  const key = generateKey(saltHex, passphrase);
  const iv  = CryptoJS.enc.Hex.parse(ivHex);

  const decrypted = CryptoJS.AES.decrypt(ciphertext, key, {
    iv,
    mode:    CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return decrypted.toString(CryptoJS.enc.Utf8);
};
