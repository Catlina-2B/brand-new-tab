<template>
  <div>
    <p class="text-h6">上传ABI文件</p>
    <div class="flex-left-center">
      <q-file
        outlined
        style="width: 300px"
        v-model="fileData"
        label="选择JSON文件"
        accept=".json"
      />
      <q-select
        v-if="functionNameOptions.length > 0"
        style="width: 300px; margin-left: 20px"
        label="选择函数"
        outlined
        v-model="functionName"
        :options="functionNameOptions"
      ></q-select>
    </div>
    <div class="args-container">
      <div
        class="flex-left-center"
        v-for="(item, index) in currentFunction.args"
        :key="index"
      >
        <span class="label-name"
          >{{ item.name || 'Argument' }} ({{ item.type }}):</span
        >
        <q-input
          class="type-value"
          v-model="item.value"
          :rules="[
            (val) => {
              return regValue(item, val);
            },
          ]"
        ></q-input>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';

import { ABI_JSON, typesRegs } from '../const';

import * as ethers from 'ethers';

const fileData = ref(null);

const emit = defineEmits(['update:encodedData']);

defineOptions({
  name: 'abi-autofill',
});

interface ARG_ITEM {
  name: string;
  type: string;
  value: string;
}

interface FunctionItem {
  id: number;
  name: string;
  args: ARG_ITEM[];
}

const functionName = ref<{ label: string; value: string }>();

const inputs = ref<FunctionItem[]>([]);

const abiSource = ref([] as ABI_JSON);

const functionNameOptions = ref<
  {
    id: number;
    label: string;
    value: string;
  }[]
>([]);

const currentFunction = ref<FunctionItem>({
  id: 0,
  name: '',
  args: [],
});

const regValue = (item: ARG_ITEM, val: string) => {
  return typesRegs[item.type].test(val) || '请输入正确的数据格式';
};

watch(
  () => fileData.value,
  (newVal) => {
    if (newVal) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result;
        if (data) {
          const jsonData = JSON.parse(data as string) as ABI_JSON;
          console.log(jsonData);
          abiSource.value = jsonData;
          inputs.value = jsonData
            .filter((item) => item.type == 'function' && item.inputs.length > 0)
            .map((item, index: number) => {
              return {
                id: index,
                name: item.name,
                args: item.inputs.map((input, index2: number) => {
                  return {
                    id: index2,
                    name: input.name,
                    type: input.type,
                    value: '',
                  };
                }),
              };
            });
          functionNameOptions.value = inputs.value.map((item) => {
            return {
              id: item.id,
              label: item.name,
              value: item.name,
            };
          });
        }
      };
      reader.readAsText(newVal);
      fileData.value = null;
    }
  }
);

watch(
  () => functionName.value,
  (val) => {
    if (val) {
      const item = inputs.value.find((item) => item.name === val.label);
      if (item) {
        currentFunction.value = Object.assign({}, item);
      }
    }
  }
);

watch(
  () => currentFunction.value,
  (func) => {
    try {
      const addr = '0x0000000000000000000000000000000000000000';
      const contract = new ethers.Contract(addr, abiSource.value);
      const args = func.args.map((item) => {
        return {
          name: item.name,
          type: item.type,
          value:
            item.type.indexOf('[]') >= 0 ? JSON.parse(item.value) : item.value,
        };
      });
      const encodedData = contract.interface.encodeFunctionData(
        func.name,
        args.map((item) => item.value)
      );
      emit('update:encodedData', encodedData);
    } catch (e) {
      console.error(e);
    }
  },
  {
    deep: true,
  }
);
</script>

<style lang="scss" scoped>
.args-container {
  margin: 20px;
}
.label-name {
  margin-right: 10px;
  font-size: 14px;
  font-weight: 500;
}

.type-value {
  width: 500px;
}
</style>
