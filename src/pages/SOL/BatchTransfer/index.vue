<template>
  <div class="flex flex-row justify-between items-start gap-2">
    <q-form @submit="batchTransfer" class="flex flex-col gap-2 flex-1">
      <q-input v-model="amount" placeholder="请输入数量" outlined dense />
      <q-input type="textarea" v-model="addresses" placeholder="请输入地址，多个地址请用换行符分隔" outlined dense />
      <p>共{{ addresses.split('\n').filter(Boolean).length }}个地址</p>
      <q-btn type="submit" color="primary" no-caps :loading="loading">Batch Transfer</q-btn>
    </q-form>
    <div class="flex flex-col gap-2 w-1/2">
      <p class="h-[40px] font-bold">Result Log</p>
      <q-input type="textarea" v-model="result" outlined dense />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import {
  Connection,
  SystemProgram,
  Keypair,
  PublicKey,
  LAMPORTS_PER_SOL,
  Transaction,
  VersionedTransaction,
  TransactionMessage,
} from '@solana/web3.js';
import { useSolStore } from 'src/stores/sol-store';

defineOptions({
  name: 'BatchTransfer',
});

const solStore = useSolStore();

const loading = ref(false);

const addresses = ref('');
const amount = ref('');
const result = ref('');

const batchTransfer = async () => {
  loading.value = true;
  try {
    console.log(addresses.value, amount.value);
    const connection = new Connection(solStore.rpcUrl, 'confirmed');
    const payer = solStore.currentAccount as Keypair;

    let txs: Transaction[] = [];
    let addrs: string[][] = [];
    const allAddrs = addresses.value.split('\n');
    const numsPerTx = 12;
    for (let i = 0; i < allAddrs.length; i += numsPerTx) {
      const tx = new Transaction();
      for (let j = 0; j < numsPerTx; j++) {
        if (!allAddrs[i + j]) continue;
        console.log(i + j, allAddrs[i + j]);
        tx.add(
          SystemProgram.transfer({
            fromPubkey: payer.publicKey,
            toPubkey: new PublicKey(allAddrs[i + j]),
            lamports: (Number(amount.value) + 0.002) * LAMPORTS_PER_SOL,
          })
        );
        if (addrs[i / numsPerTx]) {
          addrs[i / numsPerTx].push(allAddrs[i + j]);
        } else {
          addrs[i / numsPerTx] = [allAddrs[i + j]];
        }
      }
      txs.push(tx);
    }

    for (let i = 0; i < txs.length; i++) {
      const tx = txs[i];
      tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
      // 版本化交易
      const messageV0 = new TransactionMessage({
        payerKey: payer.publicKey,
        recentBlockhash: tx.recentBlockhash,
        instructions: tx.instructions,
      }).compileToV0Message();
      const versionedTx = new VersionedTransaction(messageV0);
      versionedTx.sign([payer]);
      const txHash = await connection.sendTransaction(versionedTx);
      result.value += `第${i + 1}批: ${txHash}\n\n`;
    }
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

watch(addresses, (newVal) => {
  if (!newVal) return;

  // 使用正则表达式直接匹配所有符合 Solana 地址格式的字符串
  const matches = newVal.match(/[1-9A-HJ-NP-Za-km-z]{32,44}/g) || [];

  // 更新为匹配到的有效地址，用换行符连接
  addresses.value = matches.join('\n');
});
</script>
