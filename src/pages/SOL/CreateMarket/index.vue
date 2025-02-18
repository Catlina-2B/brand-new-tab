<template>
  <q-form class="flex flex-col gap-4" @submit="createMarket">
    <div class="flex items-center gap-2">
      <q-input class="flex-1" v-model="tokenA" label="Token A Address" outlined dense />
      <q-btn @click="setTokenAToSOL">SOL</q-btn>
    </div>
    <q-input v-model="tokenADecimals" label="Token A decimals" outlined dense />
    <q-input v-model="tokenAAmount" label="Token A Amount" outlined dense />
    <q-input class="flex-1" v-model="tokenB" label="Token B Address" outlined dense />
    <q-input v-model="tokenBDecimals" label="Token B decimals" outlined dense />
    <q-input v-model="tokenBAmount" label="Token B Amount" outlined dense />
    <q-btn type="submit" label="Create Market" color="primary" no-caps :loading="loading" />
  </q-form>
  <p class="mt-2 mb-2">Result:</p>
  <q-input v-model="result" type="textarea" outlined dense />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Keypair, Connection, PublicKey } from '@solana/web3.js';
import { useSolStore } from 'src/stores/sol-store';
import { initSdk, txVersion } from 'src/utils/utils';
import {
  OPEN_BOOK_PROGRAM,
  DEVNET_PROGRAM_ID,
  WSOLMint,
  AMM_V4
} from '@raydium-io/raydium-sdk-v2';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'
import BN from 'bn.js';

const solStore = useSolStore();

defineOptions({
  name: 'create-market',
});

const localKey = 'marketInfo';

const tokenA = ref('');
const tokenB = ref('');
const tokenADecimals = ref(0);
const tokenBDecimals = ref(0);
const tokenAAmount = ref(0);
const tokenBAmount = ref(0);

const result = ref(localStorage.getItem(localKey) || '');

const loading = ref(false);

const setTokenAToSOL = () => {
  tokenA.value = WSOLMint.toBase58();
  tokenADecimals.value = 9;
};

const createMarket = async () => {
  try {
    loading.value = true;
    console.log(tokenA.value, tokenB.value);
    if (!solStore.currentAccount) return;
    const raydium = await initSdk({
      owner: solStore.currentAccount as Keypair,
      connection: new Connection(solStore.rpcUrl),
      cluster: solStore.isDevNetwork ? 'devnet' : 'mainnet',
    });

    const { execute, extInfo, transactions } = await raydium.marketV2.create({
      baseInfo: {
        mint: new PublicKey(tokenA.value),
        decimals: tokenADecimals.value,
      },
      quoteInfo: {
        mint: new PublicKey(tokenB.value),
        decimals: tokenBDecimals.value,
      },
      lotSize: 1,
      tickSize: 0.01,
      dexProgramId: solStore.isDevNetwork
        ? DEVNET_PROGRAM_ID.OPENBOOK_MARKET
        : OPEN_BOOK_PROGRAM,

      requestQueueSpace: 5120 + 12, // optional
      eventQueueSpace: 262144 + 12, // optional
      orderbookQueueSpace: 65536 + 12, // optional

      txVersion,
      computeBudgetConfig: {
        units: 60000,
        microLamports: 100000000,
      },
    });
    const marketInfo = Object.keys(extInfo.address).reduce(
      (acc, cur) => ({
        ...acc,
        [cur]:
          extInfo.address[cur as keyof typeof extInfo.address].toBase58(),
      }),
      {}
    )
    console.log(
      `create market total ${transactions.length} txs, market info: `,
      marketInfo
    );

    console.log(extInfo.address);

    const txIds = await execute({
      // true means tx will be sent when the previous one has been confirmed
      sequentially: true,
    });

    console.log('create market txIds:', txIds);
    result.value = JSON.stringify(marketInfo, null, 2);
    localStorage.setItem(localKey, JSON.stringify(marketInfo, null, 2));

    await createAmmPool(raydium, new PublicKey((marketInfo as any).marketId));
  } catch (error) {
    console.log(error);
  } finally {
    loading.value = false;
  }
};

const createAmmPool = async (raydium: any, marketId: PublicKey) => {
  const baseMint = new PublicKey(tokenA.value)
  const quoteMint = new PublicKey(tokenB.value)

  const baseMintInfo = await raydium.token.getTokenInfo(baseMint)
  const quoteMintInfo = await raydium.token.getTokenInfo(quoteMint)

  if (
    baseMintInfo.programId !== TOKEN_PROGRAM_ID.toBase58() ||
    quoteMintInfo.programId !== TOKEN_PROGRAM_ID.toBase58()
  ) {
    throw new Error(
      'amm pools with openbook market only support TOKEN_PROGRAM_ID mints, if you want to create pool with token-2022, please create cpmm pool instead'
    )
  }

  const { execute, extInfo } = await raydium.liquidity.createPoolV4({
    //programId: AMM_V4,
    programId: solStore.isDevNetwork ? DEVNET_PROGRAM_ID.AmmV4 : AMM_V4, // devnet
    marketInfo: {
      marketId,
      //programId: OPEN_BOOK_PROGRAM,
      programId: solStore.isDevNetwork ? DEVNET_PROGRAM_ID.OPENBOOK_MARKET : OPEN_BOOK_PROGRAM, // devent
    },
    baseMintInfo: {
      mint: baseMint,
      decimals: baseMintInfo.decimals,
    },
    quoteMintInfo: {
      mint: quoteMint,
      decimals: quoteMintInfo.decimals,
    },
    baseAmount: new BN(tokenAAmount.value * 10 ** tokenADecimals.value),
    quoteAmount: new BN(tokenBAmount.value * 10 ** tokenBDecimals.value),

    startTime: new BN(0), // unit in seconds
    ownerInfo: {
      useSOLBalance: true,
    },
    associatedOnly: false,
    txVersion,
    //feeDestinationId: FEE_DESTINATION_ID,
    feeDestinationId: DEVNET_PROGRAM_ID.FEE_DESTINATION_ID, // devnet
    computeBudgetConfig: {
      units: 600000,
      microLamports: 10000000,
    },
  })
  const poolInfo = Object.keys(extInfo.address).reduce(
    (acc, cur) => ({
      ...acc,
      [cur]: extInfo.address[cur as keyof typeof extInfo.address].toBase58(),
    }),
    {}
  )
  try {
    const { txId } = await execute({ sendAndConfirm: true })
    console.log(
      'amm pool created! txId: ',
      txId,
      ', poolKeys:',
      poolInfo
    )
    result.value = JSON.stringify(poolInfo, null, 2);
    localStorage.setItem(localKey, JSON.stringify(poolInfo, null, 2));
  } catch (error) {
    console.log('here', error);
  }
}
</script>
