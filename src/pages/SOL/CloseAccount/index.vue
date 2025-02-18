<template>
  <div>
    <div class="flex-left-center gap-10 w-full">
      <span>请输入私钥：</span>
      <q-input v-model="secrectKey" outlined dense class="flex-1"></q-input>
      <q-btn @click="close" color="primary" :loading="loading">关闭系统账户</q-btn>
    </div>
    <div class="flex-left-center gap-10 w-full mt-4">
      <q-input v-model="tokenAccount" placeholder="请输入代币账户地址" outlined dense class="flex-1"></q-input>
      <q-btn @click="closeTokenAccountFunc" color="primary" :loading="tokenAccountLoading">关闭代币账户</q-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import {
  closeAccount as closeTokenAccount,
  transferChecked,
  getAssociatedTokenAddress,
  getOrCreateAssociatedTokenAccount
} from '@solana/spl-token';
import { useSolStore } from 'src/stores/sol-store';
import bs58 from 'bs58';

defineOptions({
  name: 'close-account-component',
});

const solStore = useSolStore();

const secrectKey = ref('');

const tokenAccount = ref('');

const loading = ref(false);

const tokenAccountLoading = ref(false);

const closeAccount = async (accountToClose: Keypair, payer: Keypair) => {
  const connection = new Connection(solStore.rpcUrl);
  const closeAccountTransaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: accountToClose.publicKey,
      toPubkey: payer.publicKey,
      lamports: await connection.getBalance(accountToClose.publicKey),
    })
  );
  await sendAndConfirmTransaction(connection, closeAccountTransaction, [
    payer,
    accountToClose,
  ]);
  const closeInstruction = new Transaction().add(
    new TransactionInstruction({
      keys: [
        {
          pubkey: accountToClose.publicKey,
          isSigner: false,
          isWritable: true,
        },
        {
          pubkey: payer.publicKey,
          isSigner: false,
          isWritable: true,
        },
      ],
      programId: SystemProgram.programId,
    })
  );
  await sendAndConfirmTransaction(connection, closeInstruction, [payer]);
};

const close = async () => {
  const accountToClose = Keypair.fromSecretKey(bs58.decode(secrectKey.value));
  const payer = solStore.currentAccount as Keypair;
  loading.value = true;
  try {
    await closeAccount(accountToClose, payer);
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const closeTokenAccountFunc = async () => {
  try {
    const connection = new Connection(solStore.rpcUrl);
    const accountToClose = Keypair.fromSecretKey(bs58.decode(secrectKey.value));
    tokenAccountLoading.value = true;
    const tokenAtaAccount = await getAssociatedTokenAddress(
      new PublicKey(tokenAccount.value),
      accountToClose.publicKey
    );
    const tokenAtaAccountBalance = await connection.getTokenAccountBalance(tokenAtaAccount);
    const tokenDecimals = tokenAtaAccountBalance.value.decimals;
    const destinationAtaAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      accountToClose,
      new PublicKey(tokenAccount.value),
      (solStore.currentAccount as Keypair).publicKey
    );
    if (tokenAtaAccountBalance.value.amount !== '0') {
      await transferChecked(
        connection,
        accountToClose,
        tokenAtaAccount,
        new PublicKey(tokenAccount.value),
        destinationAtaAccount.address,
        accountToClose,
        Number(tokenAtaAccountBalance.value.amount),
        tokenDecimals,
        [accountToClose]
      );
    }
    await closeTokenAccount(
      connection,
      accountToClose,
      new PublicKey(tokenAtaAccount),
      accountToClose.publicKey,
      accountToClose,
      [accountToClose]
    );
  } catch (error) {
    console.error(error);
  } finally {
    tokenAccountLoading.value = false;
  }
};
</script>
