import { md5 } from 'js-md5';

import CryptoJs from 'crypto-js';

export function hashMd5(str: string) {
  const hash = md5.create();
  hash.update(str);
  return hash.hex();
}

export function hashSha1(str: string) {
  return CryptoJs.SHA1(str).toString();
}

// hashSha256
export function hashSha256(str: string) {
  return CryptoJs.SHA256(str).toString();
}

// hashSha512
export function hashSha512(str: string) {
  return CryptoJs.SHA512(str).toString();
}

// hashSha3
export function hashSha3(str: string) {
  return CryptoJs.SHA3(str).toString();
}

// hashKeccak224
export function hashKeccak224(str: string) {
  return CryptoJs.enc.Hex.stringify(CryptoJs.SHA3(str, { outputLength: 224 }));
}

// hashKeccak256
export function hashKeccak256(str: string) {
  return CryptoJs.enc.Hex.stringify(CryptoJs.SHA3(str, { outputLength: 256 }));
}

// hashKeccak384
export function hashKeccak384(str: string) {
  return CryptoJs.enc.Hex.stringify(CryptoJs.SHA3(str, { outputLength: 384 }));
}

// hashKeccak512
export function hashKeccak512(str: string) {
  return CryptoJs.enc.Hex.stringify(CryptoJs.SHA3(str, { outputLength: 512 }));
}
