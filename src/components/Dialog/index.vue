<template>
  <q-dialog
    class="dialog"
    v-model="visibleDialog"
    :position="position ? position : 'standard'"
  >
    <q-card
      class="card"
      :style="`${
        size == 'md'
          ? 'width: 900px; max-width: 80vw;'
          : size == 'lg'
          ? 'width: 95vw; max-width: 95vw'
          : ''
      }${overflowUnset ? 'overflow: unset' : ''}`"
    >
      <q-card-section
        v-if="showTitle"
        style="position: sticky; top: 0; z-index: 10; overflow: hidden"
      >
        <div class="flex-between-center card-top">
          <p class="title">
            <slot name="title"></slot>
          </p>
          <q-space />
          <q-btn
            class="close-icon"
            icon="close"
            flat
            round
            dense
            size="sm"
            @click="close"
          />
        </div>
      </q-card-section>
      <q-card-section :style="`overflow: ${overflowUnset ? 'unset' : 'auto'};`">
        <div class="body">
          <slot name="body"></slot>
        </div>
      </q-card-section>
      <q-card-actions
        :align="bottomAlign"
        v-if="showFooter"
        style="overflow: hidden"
      >
        <div class="footer">
          <slot name="footer"></slot>
        </div>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, defineProps, toRefs, watch } from 'vue';

defineOptions({
  name: 'dialog-component',
});

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  bottomAlign: {
    type: String,
    default: 'center',
  },
  size: {
    type: String,
    default: '',
  },
  showTitle: {
    type: Boolean,
    default: true,
  },
  showFooter: {
    type: Boolean,
    default: true,
  },
  position: {
    type: String,
    default: 'standard',
  },
  overflowUnset: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['close']);

const { visible, bottomAlign, size, position, overflowUnset } = toRefs(props);
const visibleDialog = ref(false);

const close = () => {
  emit('close');
};

watch(
  () => visible.value,
  (val) => {
    // console.log(val)
    visibleDialog.value = val;
  },
  {
    immediate: true,
  }
);

watch(
  () => visibleDialog.value,
  (val) => {
    if (!val) {
      close();
    }
  }
);
</script>

<style lang="scss" scoped>
.card {
  border-radius: 16px;

  .title {
    color: var(--oort-navy, #002d70);
    font-size: 20px;
    font-weight: 600;
    line-height: 28px;
    margin-bottom: 0;
  }
}

.card-top {
  padding: 16px 24px;
  border-bottom: 1px solid var(--Neutral-Neutral-50, #edeff2);
  background: #fcfcfc;
}

@media screen and (min-width: 1024px) {
  .card {
    min-width: 490px;
  }
}
</style>

<style lang="scss">
.dialog {
  .q-btn {
    padding: 0 20px;
  }

  .q-card__section--vert,
  .q-card__actions {
    padding: 0;
  }

  .close-icon {
    padding: 0;
    top: 0;
    right: 0;
  }

  .body {
    padding: 24px;
  }

  .footer {
    width: 100%;
    padding: 24px;
    padding-top: 0;
  }
}

@media (min-width: 600px) {
  .q-dialog__inner--minimized > div {
    max-width: 800px;
  }
}
</style>
