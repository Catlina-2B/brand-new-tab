<template>
  <div>
    <p class="label">请输入私钥：</p>
    <div class="flex-left-center private-box">
      <q-input
        class="private-key-input"
        v-model="privateKey"
        outlined
        dense
        type="password"
      ></q-input>
      <q-btn color="primary" class="random" no-caps @click="randomPrivateKey"
        >随机一个</q-btn
      >
    </div>
    <p class="label">转换结果：</p>
    <q-input :model-value="address" outlined dense type="textarea"></q-input>

    <p class="tooltip">
      本功能中，插件不会发出任何网络请求，请放心使用，不信你打开F12😄
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

import * as ethers from 'ethers';

defineOptions({
  name: 'Address_Converter',
});

const privateKey = ref('');
const address = ref('');

const randomPrivateKey = () => {
  privateKey.value = ethers.Wallet.createRandom().privateKey;
};

watch(
  () => privateKey.value,
  () => {
    try {
      const wallet = new ethers.Wallet(privateKey.value);
      address.value = wallet.address;
    } catch (e) {
      address.value = '';
    }
  }
);
</script>

<style lang="scss" scoped>
@import '../index.scss';
.tooltip {
  font-size: 14px;
}

.label {
  font-size: 16px;
  margin-top: 20px;
}
</style>
