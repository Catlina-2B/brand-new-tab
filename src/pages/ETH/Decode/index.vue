<template>
  <div class="index-container">
    <div class="">
      <q-splitter
        v-model="splitterModel"
        style="min-height: 400px"
        separator-class="separator"
      >
        <template v-slot:before>
          <div class="flex-column-left-top data-input">
            <div class="text-h6 q-mb-md">请输入JSON格式的ABI：</div>
            <q-input
              class="data-input-ele"
              v-model="abi"
              type="textarea"
              outlined
              placeholder="请输入JSON格式的ABI"
              :error="isErrorJson"
              error-message="请输入正确的JSON格式的ABI"
            />
          </div>
        </template>
        <template v-slot:separator>
          <q-avatar
            color="primary"
            text-color="white"
            size="40px"
            icon="drag_indicator"
          />
        </template>
        <template v-slot:after>
          <div class="flex-column-left-top data-input">
            <div class="text-h6 q-mb-md">请输入原始数据（Input Data）：</div>
            <q-input
              class="data-input-ele"
              v-model="byteData"
              type="textarea"
              outlined
              placeholder="请输入JSON格式的ABI"
              :error="isErrorData"
              error-message="请输入正确的原始数据（16进制）"
            />
          </div>
        </template>
      </q-splitter>
      <q-btn color="primary" no-caps @click="decodeData">解码</q-btn>
      <q-separator spaced="20px" />
      <div>
        <div class="text-h6">解码结果：</div>
        <div class="flex-column-left-top">
          <div
            class="flex-left-top result-item"
            v-for="(item, index) in result"
            :key="index"
          >
            <div class="label">
              {{ item.type }}
              <span v-if="item.desc">({{ item.desc }})</span>
            </div>
            <div v-if="item.desc && item.desc.indexOf('[]') >= 0">
              <p
                class="array-value"
                v-for="(item2, index2) in item.value.split(',')"
                :key="index2"
              >
                {{ item2 }}
              </p>
            </div>
            <div class="value" v-else>{{ item.value }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

import * as ethers from 'ethers';

const abi = ref('');
const byteData = ref('');

const isErrorJson = ref(false);
const isErrorData = ref(false);

const splitterModel = ref(50);

const result = ref<ABI_Result>([]);

defineOptions({
  name: 'abi-encode',
});

const decodeData = () => {
  // try {
  const abiObj = JSON.parse(abi.value);
  let decodeData: {
    type: string;
    desc?: string;
    value: string;
  }[] = [];

  const iface = new ethers.Interface(abiObj);
  try {
    const decodeedInput = iface.parseTransaction({ data: byteData.value });
    console.log(decodeedInput);
    if (!decodeedInput) return;
    decodeData = [
      {
        type: 'Function Name',
        value: decodeedInput.name,
      },
    ].concat(
      decodeedInput.args.map((arg, index) => {
        return {
          type: decodeedInput.fragment.inputs[index].name,
          desc: decodeedInput.fragment.inputs[index].type,
          value: arg.toString(),
        };
      })
    );
    result.value = [...decodeData];
  } catch (err) {
    console.log(err);
  }
};

watch(
  () => abi.value,
  (val) => {
    try {
      JSON.parse(val);
      isErrorJson.value = false;
    } catch (e) {
      isErrorJson.value = true;
    }
  }
);

watch(
  () => byteData.value,
  (val) => {
    try {
      ethers.hexlify(ethers.toBeArray(val));
      isErrorData.value = false;
    } catch (e) {
      isErrorData.value = true;
    }
  }
);
</script>

<style lang="scss" scoped>
.data-input {
  width: 100%;
  height: 100%;
  .data-input-ele {
    width: 100%;
    height: 100%;
  }
}

.result-item {
  margin-top: 16px;
}

.label {
  font-size: 16px;
  min-width: 200px;
  font-weight: 600;
  margin-right: 20px;
  letter-spacing: 0.5px;
  user-select: none;
}

.value {
  font-size: 16px;
}

.array-value {
  font-size: 16px;
  margin-bottom: 4px;
}
</style>
<style lang="scss">
.q-textarea .q-field__control {
  min-height: 300px;
  height: 100%;
}
.separator {
  background-color: var(--q-background);
}
</style>
