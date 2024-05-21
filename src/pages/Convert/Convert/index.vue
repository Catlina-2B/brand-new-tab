<template>
  <div class="container conver-container">
    <q-splitter v-model="splitterModel" style="height: 450px">
      <template v-slot:before>
        <q-tabs v-model="beforeType" vertical class="text-teal">
          <q-tab
            v-for="(item, index) in convertTypeOptions"
            :name="item.value"
            :label="item.label"
            :key="index"
            no-caps
          />
        </q-tabs>
      </template>
      <template v-slot:after>
        <div class="flex-left-top after-container">
          <div class="center">
            <q-input
              v-model="stringInput"
              type="textarea"
              outlined
              placeholder="请输入需要转换的内容"
            ></q-input>
            <q-separator spaced="24px" />
            <q-input
              v-model="stringOutput"
              type="textarea"
              outlined
              placeholder="结果会在这里出现"
            ></q-input>
          </div>
          <q-tabs
            v-model="afterType"
            vertical
            :switchIndicator="true"
            class="text-teal after-type"
          >
            <q-tab
              v-for="(item, index) in convertTypeOptions"
              :name="item.value"
              :label="item.label"
              :key="index"
              no-caps
            />
          </q-tabs>
        </div>
      </template>
    </q-splitter>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';

import {
  convertTypeOptions,
  ConvertType,
  convertHex,
  convertBinary,
  convertDecimal,
  convertUtf8,
  convertUtf16,
} from '../const';

defineOptions({
  name: 'convert-component',
});

const splitterModel = ref(10);
const beforeType = ref(convertTypeOptions[0].value);
const afterType = ref(convertTypeOptions[1].value);

const stringInput = ref('');
const stringOutput = ref('');

// 根据输入内容和转换类型，计算输出内容, 例如：convertString('123', 'hex', 'base64') => 'MTIz'
const convertInput = (input: string, before: string, after: ConvertType) => {
  if (before == ConvertType.hex) {
    const result = convertHex(input, after);
    return String(result);
  } else if (before == ConvertType.binary) {
    const result = convertBinary(input, after);
    return String(result);
  } else if (before == ConvertType.decimal) {
    const result = convertDecimal(input, after);
    return String(result);
  } else if (before == ConvertType.utf8) {
    const result = convertUtf8(input, after);
    return String(result);
  } else if (before == ConvertType.utf16) {
    const result = convertUtf16(input, after);
    return String(result);
  } else {
    return '';
  }
};

watch(
  () => [stringInput.value, beforeType.value, afterType.value],
  () => {
    stringOutput.value = convertInput(
      stringInput.value,
      beforeType.value,
      afterType.value as ConvertType
    );
  }
);
</script>

<style lang="scss" scoped>
.action-inputs {
  gap: 20px;
}

.type-select {
  min-width: 150px;
}

.container {
  padding: 40px 0;
}

.after-container {
  width: 100%;
  padding-left: 20px;
}

.center {
  width: 100%;
}

.after-type {
  min-width: 129px;
  flex-shrink: 0;
  margin-left: 20px;
}
</style>

<style lang="scss">
.conver-container {
  .q-splitter--vertical.q-splitter--workable > .q-splitter__separator {
    display: none;
  }
  .q-textarea .q-field__control {
    height: 200px;
    min-height: 200px;
  }
}
</style>
