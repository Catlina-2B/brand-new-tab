<template>
  <div class="flex-left-center container">
    <div class="item">
      <p>16进制颜色码</p>
      <q-input v-model="hexColor" outlined dense>
        <template v-slot:append>
          <IconCopy :text="hexColor" />
        </template>
      </q-input>
    </div>
    <div class="item-center">
      <IconConvertAB width="30px" height="auto" />
    </div>
    <div class="item">
      <p>RGB颜色码</p>
      <q-input v-model="rgbColor" outlined dense>
        <template v-slot:append>
          <IconCopy :text="`rgb(${rgbColor})`" />
        </template>
      </q-input>
    </div>
  </div>
  <div :style="`width: 80px; height: 40px; background: ${hexColor}`"></div>
  <div class="color-container">
    <p class="title">
      常用颜色搭配表 (来源：<a
        href="https://www.tusij.com/color/collection"
        target="_blank"
        >图司机网站</a
      >) 若有侵权，请联系本人删除
    </p>
    <q-splitter v-model="splitterModel" style="height: 550px">
      <template v-slot:before>
        <q-tabs v-model="colorType" vertical class="text-teal">
          <q-tab
            v-for="(item, index) in colorsOptions"
            :name="item.value"
            :label="item.label"
            :key="index"
            no-caps
          />
        </q-tabs>
      </template>
      <template v-slot:after>
        <div class="colors-box">
          <div class="color-box">
            <div
              class="color-item-group"
              v-for="(item, index) in colors[colorType]"
              :key="index"
            >
              <span
                class="color-item"
                v-for="(item2, index2) in item"
                :key="index2"
                :style="`background: ${item2}`"
              >
                <span class="text">{{ item2 }}</span>
              </span>
            </div>
          </div>
        </div>
      </template>
    </q-splitter>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';

import IconConvertAB from 'src/assets/svg/IconConvertAB.vue';
import IconCopy from 'src/assets/svg/IconCopy.vue';

import colors from './colors.json';

defineOptions({
  name: 'color-select',
});

const splitterModel = ref(10);
type Colors =
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'cyan'
  | 'blue'
  | 'purple';
const colorType = ref<Colors>('red');

const hexColor = ref('#000000');
const rgbColor = ref('0,0,0');

const colorsOptions = [
  { value: 'red', label: '红色' },
  { value: 'orange', label: '橙色' },
  { value: 'yellow', label: '黄色' },
  { value: 'green', label: '绿色' },
  { value: 'cyan', label: '青色' },
  { value: 'blue', label: '蓝色' },
  { value: 'purple', label: '紫色' },
];

watch(
  () => hexColor.value,
  (val) => {
    if (val.startsWith('#') && val.length === 7) {
      const r = parseInt(val.slice(1, 3), 16);
      const g = parseInt(val.slice(3, 5), 16);
      const b = parseInt(val.slice(5, 7), 16);
      rgbColor.value = `${r},${g},${b}`;
    }
  }
);

watch(
  () => rgbColor.value,
  (val) => {
    const [r, g, b] = val
      .replace(/\s/, '')
      .split(',')
      .map((v) => parseInt(v, 10));
    hexColor.value = `#${r.toString(16).padStart(2, '0')}${g
      .toString(16)
      .padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
);
</script>

<style lang="scss" scoped>
@import '../index.scss';

.item {
  p {
    margin-bottom: 5px;
  }
}

.item-center {
  margin: 0 20px;
}

.color-container {
  width: 100%;
  margin-top: 40px;
}

.title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 20px;
}

.colors-box {
  background-color: #f1f4f7;
  width: fit-content;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  border-radius: 5px;
  box-shadow: 0 0 10px #e0e4eb;
  padding: 10px;
  margin-left: 40px;
  .color-box {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 10px;
    .color-item-group {
      background: #f1f4f7;
      border: 4px solid #f1f4f7;
      box-shadow: -6px -6px 6px rgba(255, 255, 255, 0.8), 6px 6px 6px #e0e4eb;
      border-radius: 10px;
      width: 214px;
      height: 80px;
      color: #172948;
      font-size: 12px;
      display: flex;
      .color-item {
        display: inline-block;
        width: 70px;
        height: 50px;
        position: relative;
        .text {
          position: absolute;
          bottom: -25px;
          left: 50%;
          transform: translateX(-50%);
          font-weight: 500;
          font-size: 13px;
        }
      }
      .color-item:nth-child(1) {
        border-radius: 10px 0 0 10px;
      }
      .color-item:nth-child(3) {
        border-radius: 0 10px 10px 0;
      }
    }
  }
}
</style>
