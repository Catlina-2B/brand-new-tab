<template>
  <div>
    <p class="text-h6">请添加ABI字段</p>
    <div class="flex-left-center line-item">
      <div class="arg-type your-function">Your Function Name</div>
      <q-input class="type-value" v-model="functionName"></q-input>
    </div>
    <q-form>
      <div
        class="flex-left-center line-item"
        v-for="item in args"
        :key="item.id"
      >
        <q-select
          class="arg-type"
          outlined
          v-model="item.type"
          :options="functionArgsType"
          placeholder="Select type"
        />
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
    </q-form>
    <q-btn color="primary" no-caps class="add-arg" @click="addArg">
      <q-icon name="add"></q-icon>
      Add argument
    </q-btn>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';

import { typesRegs, functionArgsType, ARG_TYPE } from '../const';

import * as ethers from 'ethers';

defineOptions({
  name: 'abi-autofill',
});

const emit = defineEmits(['update:encodedData']);

const functionName = ref<string>('');

const args = ref<ARG_TYPE[]>([]);

const addArg = () => {
  args.value.push({
    id: args.value.length,
    type: {
      label: '',
      value: '',
    },
    value: '',
  });
};

const regValue = (item: ARG_TYPE, val: string) => {
  return typesRegs[item.type.label].test(val) || '请输入正确的数据格式';
};

watch(
  () => args.value,
  (val) => {
    console.log(val);
    try {
      const data = val.map((item) => {
        if (item.type.label.indexOf('[]') >= 0) {
          return JSON.parse(item.value);
        } else {
          return item.value;
        }
      });
      console.log(data);
      const ifa = [
        {
          name: functionName.value,
          type: 'function',
          inputs: val.map((item) => {
            return {
              name: '',
              type: item.type.value,
            };
          }),
          outputs: [],
          stateMutability: 'nonpayable',
        },
      ];
      const encodedData = new ethers.Interface(ifa).encodeFunctionData(
        functionName.value,
        data
      );
      emit('update:encodedData', encodedData);
    } catch (e) {
      // console.error(e);
    }
  },
  {
    deep: true,
  }
);
</script>

<style lang="scss" scoped>
.add-arg {
  margin-top: 20px;
}

.line-item {
  margin-top: 10px;
  gap: 40px;
}

.arg-type {
  width: 200px;
}

.type-value {
  width: 600px;
}

.your-function {
  font-size: 16px;
  font-weight: 500;
}
</style>
