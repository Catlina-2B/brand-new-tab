<template>
  <div class="container conver-container">
    <q-splitter v-model="splitterModel" style="height: 450px">
      <template v-slot:before>
        <q-tabs v-model="beforeType" vertical class="text-teal">
          <q-tab
            v-for="(item, index) in hashTypeOptions"
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

import { hashTypeOptions, hashType } from '../const';
import {
  hashMd5,
  hashSha1,
  hashSha256,
  hashSha512,
  hashSha3,
  hashKeccak224,
  hashKeccak256,
  hashKeccak384,
  hashKeccak512,
} from '../hash';

defineOptions({
  name: 'convert-component',
});

const splitterModel = ref(10);
const beforeType = ref(hashTypeOptions[0].value);

const stringInput = ref('');
const stringOutput = ref('');

// 根据输入内容和转换类型，计算输出内容, 例如：convertString('123', 'hex', 'base64') => 'MTIz'
const convertInput = (input: string, before: string): string => {
  switch (before) {
    case hashType.md5:
      return hashMd5(input);
    case hashType.sha1:
      return hashSha1(input);
    case hashType.sha256:
      return hashSha256(input);
    case hashType.sha512:
      return hashSha512(input);
    case hashType.sha3:
      return hashSha3(input);
    case hashType.keccak224:
      return hashKeccak224(input);
    case hashType.keccak256:
      return hashKeccak256(input);
    case hashType.keccak384:
      return hashKeccak384(input);
    case hashType.keccak512:
      return hashKeccak512(input);
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
