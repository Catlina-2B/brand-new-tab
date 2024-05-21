export enum Theme {
  default = 'root',
  dark = 'dark',
  clean = 'clean',
  elegant = 'elegant',
  classic = 'classic'
}

export interface ThemeItem {
  label: string;
  value: Theme;
}

export const themes: ThemeItem[] = [
  {
    label: '默认',
    value: Theme.default
  },
  {
    label: '暗黑',
    value: Theme.dark
  },
  {
    label: '简洁',
    value: Theme.clean
  },
  {
    label: '优雅',
    value: Theme.elegant
  },
  {
    label: '古典',
    value: Theme.classic
  }
];

export const defaultTheme = Theme.default;
