<template>
  <div class="index-container">
    <q-tabs class="flex-left-center tabs" narrow-indicator>
      <q-route-tab name="encode" label="Encode" to="/eth/encode" no-caps />
      <q-route-tab name="decode" label="Decode" to="/eth/decode" no-caps />
      <!-- <q-route-tab name="rpc" label="RPC" to="/eth/rpc" no-caps /> -->
      <q-route-tab name="sign" label="签名" to="/eth/sign" no-caps />
      <q-route-tab name="address" label="地址转换" to="/eth/address" no-caps />
      <q-route-tab name="kdf" label="KDF" to="/eth/kdf" no-caps />
    </q-tabs>
    <div style="padding: 30px 10px">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'eth-component',
});
</script>

<style lang="scss" scoped>
.tabs {
  width: fit-content;
}
</style>
