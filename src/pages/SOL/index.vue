<template>
  <div class="index-container">
    <div style="padding: 0 10px; margin-bottom: 20px">
      <div class="mb-4">
        <label>
          <q-toggle v-model="isDevNetwork" />
          dev网络
        </label>
        <q-input placeholder="请输入自定义RPC地址" outlined v-model="rpcUrl" dense></q-input>

      </div>
      <Account />
    </div>
    <q-tabs class="flex-left-center tabs" narrow-indicator>
      <q-route-tab name="create-spl-token" label="Create SPL Token" to="/sol/create-spl-token" no-caps />
      <q-route-tab name="create-market" label="Create Market" to="/sol/create-market" no-caps />
      <q-route-tab name="batch-transfer" label="Batch Transfer" to="/sol/batch-transfer" no-caps />
      <q-route-tab name="close-account" label="Close Account" to="/sol/close-account" no-caps />
    </q-tabs>
    <div style="padding: 30px 10px">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useSolStore } from 'src/stores/sol-store';
import Account from './Account/index.vue';

defineOptions({
  name: 'sol-component',
});

const rpcUrl = ref('');
const isDevNetwork = ref(true);
const solStore = useSolStore();

watch(() => isDevNetwork.value, (newVal) => {
  solStore.setIsDevNetwork(newVal);
});

watch(() => rpcUrl.value, (newVal) => {
  solStore.setRpcUrl(newVal);
});

watch(() => solStore.rpcUrl, (newVal) => {
  rpcUrl.value = newVal;
}, {
  immediate: true,
});
</script>

<style lang="scss" scoped>
.tabs {
  width: fit-content;
}
</style>
