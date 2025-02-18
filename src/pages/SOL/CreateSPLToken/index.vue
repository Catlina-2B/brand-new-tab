<template>
  <div>
    <q-form class="mt-4 flex flex-col gap-4 w-full" @submit="createToken">
      <q-file accept="image/*" outlined dense v-model="formData.logoFile" label="Logo" />
      <q-input v-model="formData.name" label="Token Name" outlined dense />
      <q-input v-model="formData.description" label="Token Description" outlined dense />
      <q-input v-model="formData.symbol" label="Token Symbol" outlined dense />
      <q-input v-model="formData.decimals" label="Token Decimals" outlined dense />
      <q-input v-model="formData.mintAmount" label="Token mint amount" outlined dense />
      <q-btn type="submit" color="primary" :loading="loading">创建Token</q-btn>
    </q-form>
    <div class="steps mt-4">
      <div class="flex gap-4 items-center" v-if="currentStep >= 1">
        <q-spinner color="primary" size="1em" v-if="currentStep === 1" />
        <span>1. 上传信息至IPFS</span>
      </div>
      <div class="flex gap-4 items-center" v-if="currentStep >= 2">
        <q-spinner color="primary" size="1em" v-if="currentStep === 2" />
        <span>2. 创建SPL Token</span>
      </div>
      <div class="flex gap-4 items-center" v-if="currentStep >= 3">
        <q-spinner color="primary" size="1em" v-if="currentStep === 3" />
        <span>3. 创建ATA账户并铸造</span>
      </div>
      <div class="flex gap-4 items-center" v-if="currentStep >= 4">
        <q-spinner color="primary" size="1em" v-if="currentStep === 4" />
        <span>4. 创建MetaData PDA</span>
      </div>
      <div class="flex gap-4 items-center" v-if="currentStep >= 5 && !success">
        <q-spinner color="primary" size="1em" v-if="currentStep === 5" />
        <span>5. 创建Token Metadata</span>
      </div>
    </div>
    <div class="mt-4 flex flex-col gap-4" v-if="success || result">
      <span>创建结果：</span>
      <q-input type="textarea" v-model="result" outlined />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useSolStore } from 'src/stores/sol-store';
import { Keypair, Connection, PublicKey } from '@solana/web3.js';
import { createMint, createAssociatedTokenAccount, mintTo } from '@solana/spl-token';
import { createSignerFromKeypair, signerIdentity } from '@metaplex-foundation/umi'
import { Keypair as UmiKeypair, publicKey } from '@metaplex-foundation/umi'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { mplTokenMetadata, createMetadataAccountV3, DataV2Args, CreateMetadataAccountV3InstructionArgs, CreateMetadataAccountV3InstructionAccounts } from '@metaplex-foundation/mpl-token-metadata';
import { uploadFile, uploadJson } from 'src/utils/utils';

defineOptions({
  name: 'create-spl-token',
});

const solStore = useSolStore();
const account = ref<UmiKeypair | Keypair | null>(null);

const localKey = 'tokenInfo';

const formData = ref<{
  name: string;
  description: string;
  symbol: string;
  decimals: number;
  mintAmount: number;
  logoFile: File | null;
}>({
  name: '',
  description: '',
  symbol: '',
  decimals: 6,
  mintAmount: 10000,
  logoFile: null,
});
const currentStep = ref(0);
const success = ref(false);
const loading = ref(false);
const result = ref(localStorage.getItem(localKey) || '');

const METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

const createToken = async () => {
  if (!account.value) {
    return;
  }

  loading.value = true;

  currentStep.value = 1;
  const mint = Keypair.generate();
  console.log('mint', mint.publicKey.toBase58());

  const connection = new Connection(solStore.rpcUrl, 'finalized');

  const umi = createUmi(solStore.rpcUrl).use(mplTokenMetadata());
  const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(account.value.secretKey));
  const signer = createSignerFromKeypair(umi, keypair);
  umi.use(signerIdentity(signer));

  const imageUri = await uploadFile(formData.value.logoFile as File);
  const metadataSource = {
    name: formData.value.name,
    symbol: formData.value.symbol,
    image: imageUri,
    description: formData.value.description,
  }
  const metadataUri = await uploadJson(metadataSource);
  console.log('metadataUri', metadataUri);

  const metadata = {
    name: formData.value.name,
    symbol: formData.value.symbol,
    uri: metadataUri as string,
    sellerFeeBasisPoints: 0,
    creators: null,
    collection: null,
    uses: null,
  }

  currentStep.value = 2;
  const res = await createMint(
    connection,
    account.value as Keypair,
    (account.value as Keypair).publicKey,
    null,
    formData.value.decimals,
    mint,
    {
      commitment: 'finalized',
    }
  );
  console.log(res);

  currentStep.value = 3;
  const tokenAccount = await createAssociatedTokenAccount(
    connection,
    account.value as Keypair,
    mint.publicKey,
    (account.value as Keypair).publicKey,
    {
      commitment: 'finalized',
    }
  );
  console.log(tokenAccount);

  const mintToTx = await mintTo(
    connection,
    account.value as Keypair,
    mint.publicKey,
    tokenAccount,
    (account.value as Keypair).publicKey,
    formData.value.mintAmount * 10 ** formData.value.decimals,
    [account.value as Keypair, mint],
    {
      commitment: 'finalized',
    }
  );
  console.log(mintToTx);

  currentStep.value = 4;
  const metadataPDA = (
    await PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        METADATA_PROGRAM_ID.toBuffer(),
        mint.publicKey.toBuffer(),
      ],
      METADATA_PROGRAM_ID
    )
  )[0];
  console.log('metadataPDA', metadataPDA.toBase58());

  currentStep.value = 5;
  const accounts: CreateMetadataAccountV3InstructionAccounts = {
    metadata: publicKey(metadataPDA),
    mint: publicKey(mint.publicKey),
    mintAuthority: signer,
    payer: signer,
    updateAuthority: signer,
  };

  const data: DataV2Args = {
    name: formData.value.name,
    symbol: formData.value.symbol,
    uri: metadataUri as string,
    sellerFeeBasisPoints: 0,
    creators: null,
    uses: null,
    collection: null,
  };

  const args: CreateMetadataAccountV3InstructionArgs = {
    data: data,
    isMutable: false,
    collectionDetails: null,
  };
  console.log({
    ...accounts,
    ...args
  })
  // 创建 Metadata 账户指令
  const tx = createMetadataAccountV3(
    umi,
    {
      ...accounts,
      ...args
    }
  )
  const signers = tx.getSigners(umi);
  console.log('signers', signers.map(s => s.publicKey.toString()));
  let transaction = await tx.buildAndSign(umi);
  const txHash = await umi.rpc.sendTransaction(transaction);
  console.log(`Metadata Transaction Signature: ${txHash}`);

  result.value = JSON.stringify({
    mintAddress: mint.publicKey.toBase58(),
    ATAAddress: tokenAccount.toBase58(),
    txHash: txHash,
    metadata: metadata,
  }, null, 2);
  localStorage.setItem(localKey, result.value);
  success.value = true;
  loading.value = false;
};

watch(() => solStore.currentAccount, (newVal) => {
  account.value = newVal;
}, {
  immediate: true,
});
</script>
