<template>
  <div>
    <q-splitter v-model="splitterModel" style="height: 550px">
      <template v-slot:before>
        <q-tabs v-model="kdfType" vertical class="text-teal">
          <q-tab
            v-for="(item, index) in kdfTypeOptions"
            :name="item.value"
            :label="item.label"
            :key="index"
            no-caps
          />
        </q-tabs>
      </template>
      <template v-slot:after>
        <div class="after-container">
          <q-tab-panels v-model="kdfType" animated>
            <q-tab-panel name="encode">
              <p class="label">请输入私钥：</p>
              <div class="flex-left-center private-box">
                <q-input
                  class="private-key-input"
                  v-model="privateKey"
                  outlined
                  dense
                  type="password"
                ></q-input>

                <q-btn
                  color="primary"
                  class="random"
                  no-caps
                  @click="randomPrivateKey"
                  >随机一个</q-btn
                >
              </div>
              <p class="label">请输入密码：</p>
              <q-input
                v-model="password"
                outlined
                dense
                type="password"
              ></q-input>
              <p class="label">加密结果：</p>
              <q-input
                :model-value="kdfResult"
                outlined
                dense
                type="textarea"
              ></q-input>

              <p class="tooltip">
                本功能中，插件不会发出任何网络请求，请放心使用，不信你打开F12😄
              </p>
            </q-tab-panel>
            <q-tab-panel name="decode">
              <p class="label">请输入原数据：</p>
              <q-input
                :model-value="kdfResult"
                outlined
                dense
                type="textarea"
              ></q-input>
              <p class="label">请输入密码：</p>
              <q-input
                v-model="password"
                outlined
                dense
                type="password"
              ></q-input>
              <p class="label">解密结果：</p>
              <q-input
                :model-value="privateKey"
                outlined
                dense
                type="textarea"
              ></q-input>
            </q-tab-panel>
          </q-tab-panels>
        </div>
      </template>
    </q-splitter>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

import * as ethers from 'ethers';

import { debounce } from 'quasar';

defineOptions({
  name: 'Address_Converter',
});

const kdfType = ref('encode');

const privateKey = ref('');
const password = ref('');
const kdfResult = ref('');

const splitterModel = ref(10);

const kdfTypeOptions = ref([
  { label: '加密', value: 'encode' },
  { label: '解密', value: 'decode' },
]);

const randomPrivateKey = () => {
  privateKey.value = ethers.Wallet.createRandom().privateKey;
};

const kdyAction = debounce(async () => {
  if (kdfType.value === 'encode') {
    try {
      const keystoreAccount = await new ethers.Wallet(privateKey.value).encrypt(
        password.value
      );
      kdfResult.value = JSON.stringify(keystoreAccount, null, 2);
    } catch (e) {
      kdfResult.value = '';
    }
  } else {
    try {
      const json = await ethers.decryptKeystoreJson(
        JSON.parse(kdfResult.value),
        password.value
      );
      privateKey.value = json.privateKey;
    } catch (e) {
      privateKey.value = '';
    }
  }
}, 500);

watch(
  () => [privateKey.value, password.value],
  () => {
    if (kdfType.value === 'encode') {
      if (!privateKey.value || !password.value) {
        kdfResult.value = '';
        return;
      }
    } else {
      if (!kdfResult.value || !password.value) {
        privateKey.value = '';
        return;
      }
    }

    kdyAction();
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

.after-container {
  margin-left: 20px;
}
</style>
