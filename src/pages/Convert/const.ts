export enum CodeType {
  Base64Encode = 'base64-encode',
  Base64Decode = 'base64-decode',
  UrlEncode = 'url-encode',
  UrlDecode = 'url-decode'
}

export enum ConvertType {
  hex = 'hex',
  binary = 'binary',
  decimal = 'decimal',
  utf8 = 'utf8',
  utf16 = 'utf16'
}

export enum hashType {
  md5 = 'md5',
  sha1 = 'sha1',
  sha256 = 'sha256',
  sha512 = 'sha512',
  sha3 = 'sha3',
  keccak224 = 'keccak224',
  keccak256 = 'keccak256',
  keccak384 = 'keccak384',
  keccak512 = 'keccak512'
}

export const encodeOrDecodeOptions = [
  {
    value: CodeType.Base64Encode,
    label: 'Base64编码'
  },
  {
    value: CodeType.Base64Decode,
    label: 'Base64解码'
  },
  {
    value: CodeType.UrlEncode,
    label: 'URL编码'
  },
  {
    value: CodeType.UrlDecode,
    label: 'URL解码'
  }
];

export const convertTypeOptions = [
  {
    value: ConvertType.hex,
    label: 'Hex'
  },
  {
    value: ConvertType.utf8,
    label: 'UTF-8'
  },
  {
    value: ConvertType.utf16,
    label: 'UTF-16'
  },
  {
    value: ConvertType.decimal,
    label: 'Decimal'
  },
  {
    value: ConvertType.binary,
    label: 'Binary'
  }
];

export const hashTypeOptions = [
  {
    value: hashType.md5,
    label: 'MD5'
  },
  {
    value: hashType.sha1,
    label: 'SHA1'
  },
  {
    value: hashType.sha256,
    label: 'SHA256'
  },
  {
    value: hashType.sha512,
    label: 'SHA512'
  },
  {
    value: hashType.sha3,
    label: 'SHA3'
  },
  {
    value: hashType.keccak224,
    label: 'Keccak224'
  },
  {
    value: hashType.keccak256,
    label: 'Keccak256'
  },
  {
    value: hashType.keccak384,
    label: 'Keccak384'
  },
  {
    value: hashType.keccak512,
    label: 'Keccak512'
  }
];

// 16进制转2进制
function hexToBinary(hex: string) {
  return parseInt(hex, 16).toString(2);
}

// 16进制转10进制
function hexToDecimal(hex: string) {
  return parseInt(hex, 16);
}

// 16进制转UTF-8
function hexToUtf8(hex: string) {
  const bytes = [];
  for (let i = 0; i < hex.length; i += 2) {
    bytes.push(parseInt(hex.substring(i, i + 2), 16));
  }
  return new TextDecoder().decode(new Uint8Array(bytes));
}

// 16进制转UTF-16
function hexToUtf16(hex: string) {
  let result = '';
  for (let i = 0; i < hex.length; i += 4) {
    result += String.fromCharCode(parseInt(hex.substring(i, i + 4), 16));
  }
  return result;
}

// hex类型转换
export const convertHex = (hex: string, type: ConvertType) => {
  switch (type) {
    case ConvertType.binary:
      return hexToBinary(hex);
    case ConvertType.decimal:
      return hexToDecimal(hex);
    case ConvertType.utf8:
      return hexToUtf8(hex);
    case ConvertType.utf16:
      return hexToUtf16(hex);
    default:
      return hex;
  }
};

// 2进制转16进制
function binaryToHex(binary: string) {
  return parseInt(binary, 2).toString(16);
}

// 2进制转10进制
function binaryToDecimal(binary: string) {
  return parseInt(binary, 2);
}

// 2进制转UTF-8
function binaryToUtf8(binary: string) {
  const bytes = [];
  for (let i = 0; i < binary.length; i += 8) {
    bytes.push(parseInt(binary.substring(i, i + 8), 2));
  }
  return new TextDecoder().decode(new Uint8Array(bytes));
}

// 2进制转UTF-16
function binaryToUtf16(binary: string) {
  let result = '';
  for (let i = 0; i < binary.length; i += 16) {
    result += String.fromCharCode(parseInt(binary.substring(i, i + 16), 2));
  }
  return result;
}

export const convertBinary = (binary: string, type: ConvertType) => {
  switch (type) {
    case ConvertType.hex:
      return binaryToHex(binary);
    case ConvertType.decimal:
      return binaryToDecimal(binary);
    case ConvertType.utf8:
      return binaryToUtf8(binary);
    case ConvertType.utf16:
      return binaryToUtf16(binary);
    default:
      return binary;
  }
};

// 10进制转16进制
function decimalToHex(decimal: string) {
  return parseInt(decimal, 10).toString(16);
}

// 10进制转2进制
function decimalToBinary(decimal: string) {
  return parseInt(decimal, 10).toString(2);
}

// 10进制转UTF-8
function decimalToUtf8(decimal: string) {
  const bytes = [];
  bytes.push(parseInt(decimal, 10));
  return new TextDecoder().decode(new Uint8Array(bytes));
}

// 10进制转UTF-16
function decimalToUtf16(decimal: string) {
  return String.fromCharCode(parseInt(decimal, 10));
}

export const convertDecimal = (decimal: string, type: ConvertType) => {
  switch (type) {
    case ConvertType.hex:
      return decimalToHex(decimal);
    case ConvertType.binary:
      return decimalToBinary(decimal);
    case ConvertType.utf8:
      return decimalToUtf8(decimal);
    case ConvertType.utf16:
      return decimalToUtf16(decimal);
    default:
      return decimal;
  }
};

// UTF-8转16进制
function utf8ToHex(utf8: string) {
  const bytes = new TextEncoder().encode(utf8);
  const hex = [];
  for (let i = 0; i < bytes.length; i++) {
    hex.push(bytes[i].toString(16));
  }
  return hex.join('');
}

// UTF-8转2进制
function utf8ToBinary(utf8: string) {
  const bytes = new TextEncoder().encode(utf8);
  const binary = [];
  for (let i = 0; i < bytes.length; i++) {
    binary.push(bytes[i].toString(2));
  }
  return binary.join('');
}

// UTF-8转10进制
function utf8ToDecimal(utf8: string) {
  const bytes = new TextEncoder().encode(utf8);
  return bytes[0];
}

// UTF-8转UTF-16
function utf8ToUtf16(utf8: string) {
  const bytes = new TextEncoder().encode(utf8);
  return String.fromCharCode(bytes[0]);
}

export const convertUtf8 = (utf8: string, type: ConvertType) => {
  switch (type) {
    case ConvertType.hex:
      return utf8ToHex(utf8);
    case ConvertType.binary:
      return utf8ToBinary(utf8);
    case ConvertType.decimal:
      return utf8ToDecimal(utf8);
    case ConvertType.utf16:
      return utf8ToUtf16(utf8);
    default:
      return utf8;
  }
};

// UTF-16转16进制
function utf16ToHex(utf16: string) {
  const hex = [];
  for (let i = 0; i < utf16.length; i++) {
    hex.push(utf16.charCodeAt(i).toString(16));
  }
  return hex.join('');
}

// UTF-16转2进制
function utf16ToBinary(utf16: string) {
  const binary = [];
  for (let i = 0; i < utf16.length; i++) {
    binary.push(utf16.charCodeAt(i).toString(2));
  }
  return binary.join('');
}

// UTF-16转10进制
function utf16ToDecimal(utf16: string) {
  return utf16.charCodeAt(0);
}

// UTF-16转UTF-8
function utf16ToUtf8(utf16: string) {
  return String.fromCharCode(utf16.charCodeAt(0));
}

export const convertUtf16 = (utf16: string, type: ConvertType) => {
  switch (type) {
    case ConvertType.hex:
      return utf16ToHex(utf16);
    case ConvertType.binary:
      return utf16ToBinary(utf16);
    case ConvertType.decimal:
      return utf16ToDecimal(utf16);
    case ConvertType.utf8:
      return utf16ToUtf8(utf16);
    default:
      return utf16;
  }
};
