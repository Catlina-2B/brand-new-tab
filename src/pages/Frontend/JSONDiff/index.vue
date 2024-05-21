<template>
  <div class="container">
    <q-splitter
      v-model="splitterModel"
      style="min-height: 400px"
      separator-class="separator"
    >
      <template v-slot:before>
        <div class="flex-column-left-top data-input">
          <div class="text-h6 q-mb-md">Old：</div>
          <q-input
            class="data-input-ele"
            v-model="oldData"
            type="textarea"
            outlined
            :error="error1"
            error-message="请输入正确的JSON格式"
          />
        </div>
      </template>
      <template v-slot:separator>
        <q-avatar
          color="primary"
          text-color="white"
          size="40px"
          icon="drag_indicator"
        />
      </template>
      <template v-slot:after>
        <div class="flex-column-left-top data-input">
          <div class="text-h6 q-mb-md">New：</div>
          <q-input
            class="data-input-ele"
            v-model="newData"
            type="textarea"
            outlined
            :error="error2"
            error-message="请输入正确的JSON格式"
          />
        </div>
      </template>
    </q-splitter>
    <q-btn color="primary" no-caps @click="diff">对比</q-btn>
    <div class="diff-container">
      <CodeDiff
        :old-string="oldStr"
        :new-string="newStr"
        output-format="side-by-side"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

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

const diff = () => {
  try {
    oldStr.value = JSON.stringify(JSON.parse(oldData.value), null, 2);
    error1.value = false;
  } catch (err) {
    error1.value = true;
  }
  try {
    newStr.value = JSON.stringify(JSON.parse(newData.value), null, 2);
    error2.value = false;
  } catch (err) {
    error2.value = true;
  }
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
