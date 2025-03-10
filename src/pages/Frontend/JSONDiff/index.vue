<template>
  <div class="container">
    <q-splitter v-model="splitterModel" style="min-height: 400px" separator-class="separator">
      <template v-slot:before>
        <div class="flex-column-left-top data-input">
          <div class="text-h6 q-mb-md">Old：</div>
          <q-input class="data-input-ele" v-model="oldData" type="textarea" outlined :error="error1"
            error-message="请输入正确的JSON格式" />
        </div>
      </template>
      <template v-slot:separator>
        <q-avatar color="primary" text-color="white" size="40px" icon="drag_indicator" />
      </template>
      <template v-slot:after>
        <div class="flex-column-left-top data-input">
          <div class="text-h6 q-mb-md">New：</div>
          <q-input class="data-input-ele" v-model="newData" type="textarea" outlined :error="error2"
            error-message="请输入正确的JSON格式" />
        </div>
      </template>
    </q-splitter>

    <!-- 添加排序选项 -->
    <div class="q-mt-md q-mb-md sort-options">
      <div class="text-subtitle2 q-mb-xs">排序设置:</div>
      <div class="row q-gutter-sm">
        <q-toggle v-model="sortOptions.enabled" label="启用排序" />
        <q-select v-model="sortOptions.keyOrder" :options="keyOrderOptions" dense options-dense label="键排序方式"
          class="q-ml-md" :disable="!sortOptions.enabled" style="width: 150px" />
        <q-toggle v-model="sortOptions.numericKeys" label="数字键按数值排序" :disable="!sortOptions.enabled" />
        <q-toggle v-model="sortOptions.sortArrays" label="对数组排序" :disable="!sortOptions.enabled" />
      </div>
    </div>

    <q-btn color="primary" no-caps @click="diff">对比</q-btn>
    <div class="diff-container">
      <CodeDiff :old-string="oldStr" :new-string="newStr" output-format="side-by-side" />
    </div>

    <!-- 显示对比统计信息 -->
    <div v-if="diffStats.show" class="diff-stats q-mt-md">
      <div class="text-subtitle1 q-mb-sm">对比统计:</div>
      <div class="row q-gutter-md">
        <q-chip color="grey-7" text-color="white">
          原JSON属性数: {{ diffStats.oldProps }}
        </q-chip>
        <q-chip color="grey-7" text-color="white">
          新JSON属性数: {{ diffStats.newProps }}
        </q-chip>
        <q-chip :color="diffStats.diffProps > 0 ? 'positive' : (diffStats.diffProps < 0 ? 'negative' : 'grey-7')"
          text-color="white">
          新增属性: {{ diffStats.addedProps }}
        </q-chip>
        <q-chip :color="diffStats.removedProps > 0 ? 'negative' : 'grey-7'" text-color="white">
          移除属性: {{ diffStats.removedProps }}
        </q-chip>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';

import { CodeDiff } from 'v-code-diff';

defineOptions({
  name: 'json-diff',
});

const splitterModel = ref(50);

const oldData = ref('');
const newData = ref('');

const oldStr = ref('');
const newStr = ref('');

const error1 = ref(false);
const error2 = ref(false);

const keyOrderOptions = [
  { label: '字母顺序', value: 'alphabetical' },
  { label: '长度顺序', value: 'length' },
  { label: '类型顺序', value: 'type' }
];

// 排序选项
const sortOptions = reactive({
  enabled: true,
  keyOrder: keyOrderOptions[0],
  numericKeys: true,
  sortArrays: false
});

// 比较统计
const diffStats = reactive({
  show: false,
  oldProps: 0,
  newProps: 0,
  diffProps: 0,
  addedProps: 0,
  removedProps: 0
});

const diff = () => {
  diffStats.show = false;

  try {
    const oldObj = JSON.parse(oldData.value);
    let processedOldObj = oldObj;

    if (sortOptions.enabled) {
      processedOldObj = sortJsonKeys(oldObj);
    }

    oldStr.value = JSON.stringify(processedOldObj, null, 2);
    error1.value = false;
  } catch (err) {
    error1.value = true;
    return;
  }

  try {
    const newObj = JSON.parse(newData.value);
    let processedNewObj = newObj;

    if (sortOptions.enabled) {
      processedNewObj = sortJsonKeys(newObj);
    }

    newStr.value = JSON.stringify(processedNewObj, null, 2);
    error2.value = false;

    // 计算统计信息
    if (!error1.value && !error2.value) {
      calculateDiffStats(JSON.parse(oldData.value), JSON.parse(newData.value));
      diffStats.show = true;
    }
  } catch (err) {
    error2.value = true;
  }
};

// 递归对JSON对象的键进行排序
const sortJsonKeys = (obj: any): any => {
  // 如果不是对象或为null，直接返回
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  // 如果是数组，根据设置决定是否对数组元素进行排序
  if (Array.isArray(obj)) {
    const sortedArray = obj.map(item => sortJsonKeys(item));

    // 如果启用了数组排序，并且数组元素是简单类型（非对象），则对数组排序
    if (sortOptions.sortArrays && obj.length > 0 && obj.every(item => typeof item !== 'object' || item === null)) {
      return sortedArray.sort((a, b) => {
        if (typeof a === 'number' && typeof b === 'number') {
          return a - b;
        }
        if (typeof a === 'string' && typeof b === 'string') {
          return a.localeCompare(b);
        }
        return String(a).localeCompare(String(b));
      });
    }

    return sortedArray;
  }

  // 对象情况：获取所有键
  const allKeys = Object.keys(obj);
  let sortedKeys: string[] = [];

  // 根据选择的排序方式进行排序
  if (sortOptions.keyOrder.value === 'alphabetical') {
    sortedKeys = allKeys.sort((a, b) => {
      // 如果启用了数字键按数值排序，且两个键都可以转换为数字
      if (sortOptions.numericKeys && /^\d+$/.test(a) && /^\d+$/.test(b)) {
        return parseInt(a, 10) - parseInt(b, 10);
      }
      return a.localeCompare(b);
    });
  } else if (sortOptions.keyOrder.value === 'length') {
    sortedKeys = allKeys.sort((a, b) => a.length - b.length || a.localeCompare(b));
  } else if (sortOptions.keyOrder.value === 'type') {
    // 按类型排序：对象 > 数组 > 字符串 > 数字 > 布尔值 > null
    const getTypeWeight = (key: string) => {
      const value = obj[key];
      if (value === null) return 5;
      if (typeof value === 'boolean') return 4;
      if (typeof value === 'number') return 3;
      if (typeof value === 'string') return 2;
      if (Array.isArray(value)) return 1;
      if (typeof value === 'object') return 0;
      return 6;
    };

    sortedKeys = allKeys.sort((a, b) => {
      const weightDiff = getTypeWeight(a) - getTypeWeight(b);
      return weightDiff !== 0 ? weightDiff : a.localeCompare(b);
    });
  }

  // 构建排序后的对象
  const sortedObj: Record<string, any> = {};
  sortedKeys.forEach(key => {
    sortedObj[key] = sortJsonKeys(obj[key]);
  });

  return sortedObj;
};

// 计算对比统计信息
const calculateDiffStats = (oldObj: any, newObj: any) => {
  // 获取所有属性（包括嵌套属性）
  const getAllProps = (obj: any, prefix = '', result: Set<string> = new Set()) => {
    if (typeof obj !== 'object' || obj === null) {
      return result;
    }

    if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        if (typeof item === 'object' && item !== null) {
          getAllProps(item, `${prefix}[${index}]`, result);
        } else {
          result.add(`${prefix}[${index}]`);
        }
      });
    } else {
      Object.keys(obj).forEach(key => {
        const newPrefix = prefix ? `${prefix}.${key}` : key;
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          getAllProps(obj[key], newPrefix, result);
        } else {
          result.add(newPrefix);
        }
      });
    }

    return result;
  };

  const oldProps = getAllProps(oldObj);
  const newProps = getAllProps(newObj);

  // 计算统计数据
  diffStats.oldProps = oldProps.size;
  diffStats.newProps = newProps.size;

  // 找出添加和删除的属性
  const addedProps = new Set([...newProps].filter(x => !oldProps.has(x)));
  const removedProps = new Set([...oldProps].filter(x => !newProps.has(x)));

  diffStats.addedProps = addedProps.size;
  diffStats.removedProps = removedProps.size;
  diffStats.diffProps = diffStats.newProps - diffStats.oldProps;
};
</script>

<style lang="scss" scoped>
@import '../index.scss';

.data-input {
  width: 100%;
  height: 100%;

  .data-input-ele {
    width: 100%;
    height: 100%;
  }
}

.diff-container {
  margin-top: 20px;
}

.sort-options {
  background-color: rgba(0, 0, 0, 0.03);
  padding: 10px;
  border-radius: 4px;
}

.diff-stats {
  background-color: rgba(0, 0, 0, 0.03);
  padding: 12px;
  border-radius: 4px;
}
</style>
<style lang="scss">
.q-textarea .q-field__control {
  min-height: 300px;
  height: 100%;
}

.separator {
  background-color: var(--q-background);
}
</style>
