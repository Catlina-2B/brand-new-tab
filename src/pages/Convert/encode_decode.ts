// base64编码
export function base64Encode(str: string): string {
  return btoa(str);
}

// base64解码
export function base64Decode(str: string): string {
  return atob(str);
}

// url编码
export function urlEncode(str: string): string {
  return encodeURIComponent(str);
}

// url解码
export function urlDecode(str: string): string {
  return decodeURIComponent(str);
}
