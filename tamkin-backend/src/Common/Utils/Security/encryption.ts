import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-ctr';
const IV_LENGTH = 16;

function getKey(): Buffer {
  const CRYPTO_KEY = process.env.CRYPTO_KEY;

  if (!CRYPTO_KEY) {
    throw new Error('CRYPTO_KEY is missing in environment variables');
  }

  return crypto.scryptSync(CRYPTO_KEY, 'salt', 32);
}

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = getKey();

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(text, 'utf8'),
    cipher.final(),
  ]);

  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decrypt(cipherText: string): string {
  const [ivHex, encryptedHex] = cipherText.split(':');

  if (!ivHex || !encryptedHex) {
    throw new Error('Invalid encrypted text format');
  }

  const key = getKey();
  const iv = Buffer.from(ivHex, 'hex');
  const encryptedText = Buffer.from(encryptedHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

  const decrypted = Buffer.concat([
    decipher.update(encryptedText),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
}