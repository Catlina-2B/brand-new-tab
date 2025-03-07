<template>
  <router-view />
</template>

<script setup lang="ts">
import { onBeforeMount } from 'vue';

import { switchTheme } from 'src/utils/utils';

import { Theme } from 'src/utils/const';

defineOptions({
  name: 'App',
});

onBeforeMount(() => {
  switchTheme((localStorage.getItem('theme') as Theme) || Theme.default);

  // 检查浏览器是否支持prefers-color-scheme媒体查询
  // if (
  //   window.matchMedia &&
  //   window.matchMedia('(prefers-color-scheme)').media !== 'not all'
  // ) {
  //   // 检查当前的主题
  //   const isDarkMode = window.matchMedia(
  //     '(prefers-color-scheme: dark)'
  //   ).matches;
  //   const isLightMode = window.matchMedia(
  //     '(prefers-color-scheme: light)'
  //   ).matches;

  //   if (isDarkMode) {
  //     switchTheme(Theme.dark);
  //   } else if (isLightMode) {
  //     switchTheme(Theme.default);
  //     console.log('当前系统主题是浅色模式');
  //   } else {
  //     console.log('当前系统主题既不是浅色也不是深色');
  //   }

  //   // 监听系统主题变化
  //   window
  //     .matchMedia('(prefers-color-scheme: dark)')
  //     .addEventListener('change', (event) => {
  //       if (event.matches) {
  //         console.log('系统主题切换到深色模式');
  //       } else {
  //         console.log('系统主题切换到浅色模式');
  //       }
  //     });
  // } else {
  //   console.log('浏览器不支持prefers-color-scheme媒体查询');
  // }
});
</script>

<style lang="scss">
@import './assets/font/font.css';
@import 'src/css/flex.scss';
@import 'src/css/tailwind.css';

body {
  margin: 0;
  padding: 0;
  color: var(--text);
  background-color: var(--q-background);
}

* {
  box-sizing: border-box;
  color: var(--q-text);
  font-family: Ubantu Sans, '微软雅黑' sans-serif;
}

svg {
  fill: var(--q-icon);
  stroke: var(--q-icon);
  transition: all 0.2s;
}

img {
  user-select: none;
}

.wrap-icon,
.wrap-ele {
  display: inline-flex;
  cursor: pointer;
  padding: 10px;
  border-radius: 10px;
  transition: background 0.2s ease-in;

  * {
    transition: background 0.2s ease-in;
  }

  &:hover {
    background: var(--q-text);

    svg {
      fill: var(--q-background);
      stroke: var(--q-background);
    }

    * {
      color: var(--q-background);
    }
  }
}

.q-item--clickable:hover {
  background: var(--q-hoverable-hover);
  border-radius: 10px;
}
</style>
