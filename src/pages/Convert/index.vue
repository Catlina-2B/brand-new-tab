<template>
  <div class="router-list flex-left-center">
    <router-link
      to="/convert/convert"
      class="flex-column-center-center router-item"
    >
      <span class="icon">
        <IconConvert width="20" height="20" />
      </span>
      数据转换
    </router-link>
    <router-link
      to="/convert/hash"
      class="flex-column-center-center router-item"
    >
      <span class="icon">
        <IconHash width="20" height="20" />
      </span>
      哈希计算
    </router-link>
    <router-link
      to="/convert/encode-decode"
      class="flex-column-center-center router-item"
    >
      <span class="icon">
        <IconEncode width="20" height="20" />
      </span>
      编码解码
    </router-link>
  </div>
  <router-view></router-view>
</template>

<script lang="ts" setup>
import IconConvert from 'src/assets/svg/IconConvert.vue';
import IconEncode from 'src/assets/svg/IconEncode.vue';
import IconHash from 'src/assets/svg/IconHash.vue';

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
    color: var(--q-primary);
    svg {
      fill: var(--q-primary);
      stroke: var(--q-primary);
    }
    * {
      color: var(--q-primary);
    }
  }
}
</style>
