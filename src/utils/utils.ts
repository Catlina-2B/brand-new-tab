import { Theme, defaultTheme } from './const';

import { useQuasar } from 'quasar';

export function switchTheme(themeName: string) {
  const $q = useQuasar();
  document.body.className = themeName;
  localStorage.setItem('theme', themeName);
  try {
    if (themeName == Theme.dark) {
      $q.dark.set(true);
    } else {
      $q.dark.set(false);
    }
  } catch (err) {}
}

export function getTheme() {
  return localStorage.getItem('theme') || defaultTheme;
}
