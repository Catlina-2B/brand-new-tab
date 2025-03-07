<template>
  <q-page padding>
    <div>
      <!-- IDL 输入区域 -->
      <q-input v-model="idlContent" type="textarea" filled label="请输入 IDL JSON 内容" />
      <div class="flex-left-center gap-10 q-mt-sm mb-4">
        <q-btn color="primary" label="解析 IDL" @click="parseIdl" :disable="!idlContent" />
        <q-btn color="secondary" label="上传 IDL 文件" @click="uploadIdlFile" />
        <q-btn color="accent" label="使用 Pump Fun IDL" @click="loadPumpFunIdl" />
        <input type="file" ref="fileInput" style="display: none" @change="handleFileUpload" accept=".json" />
      </div>

      <!-- 程序信息 -->
      <!-- <q-card v-if="parsedIdl" class="q-mb-md">
        <q-card-section>
          <div class="text-h6">程序信息</div>
          <div class="q-mt-sm">
            <p><strong>名称:</strong> {{ parsedIdl.name }}</p>
            <p v-if="parsedIdl.version"><strong>版本:</strong> {{ parsedIdl.version }}</p>
            <div class="flex-left-center gap-10 w-full q-mt-sm">
              <span>程序 ID:</span>
              <q-input v-model="programId" outlined dense class="flex-1" placeholder="请输入程序 ID" />
            </div>
          </div>
        </q-card-section>
      </q-card> -->

      <!-- 方法选择 (下拉框) -->
      <q-card v-if="parsedIdl && parsedIdl.instructions" class="q-mb-md">
        <q-card-section>
          <div class="text-h6">选择方法</div>
          <q-select v-model="selectedInstruction" :options="parsedIdl.instructions" option-label="name" label="选择要调用的方法"
            outlined emit-value map-options @update:model-value="onInstructionSelected">
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section>
                  <q-item-label>{{ scope.opt.name }}</q-item-label>
                  <q-item-label caption v-if="scope.opt.docs && scope.opt.docs.length">
                    {{ scope.opt.docs.join(' ') }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </q-card-section>
      </q-card>

      <!-- 参数输入 -->
      <q-card v-if="selectedInstruction" class="q-mb-md">
        <q-card-section>
          <div class="text-h6">{{ selectedInstruction.name }} 参数</div>
          <div v-if="selectedInstruction.docs && selectedInstruction.docs.length" class="q-mb-md text-grey-8">
            {{ selectedInstruction.docs.join(' ') }}
          </div>

          <div v-if="selectedInstruction.accounts && selectedInstruction.accounts.length">
            <p class="text-subtitle1 q-mb-sm">账户</p>
            <div v-for="(account, index) in selectedInstruction.accounts" :key="`account-${index}`" class="q-mb-sm">
              <q-input v-model="accountInputs[account.name]"
                :label="`${account.name}${account.isMut ? ' (可变)' : ''}${account.isSigner ? ' (签名者)' : ''}`" outlined
                dense :hint="account.docs ? account.docs.join(' ') : ''" :error="!!accountErrors[account.name]"
                :error-message="accountErrors[account.name]" @blur="validateAccount(account)" />
            </div>
          </div>

          <div v-if="selectedInstruction.args && selectedInstruction.args.length" class="q-mt-md">
            <p class="text-subtitle1 q-mb-sm">参数</p>
            <div v-for="(arg, index) in selectedInstruction.args" :key="`arg-${index}`" class="q-mb-sm">
              <q-input v-model="argInputs[arg.name]" :label="`${arg.name} (${formatType(arg.type)})`" outlined dense
                :error="!!argErrors[arg.name]" :error-message="argErrors[arg.name]" @blur="validateArg(arg)" />
            </div>
          </div>

          <p class="mt-4" v-if="currentAccount">当前账户: {{ currentAccount }}</p>

          <q-btn color="primary" label="调用方法" class="q-mt-md" @click="callInstruction"
            :disable="!selectedInstruction || !account" />
        </q-card-section>
      </q-card>

      <!-- 结果显示 -->
      <q-card v-if="transactionResult">
        <q-card-section>
          <div class="text-h6">交易结果</div>
          <div class="q-mt-sm">
            <p v-if="transactionResult.success" class="text-positive">
              交易成功!
            </p>
            <p v-else class="text-negative">
              交易失败: {{ transactionResult.error }}
            </p>
            <p v-if="transactionResult.signature">
              <strong>交易签名:</strong>
              <a :href="`https://explorer.solana.com/tx/${transactionResult.signature}?cluster=${network}`"
                target="_blank">
                {{ transactionResult.signature }}
              </a>
            </p>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { useQuasar } from 'quasar';
import * as web3 from '@solana/web3.js';
import * as borsh from '@project-serum/borsh';
import { BN } from 'bn.js';
import bs58 from 'bs58';
import { useSolStore } from 'src/stores/sol-store';
import pumpFunIdl from './pumpfun.idl.json';

defineOptions({
  name: 'idl-component',
});

const $q = useQuasar();
const solStore = useSolStore();

// 状态变量
const idlContent = ref('');
const parsedIdl = ref<any>(null);
const selectedInstruction = ref<any>(null);
const accountInputs = reactive<Record<string, string>>({});
const argInputs = reactive<Record<string, string>>({});
const account = ref<web3.Keypair | null>(null);
const currentAccount = ref('');
const programId = ref('');
const network = ref('devnet');
const fileInput = ref<HTMLInputElement | null>(null);
const transactionResult = ref<{
  success: boolean;
  signature?: string;
  error?: string;
} | null>(null);

// 添加错误状态
const argErrors = reactive<Record<string, string>>({});
const accountErrors = reactive<Record<string, string>>({});

// 计算属性
const connection = computed(() => {
  return new web3.Connection(solStore.rpcUrl || web3.clusterApiUrl(solStore.isDevNetwork ? 'devnet' : 'mainnet-beta'));
});

// 监听账户变化
watch(() => solStore.currentAccount, (newVal) => {
  account.value = newVal;
  if (newVal) {
    currentAccount.value = newVal.publicKey.toBase58();
  } else {
    currentAccount.value = '';
  }
}, {
  immediate: true,
});

// 监听网络变化
watch(() => solStore.isDevNetwork, (newVal) => {
  network.value = newVal ? 'devnet' : 'mainnet-beta';
}, { immediate: true });

// 监听账户输入变化，自动计算 PDA
watch(() => Object.values(accountInputs), () => {
  if (selectedInstruction.value && selectedInstruction.value.accounts) {
    calculatePDAs();
  }
}, { deep: true });

// 监听参数输入变化，自动计算 PDA
watch(() => Object.values(argInputs), () => {
  if (selectedInstruction.value && selectedInstruction.value.accounts) {
    calculatePDAs();
  }
}, { deep: true });

// 计算 PDA 账户地址
const calculatePDAs = () => {
  if (!selectedInstruction.value || !programId.value) return;

  try {
    const programPubkey = new web3.PublicKey(programId.value);

    // 遍历所有账户
    for (const account of selectedInstruction.value.accounts) {
      // 如果账户有 PDA 定义
      if (account.pda && account.pda.seeds) {
        const seeds = [];
        let canCalculate = true;

        // 处理每个种子
        for (const seed of account.pda.seeds) {
          if (seed.kind === 'const') {
            // 常量种子
            if (Array.isArray(seed.value)) {
              seeds.push(Buffer.from(seed.value));
            } else {
              seeds.push(Buffer.from(seed.value));
            }
          } else if (seed.kind === 'account') {
            // 账户种子，需要从其他账户输入中获取
            const accountPath = seed.path;
            if (accountInputs[accountPath] && accountInputs[accountPath].trim() !== '') {
              try {
                const pubkey = new web3.PublicKey(accountInputs[accountPath]);
                seeds.push(pubkey.toBuffer());
              } catch (e) {
                console.error(`无效的账户地址: ${accountPath}`, e);
                canCalculate = false;
                break;
              }
            } else {
              canCalculate = false;
              break;
            }
          } else if (seed.kind === 'arg') {
            // 参数种子，需要从参数输入中获取
            const argName = seed.path;
            if (argInputs[argName] && argInputs[argName].trim() !== '') {
              seeds.push(Buffer.from(argInputs[argName]));
            } else {
              canCalculate = false;
              break;
            }
          }
        }

        // 如果所有种子都已准备好，计算 PDA
        if (canCalculate) {
          try {
            const [pda] = web3.PublicKey.findProgramAddressSync(seeds, programPubkey);
            accountInputs[account.name] = pda.toBase58();
          } catch (e) {
            console.error(`计算 PDA 失败: ${account.name}`, e);
          }
        }
      }
    }
  } catch (e) {
    console.error('计算 PDA 时出错:', e);
  }
};

// 方法
const parseIdl = () => {
  try {
    parsedIdl.value = JSON.parse(idlContent.value);
    selectedInstruction.value = null;
    resetInputs();

    // 如果 IDL 中包含 address 字段，自动设置程序 ID
    if (parsedIdl.value.address) {
      programId.value = parsedIdl.value.address;
    }

    $q.notify({
      type: 'positive',
      message: 'IDL 解析成功'
    });
  } catch (error) {
    console.error('解析 IDL 失败:', error);
    $q.notify({
      type: 'negative',
      message: '解析 IDL 失败，请检查 JSON 格式是否正确'
    });
  }
};

const loadPumpFunIdl = () => {
  idlContent.value = JSON.stringify(pumpFunIdl, null, 2);
  parseIdl();
  programId.value = pumpFunIdl.address || '';
  $q.notify({
    type: 'positive',
    message: '已加载 Pump Fun IDL'
  });
};

const uploadIdlFile = () => {
  if (fileInput.value) {
    fileInput.value.click();
  }
};

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;

  const file = target.files[0];
  const reader = new FileReader();

  reader.onload = (e) => {
    if (e.target && typeof e.target.result === 'string') {
      idlContent.value = e.target.result;
      parseIdl();
    }
  };

  reader.readAsText(file);
};

const selectInstruction = (instruction: any) => {
  selectedInstruction.value = instruction;
  resetInputs();

  // 预填充一些常见的系统账户
  if (instruction.accounts) {
    for (const acc of instruction.accounts) {
      if (acc.name === 'system_program') {
        accountInputs[acc.name] = '11111111111111111111111111111111';
      } else if (acc.name === 'token_program') {
        accountInputs[acc.name] = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
      } else if (acc.name === 'associated_token_program') {
        accountInputs[acc.name] = 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL';
      } else if (acc.name === 'rent') {
        accountInputs[acc.name] = 'SysvarRent111111111111111111111111111111111';
      } else if (acc.name === 'user' && acc.isSigner) {
        // 如果有用户签名者账户，使用当前连接的钱包
        if (account.value) {
          accountInputs[acc.name] = account.value.publicKey.toBase58();
        }
      } else if (acc.address) {
        // 如果账户有固定地址
        accountInputs[acc.name] = acc.address;
      }
    }
  }
};

// 添加新方法处理下拉选择
const onInstructionSelected = (instruction: any) => {
  if (instruction) {
    selectInstruction(instruction);
  }
};

const resetInputs = () => {
  Object.keys(accountInputs).forEach(key => delete accountInputs[key]);
  Object.keys(argInputs).forEach(key => delete argInputs[key]);
  Object.keys(argErrors).forEach(key => delete argErrors[key]);
  Object.keys(accountErrors).forEach(key => delete accountErrors[key]);
  transactionResult.value = null;
};

const formatType = (type: any): string => {
  if (typeof type === 'string') {
    return type;
  } else if (type.defined) {
    return type.defined;
  } else if (type.array) {
    return `${formatType(type.array[0])}[]`;
  } else if (type.option) {
    return `Option<${formatType(type.option)}>`;
  } else {
    return JSON.stringify(type);
  }
};

const validateAccount = (account: any) => {
  const value = accountInputs[account.name];
  if (!value) {
    if (account.isSigner) {
      accountErrors[account.name] = '签名者账户不能为空';
    }
    return;
  }

  try {
    new web3.PublicKey(value);
    accountErrors[account.name] = ''; // 清除错误
  } catch (error) {
    accountErrors[account.name] = '无效的 Solana 地址格式';
  }
};

const validateArg = (arg: any) => {
  const value = argInputs[arg.name];
  const type = arg.type;

  // 如果值为空，不进行验证
  if (value === undefined || value === '') {
    argErrors[arg.name] = '';
    return;
  }

  try {
    if (typeof type === 'string') {
      switch (type) {
        case 'u8':
        case 'u16':
        case 'u32':
        case 'u64':
          const num = Number(value);
          if (isNaN(num)) {
            argErrors[arg.name] = '请输入有效的数字';
          } else if (num < 0) {
            argErrors[arg.name] = '无符号整数不能为负数';
          } else if (type === 'u8' && num > 255) {
            argErrors[arg.name] = 'u8 类型的值不能超过 255';
          } else if (type === 'u16' && num > 65535) {
            argErrors[arg.name] = 'u16 类型的值不能超过 65535';
          } else if (type === 'u32' && num > 4294967295) {
            argErrors[arg.name] = 'u32 类型的值不能超过 4294967295';
          } else {
            argErrors[arg.name] = '';
          }
          break;
        case 'i8':
        case 'i16':
        case 'i32':
        case 'i64':
          const intNum = Number(value);
          if (isNaN(intNum)) {
            argErrors[arg.name] = '请输入有效的数字';
          } else if (type === 'i8' && (intNum < -128 || intNum > 127)) {
            argErrors[arg.name] = 'i8 类型的值范围为 -128 到 127';
          } else if (type === 'i16' && (intNum < -32768 || intNum > 32767)) {
            argErrors[arg.name] = 'i16 类型的值范围为 -32768 到 32767';
          } else if (type === 'i32' && (intNum < -2147483648 || intNum > 2147483647)) {
            argErrors[arg.name] = 'i32 类型的值范围为 -2147483648 到 2147483647';
          } else {
            argErrors[arg.name] = '';
          }
          break;
        case 'bool':
          if (value.toLowerCase() !== 'true' && value.toLowerCase() !== 'false') {
            argErrors[arg.name] = '布尔值只能是 true 或 false';
          } else {
            argErrors[arg.name] = '';
          }
          break;
        case 'publicKey':
          try {
            new web3.PublicKey(value);
            argErrors[arg.name] = '';
          } catch (error) {
            argErrors[arg.name] = '无效的 Solana 地址格式';
          }
          break;
        default:
          argErrors[arg.name] = '';
      }
    } else if (type.array) {
      // 数组类型验证
      try {
        const arrayValues = JSON.parse(value);
        if (!Array.isArray(arrayValues)) {
          argErrors[arg.name] = '请输入有效的 JSON 数组';
        } else {
          argErrors[arg.name] = '';
        }
      } catch (error) {
        argErrors[arg.name] = '请输入有效的 JSON 数组';
      }
    } else {
      // 其他复杂类型暂不验证
      argErrors[arg.name] = '';
    }
  } catch (error) {
    argErrors[arg.name] = `验证失败: ${error instanceof Error ? error.message : String(error)}`;
  }
};

const callInstruction = async () => {
  if (!selectedInstruction.value || !parsedIdl.value || !programId.value || !account.value) {
    $q.notify({
      type: 'warning',
      message: '缺少必要信息，无法调用合约'
    });
    return;
  }

  // 验证程序 ID
  try {
    new web3.PublicKey(programId.value);
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: '无效的程序 ID 格式'
    });
    return;
  }

  // 验证所有账户
  let hasAccountErrors = false;
  if (selectedInstruction.value.accounts) {
    for (const account of selectedInstruction.value.accounts) {
      validateAccount(account);
      if (accountErrors[account.name]) {
        hasAccountErrors = true;
      }
    }
  }

  // 验证所有参数
  let hasArgErrors = false;
  if (selectedInstruction.value.args) {
    for (const arg of selectedInstruction.value.args) {
      validateArg(arg);
      if (argErrors[arg.name]) {
        hasArgErrors = true;
      }
    }
  }

  // 如果有错误，不继续执行
  if (hasAccountErrors || hasArgErrors) {
    $q.notify({
      type: 'negative',
      message: '请修正输入错误后再试'
    });
    return;
  }

  try {
    // 使用 store 中的钱包
    const keypair = account.value;

    // 创建程序 ID
    const program = new web3.PublicKey(programId.value);

    // 准备账户
    const accounts = [];
    if (selectedInstruction.value.accounts) {
      for (const acc of selectedInstruction.value.accounts) {
        try {
          accounts.push({
            pubkey: new web3.PublicKey(accountInputs[acc.name]),
            isSigner: acc.isSigner,
            isWritable: acc.isMut
          });
        } catch (e) {
          throw new Error(`无效的账户地址: ${acc.name}`);
        }
      }
    }

    // 准备参数
    const dataLayout = borsh.struct(
      selectedInstruction.value.args.map((arg: any) => {
        // 这里需要根据 IDL 中的类型定义构建 borsh 布局
        const type = arg.type;
        if (typeof type === 'string') {
          switch (type) {
            case 'u8':
              return borsh.u8(arg.name);
            case 'u16':
              return borsh.u16(arg.name);
            case 'u32':
              return borsh.u32(arg.name);
            case 'u64':
              return borsh.u64(arg.name);
            case 'i8':
              return borsh.i8(arg.name);
            case 'i16':
              return borsh.i16(arg.name);
            case 'i32':
              return borsh.i32(arg.name);
            case 'i64':
              return borsh.i64(arg.name);
            case 'bool':
              return borsh.bool(arg.name);
            case 'string':
              return borsh.str(arg.name);
            case 'publicKey':
              return borsh.publicKey(arg.name);
            default:
              throw new Error(`不支持的类型: ${type}`);
          }
        } else {
          // 复杂类型处理
          throw new Error(`暂不支持复杂类型: ${JSON.stringify(type)}`);
        }
      })
    );

    // 准备数据
    const data = Buffer.alloc(1000); // 预分配足够大的缓冲区
    const values: any = {};

    for (const arg of selectedInstruction.value.args) {
      const value = argInputs[arg.name];
      const type = arg.type;

      if (typeof type === 'string') {
        switch (type) {
          case 'u8':
          case 'u16':
          case 'u32':
            values[arg.name] = parseInt(value);
            break;
          case 'u64':
          case 'i64':
            values[arg.name] = new BN(value);
            break;
          case 'i8':
          case 'i16':
          case 'i32':
            values[arg.name] = parseInt(value);
            break;
          case 'bool':
            values[arg.name] = value.toLowerCase() === 'true';
            break;
          case 'string':
            values[arg.name] = value;
            break;
          case 'publicKey':
            values[arg.name] = new web3.PublicKey(value);
            break;
          default:
            throw new Error(`不支持的类型: ${type}`);
        }
      } else {
        // 复杂类型处理
        throw new Error(`暂不支持复杂类型: ${JSON.stringify(type)}`);
      }
    }

    const length = dataLayout.encode(values, data);
    const instructionData = data.slice(0, length);

    // 创建指令
    const instruction = new web3.TransactionInstruction({
      keys: accounts,
      programId: program,
      data: instructionData,
    });

    // 创建交易
    const transaction = new web3.Transaction().add(instruction);
    transaction.feePayer = keypair.publicKey;

    // 获取最新的区块哈希
    const { blockhash } = await connection.value.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;

    // 使用版本化交易（与 BatchTransfer 保持一致）
    const messageV0 = new web3.TransactionMessage({
      payerKey: keypair.publicKey,
      recentBlockhash: blockhash,
      instructions: [instruction],
    }).compileToV0Message();

    const versionedTx = new web3.VersionedTransaction(messageV0);
    versionedTx.sign([keypair]);

    // 发送交易
    const signature = await connection.value.sendTransaction(versionedTx);

    // 显示结果
    transactionResult.value = {
      success: true,
      signature
    };

    $q.notify({
      type: 'positive',
      message: '交易成功发送!'
    });
  } catch (error) {
    console.error('调用合约失败:', error);
    transactionResult.value = {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };

    $q.notify({
      type: 'negative',
      message: `调用合约失败: ${error instanceof Error ? error.message : String(error)}`
    });
  }
};
</script>
