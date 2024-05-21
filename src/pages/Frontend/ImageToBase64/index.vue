<template>
  <div class="container">
    <p>请选择图片：</p>
    <div class="flex-left-center">
      <q-file
        style="width: 300px"
        v-model="filesImages"
        filled
        label="需要转换的图片"
        multiple
        accept=".jpg, image/*"
        @rejected="onRejected"
        dense
      />
      <q-btn
        class="convert-confirm"
        no-caps
        color="primary"
        @click="confirmConvert"
        >转换</q-btn
      >
    </div>
    <div>
      <q-input
        class="data-input-ele"
        v-model="base64Result"
        type="textarea"
        outlined
        placeholder="转换结果会在这出现"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
defineOptions({
  name: 'image-to-base64',
});
import { ref } from 'vue';
import { useQuasar, QRejectedEntry } from 'quasar';

const $q = useQuasar();

const filesImages = ref([]);

const base64Result = ref('');

const onRejected = (rejectedEntries: QRejectedEntry[]) => {
  $q.notify({
    type: 'negative',
    message: `${rejectedEntries.length} file(s) did not pass validation constraints`,
  });
};

// 将图片转换成base64
const convertImageToBase64 = (file: File) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    base64Result.value = e.target?.result as string;
  };
  reader.readAsDataURL(file);
};

const confirmConvert = () => {
  if (filesImages.value.length === 0) {
    $q.notify({
      type: 'negative',
      message: '请先选择图片',
    });
    return;
  }
  convertImageToBase64(filesImages.value[0]);
};
</script>
<style lang="scss" scoped>
@import '../index.scss';

.convert-confirm {
  margin-left: 20px;
}

.data-input-ele {
  margin-top: 20px;
}
</style>
