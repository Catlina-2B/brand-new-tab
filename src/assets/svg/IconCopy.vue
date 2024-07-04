<template>
  <svg
    t="1719917375727"
    class="icon"
    viewBox="0 0 1024 1024"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    p-id="4414"
    width="20"
    height="20"
    @click="copy"
    style="cursor: pointer"
    v-if="!copied"
  >
    <path
      d="M768 682.666667V170.666667a85.333333 85.333333 0 0 0-85.333333-85.333334H170.666667a85.333333 85.333333 0 0 0-85.333334 85.333334v512a85.333333 85.333333 0 0 0 85.333334 85.333333h512a85.333333 85.333333 0 0 0 85.333333-85.333333zM170.666667 170.666667h512v512H170.666667z m682.666666 85.333333v512a85.333333 85.333333 0 0 1-85.333333 85.333333H256a85.333333 85.333333 0 0 0 85.333333 85.333334h426.666667a170.666667 170.666667 0 0 0 170.666667-170.666667V341.333333a85.333333 85.333333 0 0 0-85.333334-85.333333z"
      p-id="4415"
    ></path>
  </svg>
  <span style="font-size: 14px" v-else>Copied</span>
</template>

<script lang="ts" setup>
import { defineProps, toRefs, ref } from 'vue';

import { copyToClipboard } from 'quasar';

const copied = ref(false);

const props = defineProps({
  text: {
    type: String,
    required: true,
  },
});

const { text } = toRefs(props);

const copy = () => {
  copyToClipboard(text.value);
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 1000);
};
</script>
