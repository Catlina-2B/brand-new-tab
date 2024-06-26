export type SOLIDITY_TYPE =
  | 'bool'
  | 'address'
  | 'string'
  | 'uint8'
  | 'uint256'
  | 'uint16'
  | 'uint32'
  | 'uint64'
  | 'uint128'
  | 'int256'
  | 'int8'
  | 'int16'
  | 'int32'
  | 'int64'
  | 'int128'
  | 'bytes32'
  | 'bytes'
  | 'bytes[]';

export interface TYPE_ARRAY {
  label: string;
  value: SOLIDITY_TYPE | '';
}

export interface ARG_TYPE {
  id: number;
  value: string;
  type: TYPE_ARRAY;
}

export const functionArgsType = [
  {
    value: 'bool',
    label: 'bool'
  },
  {
    value: 'bool[]',
    label: 'bool[]'
  },
  {
    value: 'address',
    label: 'address'
  },
  {
    value: 'address[]',
    label: 'address[]'
  },
  {
    value: 'string',
    label: 'string'
  },
  {
    value: 'string[]',
    label: 'string[]'
  },
  {
    value: 'uint8',
    label: 'uint8'
  },
  {
    value: 'uint256',
    label: 'uint256'
  },
  {
    value: 'uint16',
    label: 'uint16'
  },
  {
    value: 'uint32',
    label: 'uint32'
  },
  {
    value: 'uint64',
    label: 'uint64'
  },
  {
    value: 'uint128',
    label: 'uint128'
  },
  {
    value: 'uint256[]',
    label: 'uint256[]'
  },
  {
    value: 'uint8[]',
    label: 'uint8[]'
  },
  {
    value: 'uint16[]',
    label: 'uint16[]'
  },
  {
    value: 'uint32[]',
    label: 'uint32[]'
  },
  {
    value: 'uint64[]',
    label: 'uint64[]'
  },
  {
    value: 'uint128[]',
    label: 'uint128[]'
  },
  {
    value: 'int256',
    label: 'int256'
  },
  {
    value: 'int8',
    label: 'int8'
  },
  {
    value: 'int16',
    label: 'int16'
  },
  {
    value: 'int32',
    label: 'int32'
  },
  {
    value: 'int64',
    label: 'int64'
  },
  {
    value: 'int128',
    label: 'int128'
  },
  {
    value: 'int256[]',
    label: 'int256[]'
  },
  {
    value: 'int8[]',
    label: 'int8[]'
  },
  {
    value: 'int16[]',
    label: 'int16[]'
  },
  {
    value: 'int32[]',
    label: 'int32[]'
  },
  {
    value: 'int64[]',
    label: 'int64[]'
  },
  {
    value: 'int128[]',
    label: 'int128[]'
  }
] as TYPE_ARRAY[];

interface ABI_ITEM {
  name: string;
  type: string;
  inputs: {
    name: string;
    type: string;
  }[];
}

export type ABI_JSON = ABI_ITEM[];

export const typesRegs = {
  ['bool']: /^(true|false)$/,
  'bool[]': /^\[(true|false)(,\s*(true|false))*\]$/,
  ['address']: /^0x[a-fA-F0-9]{40}$/,
  'address[]': /^\[\"(0x[a-fA-F0-9]{40})\"(,\s*\"0x[a-fA-F0-9]{40}\")*\]$/,
  ['string']: /^.*$/, // 字符串可以是任何字符序列
  'string[]': /^\[(.*)(,\s*.*)*\]$/,
  ['uint8']: /^(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])$/,
  ['uint256']: /^\d+$/, // uint256 可以是任何非负整数，注意可能的大小限制
  ['uint16']:
    /^(6553[0-5]|655[0-2][0-9]|65[0-4][0-9]{2}|6[0-4][0-9]{3}|[1-5][0-9]{4}|[1-9][0-9]{1,3}|[0-9])$/,
  ['uint32']:
    /^(429496729[0-5]|42949672[0-8][0-9]|429496[0-6][0-9]{2}|42949[0-5][0-9]{3}|4294[0-8][0-9]{4}|429[0-3][0-9]{5}|42[0-8][0-9]{6}|4[0-1][0-9]{7}|[1-3][0-9]{8}|[1-9][0-9]{1,7}|[0-9])$/,
  ['uint64']: /^\d+$/, // uint64 可以是任何非负整数，注意可能的大小限制
  ['uint128']: /^\d+$/, // uint128 可以是任何非负整数，注意可能的大小限制
  'uint256[]': /^\[(\d+)(,\s*\d+)*\]$/, // 数组，每个元素都是非负整数
  'uint8[]':
    /^\[(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])(,\s*(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9]))*\]$/,
  'uint16[]':
    /^\[(6553[0-5]|655[0-2][0-9]|65[0-4][0-9]{2]|6[0-4][0-9]{3}|[1-5][0-9]{4}|[1-9][0-9]{1,3}|[0-9])(,\s*(6553[0-5]|655[0-2][0-9]|65[0-4][0-9]{2]|6[0-4][0-9]{3}|[1-5][0-9]{4}|[1-9][0-9]{1,3}|[0-9]))*\]$/,
  'uint32[]':
    /^\[(429496729[0-5]|42949672[0-8][0-9]|429496[0-6][0-9]{2}|42949[0-5][0-9]{3}|4294[0-8][0-9]{4}|429[0-3][0-9]{5}|42[0-8][0-9]{6}|4[0-1][0-9]{7}|[1-3][0-9]{8}|[1-9][0-9]{1,7}|[0-9])(,\s*(429496729[0-5]|42949672[0-8][0-9]|429496[0-6][0-9]{2}|42949[0-5][0-9]{3}|4294[0-8][0-9]{4}|429[0-3][0-9]{5}|42[0-8][0-9]{6}|4[0-1][0-9]{7}|[1-3][0-9]{8}|[1-9][0-9]{1,7}|[0-9]))*\]$/,
  'uint64[]': /^\[(\d+)(,\s*\d+)*\]$/, // 数组，每个元素都是非负整数
  'uint128[]': /^\[(\d+)(,\s*\d+)*\]$/, // 数组，每个元素都是非负整数
  ['int256']: /^-?\d+$/, // int256 可以是任何整数，注意可能的大小限制
  ['int8']: /^(-128|12[0-7]|1[01][0-9]|[1-9][0-9]|-[1-9]|[0-9])$/,
  ['int16']:
    /^(-32768|3276[0-7]|327[0-5][0-9]|32[0-6][0-9]{2}|3[01][0-9]{3}|[1-2][0-9]{4}|[1-9][0-9]{1,3}|-[1-9][0-9]*|[0-9])$/,
  ['int32']:
    /^(-2147483648|214748364[0-7]|21474836[0-3][0-9]|2147483[0-5][0-9]{2}|214748[0-2][0-9]{3}|21474[0-7][0-9]{4}|2147[0-3][0-9]{5}|214[0-6][0-9]{6}|21[0-3][0-9]{7}|2[0-1][0-9]{8}|1[0-9]{9}|[1-9][0-9]{1,8}|-[1-9][0-9]*|[0-9])$/,
  ['int64']: /^-?\d+$/, // int64 可以是任何整数，注意可能的大小限制
  ['int128']: /^-?\d+$/, // int128 可以是任何整数，注意可能的大小限制
  'int256[]': /^\[(-?\d+)(,\s*-?\d+)*\]$/, // 数组，每个元素都是整数
  'int8[]':
    /^\[(-128|12[0-7]|1[01][0-9]|[1-9][0-9]|-[1-9]|[0-9])(,\s*(-128|12[0-7]|1[01][0-9]|[1-9][0-9]|-[1-9]|[0-9]))*\]$/,
  'int16[]':
    /^\[(-32768|3276[0-7]|327[0-5][0-9]|32[0-6][0-9]{2}|3[01][0-9]{3}|[1-2][0-9]{4}|[1-9][0-9]{1,3}|-[1-9][0-9]*|[0-9])(,\s*(-32768|3276[0-7]|327[0-5][0-9]|32[0-6][0-9]{2}|3[01][0-9]{3}|[1-2][0-9]{4}|[1-9][0-9]{1,3}|-[1-9][0-9]*|[0-9]))*\]$/,
  'int32[]':
    /^\[(-2147483648|214748364[0-7]|21474836[0-3][0-9]|2147483[0-5][0-9]{2}|214748[0-2][0-9]{3}|21474[0-7][0-9]{4}|2147[0-3][0-9]{5}|214[0-6][0-9]{6}|21[0-3][0-9]{7}|2[0-1][0-9]{8}|1[0-9]{9}|[1-9][0-9]{1,8}|-[1-9][0-9]*|[0-9])(,\s*(-2147483648|214748364[0-7]|21474836[0-3][0-9]|2147483[0-5][0-9]{2]|214748[0-2][0-9]{3]|21474[0-7][0-9]{4]|2147[0-3][0-9]{5]|214[0-6][0-9]{6]|21[0-3][0-9]{7]|2[0-1][0-9]{8]|1[0-9]{9}|[1-9][0-9]{1,8}|-[1-9][0-9]*|[0-9]))*\]$/,
  'int64[]': /^\[(-?([1-9]\d{0,18}|0))(,\s*-?([1-9]\d{0,18}|0))*\]$/,
  'int128[]': /^\[(-?([1-9]\d{0,38}|0))(,\s*-?([1-9]\d{0,38}|0))*\]$/ // 数组，每个元素都是整数
} as Record<string, RegExp>;
