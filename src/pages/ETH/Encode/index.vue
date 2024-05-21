<template>
  <div class="index-container">
    <q-toggle v-model="toggle" label="手动模式"></q-toggle>
    <div v-if="toggle">
      <Manually @update:encodedData="encodedData = $event" />
    </div>
    <div v-else>
      <AutoFill @update:encodedData="encodedData = $event" />
    </div>
    <q-separator spaced="20px" />
    <p class="text-h6">Encoded data</p>
    <q-input v-model="encodedData" type="textarea" outlined disable />
    <q-btn color="primary" no-caps style="margin-top: 20px" @click="copyData">
      Copy Data
    </q-btn>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import Manually from './Manually.vue';

import AutoFill from './AutoFill.vue';

const toggle = ref(false);

const encodedData = ref('');

defineOptions({
  name: 'abi-encode',
});

const copyData = () => {
  navigator.clipboard.writeText(encodedData.value);
};
</script>

<style lang="scss" scoped></style>
<style lang="scss"></style>
