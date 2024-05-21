/* eslint-disable */

// Forces TS to apply `@quasar/app-vite` augmentations of `quasar` package
// Removing this would break `quasar/wrappers` imports as those typings are declared
//  into `@quasar/app-vite`
// As a side effect, since `@quasar/app-vite` reference `quasar` to augment it,
//  this declaration also apply `quasar` own
//  augmentations (eg. adds `$q` into Vue component context)
/// <reference types="@quasar/app-vite" />

declare interface ABI_Result_item {
  type: string;
  value: string;
  desc?: string;
}

declare type ABI_Result = ABI_Result_item[];

interface ABI_INPUT {
  name: string;
  type: string;
  internalType?: string;
  value?: string;
}

declare interface ABI_ITEM {
  name: string;
  type: string;
  inputs: ABI_INPUT[];
  outputs?: any[];
}
