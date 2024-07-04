<template>
  <div class="router-list flex-left-center">
    <router-link
      to="/front-end/json-diff"
      class="flex-column-center-center router-item"
    >
      <span class="icon">
        <IconJsonDiff width="20" height="20" />
      </span>
      JSON Diff
    </router-link>
    <router-link
      to="/front-end/image-to-base64"
      class="flex-column-center-center router-item"
    >
      <span class="icon">
        <IconImageBase64 width="20" height="20" />
      </span>
      图片转Base64
    </router-link>
    <router-link
      to="/front-end/draw-online"
      class="flex-column-center-center router-item"
    >
      <span class="icon">
        <IconDraw width="20" height="20" />
      </span>
      在线画板
    </router-link>
    <router-link
      to="/front-end/color-select"
      class="flex-column-center-center router-item"
    >
      <span class="icon">
        <IconColor width="20" height="20" />
      </span>
      颜色进制转换
    </router-link>
  </div>
  <router-view></router-view>
</template>

<script lang="ts" setup>
import IconImageBase64 from 'src/assets/svg/IconImageBase64.vue';
import IconJsonDiff from 'src/assets/svg/IconJsonDiff.vue';
import IconDraw from 'src/assets/svg/IconDraw.vue';
import IconColor from 'src/assets/svg/IconColor.vue';

defineOptions({
  name: 'convert-container',
});
</script>

<style lang="scss" scoped>
.action-inputs {
  gap: 20px;
}

.type-select {
  min-width: 150px;
}

.router-list {
  width: 100%;
  gap: 20px;
}

.router-item {
  padding: 4px 14px;
  border-radius: 10px;
  background: var(--q-border);
  color: var(--q-icon);
  cursor: pointer;
  text-decoration: none;
  .icon {
    padding: 6px;
    box-sizing: content-box;
    display: inline-flex;
  }
  &:hover {
    background: var(--q-hover-bg);
    transition: background 0.2s ease-in;
    color: var(--q-hover-text);
    svg {
      fill: var(--q-hover-text);
      stroke: var(--q-hover-text);
    }
    * {
      color: var(--q-hover-text);
    }
  }
}
</style>
