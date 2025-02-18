<template>
  <div>
    <div class="flex-left-center gap-10 w-full">
      <span>请输入私钥：</span>
      <q-input v-model="secrectKey" outlined dense class="flex-1"></q-input>
      <q-btn @click="randomGenerate" color="primary">随机一个</q-btn>
    </div>
    <p class="mt-4">Current Account: {{ currentAccount }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useSolStore } from 'src/stores/sol-store';
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
defineOptions({
  name: 'account-component',
});

const solStore = useSolStore();
const isDevNetwork = ref(false);
const rpcUrl = ref('');

const secrectKey = ref('');
const currentAccount = ref('');

watch(() => solStore.isDevNetwork, (newVal) => {
  isDevNetwork.value = newVal;
}, { immediate: true });

watch(() => solStore.rpcUrl, (newVal) => {
  rpcUrl.value = newVal;
}, { immediate: true });

watch(() => secrectKey.value, (newVal) => {
  if (!newVal) return;
  const bs58Key = bs58.decode(newVal);
  const keypair = Keypair.fromSecretKey(bs58Key);
  currentAccount.value = keypair.publicKey.toBase58();
  solStore.setCurrentAccount(keypair);
}, { immediate: true });

const randomGenerate = () => {
  const keypair = Keypair.generate();
  secrectKey.value = bs58.encode(keypair.secretKey);
};
</script>
