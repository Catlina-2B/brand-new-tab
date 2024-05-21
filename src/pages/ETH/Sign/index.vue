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
    <p class="tooltip">地址：{{ address }}</p>
    <p class="label">请输入需要签名的信息：</p>
    <q-input v-model="message" outlined dense type="textarea"></q-input>
    <p class="label">签名结果：</p>
    <q-input :model-value="signResult" outlined dense type="textarea"></q-input>

    <p class="tooltip">
      本功能中，插件不会发出任何网络请求，请放心使用，不信你打开F12😄
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

import * as ethers from 'ethers';

defineOptions({
  name: 'Sign_Message',
});

const privateKey = ref('');
const message = ref('');
const signResult = ref('');
const address = ref('');

const privateKeyReg = /^[0-9a-fA-F]{64}$/;

const signMessage = async () => {
  const wallet = new ethers.Wallet(privateKey.value);
  signResult.value = await wallet.signMessage(message.value);
};

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

watch(
  () => [privateKey.value, message.value],
  () => {
    if (!privateKey.value || !message.value) {
      signResult.value = '';
      return;
    }

    if (
      privateKey.value.replace('0x', '').length !== 64 ||
      !privateKeyReg.test(privateKey.value.replace('0x', ''))
    ) {
      signResult.value = '私钥长度不正确';
      return;
    }

    signMessage();
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
