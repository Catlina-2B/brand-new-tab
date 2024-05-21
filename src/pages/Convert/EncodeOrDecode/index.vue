<template>
  <div class="container conver-container">
    <q-splitter v-model="splitterModel" style="height: 450px">
      <template v-slot:before>
        <q-tabs v-model="beforeType" vertical class="text-teal">
          <q-tab
            v-for="(item, index) in encodeOrDecodeOptions"
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
        </div>
      </template>
    </q-splitter>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';

import { encodeOrDecodeOptions, CodeType } from '../const';

import {
  base64Encode,
  base64Decode,
  urlEncode,
  urlDecode,
} from '../encode_decode';

defineOptions({
  name: 'convert-component',
});

const splitterModel = ref(10);
const beforeType = ref(encodeOrDecodeOptions[0].value);

const stringInput = ref('');
const stringOutput = ref('');

// 根据输入内容和转换类型
const convertInput = (input: string, before: string): string => {
  switch (before) {
    case CodeType.Base64Encode:
      return base64Encode(input);
    case CodeType.Base64Decode:
      return base64Decode(input);
    case CodeType.UrlEncode:
      return urlEncode(input);
    case CodeType.UrlDecode:
      return urlDecode(input);
    default:
      return '';
  }
};

watch(
  () => [stringInput.value, beforeType.value],
  () => {
    stringOutput.value = convertInput(stringInput.value, beforeType.value);
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
