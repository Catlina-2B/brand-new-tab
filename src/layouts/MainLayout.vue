<template>
  <q-layout>
    <div class="layout">
      <div class="left-tab flex-column-between-center">
        <div class="flex-column-center-top left-link">
          <router-link v-for="(item, index) in leftRoutes" :key="index" :to="item.path">
            <span class="wrap-icon">
              <component :is="item.icon" width="20" height="20" />
              <q-tooltip anchor="center right" self="center left">{{
                item.name
              }}</q-tooltip>
            </span>
          </router-link>
        </div>
        <div class="settings flex-column-center-center">
          <a href="https://github.com/Catlina-2B/brand-new-tab" target="_blank">
            <span class="wrap-icon">
              <GithubIcon width="20" height="20" />
            </span>
          </a>
          <span class="wrap-icon" @click="showSetting = true">
            <SettingsIcon width="20" height="20" />
          </span>
        </div>
      </div>
      <q-page-container class="page-container">
        <div class="flex-right-center"></div>
        <div style="padding: 60px 20px; max-height: 100vh">
          <router-view />
        </div>
      </q-page-container>
      <div class="right-tab">
        <AllTabs />
      </div>
    </div>
    <Dialog :visible="showSetting" @close="showSetting = false">
      <template v-slot:title> 设置 </template>
      <template v-slot:body>
        <q-splitter v-model="splitterModel" style="height: 450px">
          <template v-slot:before>
            <q-tabs v-model="setting" vertical class="text-teal">
              <q-tab v-for="(item, index) in settingOptions" :name="item.value" :label="item.label" :key="index"
                no-caps />
            </q-tabs>
          </template>
          <template v-slot:after>
            <div class="after-container">
              <div class="center">
                <div class="flex-between-center item-line">
                  <p class="label">主题</p>
                  <q-btn color="primary" no-caps :label="currentTheme">
                    <q-menu>
                      <q-list style="min-width: 100px">
                        <q-item clickable v-close-popup v-for="(item, index) in themes" :key="index"
                          @click="chooseTheme(item)">
                          <q-item-section>{{ item.label }}</q-item-section>
                        </q-item>
                      </q-list>
                    </q-menu>
                  </q-btn>
                </div>
                <div class="flex-between-center item-line">
                  <p class="label">自定义背景</p>
                  <p class="label">即将推出</p>
                </div>
              </div>
            </div>
          </template>
        </q-splitter>
      </template>
    </Dialog>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import SettingsIcon from 'src/assets/svg/SettingIcon.vue';
import SolidityIcon from 'src/assets/svg/IconSolidity.vue';
import IconSOL from 'src/assets/svg/IconSOL.vue';
import HomeIcon from 'src/assets/svg/IconHome.vue';
import ConvertIcon from 'src/assets/svg/IconConvert.vue';
import FrontendIcon from 'src/assets/svg/IconFrontend.vue';
import GithubIcon from 'src/assets/svg/IconGithub.vue';

import Dialog from 'src/components/Dialog/index.vue';

import AllTabs from './AllTabs.vue';

import { getTheme, switchTheme } from 'src/utils/utils';
import { themes, Theme, ThemeItem } from 'src/utils/const';

import { useQuasar } from 'quasar';

const $q = useQuasar();

defineOptions({
  name: 'MainLayout',
});

const leftRoutes = [
  {
    name: 'Home',
    path: '/',
    icon: HomeIcon,
  },
  {
    name: 'ETH',
    path: '/eth/encode',
    icon: SolidityIcon,
  },
  {
    name: 'SOL',
    path: '/sol/create-spl-token',
    icon: IconSOL,
  },
  {
    name: 'Convert',
    path: '/convert/convert',
    icon: ConvertIcon,
  },
  {
    name: '前端工具',
    path: '/front-end/json-diff',
    icon: FrontendIcon,
  },
];

const showSetting = ref(false);

const splitterModel = ref(18);

const setting = ref('general');

const settingOptions = [
  {
    label: '通用',
    value: 'general',
  },
];

const currentTheme = ref('root');

const chooseTheme = (item: ThemeItem) => {
  currentTheme.value = item.label;
  if (item.value == Theme.dark) {
    $q.dark.set(true);
  } else {
    $q.dark.set(false);
  }
  switchTheme(item.value);
};

onMounted(() => {
  currentTheme.value = themes.filter(
    (item) => item.value === getTheme()
  )[0].label;
});
</script>

<style lang="scss" scoped>
.layout {
  display: flex;
  height: 100vh;
}

.page-container {
  flex: 1;
}

.left-tab,
.right-tab {
  height: 100%;
  background-color: var(--q-border);
  padding: 50px 5px;
  padding-bottom: 20px;
}

.left-tab {
  width: 55px;

  .left-link {
    gap: 15px;
  }
}

.right-tab {
  width: 300px;
  max-height: 100vh;
  overflow-y: auto;
  padding-top: 0;
}

.settings {
  margin: 20px;
}

.item-line {
  width: 100%;
  height: 60px;
  padding: 0 20px;

  .label {
    margin-bottom: 0;
  }
}

.after-container {
  width: 100%;
}
</style>
