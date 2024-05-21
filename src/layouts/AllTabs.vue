<template>
  <div class="all-tabs-container">
    <p class="all-tabs">All Tabs</p>
    <q-input
      v-model="searchText"
      dense
      outlined
      placeholder="搜索tab"
      class="search-tab"
    ></q-input>
    <q-list>
      <template
        v-for="(item, itemIndex) in tabsView"
        :key="`item-${itemIndex}`"
      >
        <q-expansion-item expand-separator v-if="item.tabs.length > 1">
          <template v-slot:header>
            <div class="icon-box">
              <q-img :src="item.icon" width="25px"></q-img>
            </div>
            <div class="item-title flex-left-center">{{ item.title }}</div>
          </template>
          <q-list>
            <q-item
              v-for="(tab, tabIndex) in item.tabs"
              :key="`tab-${tabIndex}-${tab.id}`"
              clickable
              v-ripple
              @click="goTab(tab)"
            >
              <q-item-section>
                {{ tab.title }}
              </q-item-section>
            </q-item>
          </q-list>
        </q-expansion-item>
        <template v-else>
          <q-item
            v-for="(tab, tabIndex) in item.tabs"
            :key="tabIndex"
            clickable
            v-ripple
            @click="goTab(tab)"
          >
            <q-item-section avatar>
              <q-img :src="item.icon" width="25px"></q-img>
            </q-item-section>
            <q-item-section>
              {{ tab.title }}
            </q-item-section>
          </q-item>
        </template>
      </template>
    </q-list>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';

interface TAB_ITEM {
  title: string;
  tabs: chrome.tabs.Tab[];
  icon: string;
}

const myTabs = ref<chrome.tabs.Tab[]>([]);
const tabsView = ref<TAB_ITEM[]>([]);
const tabsSource = ref<TAB_ITEM[]>([]);

const searchText = ref('');

const goTab = (tab: chrome.tabs.Tab) => {
  if (!tab.id || !chrome.tabs) return;
  chrome.tabs.update(tab.id, { active: true });
  window.close();
};

onMounted(() => {
  console.log('mounted');
  if (!chrome.tabs) return;
  chrome.tabs.query({}, (tabs) => {
    console.log(tabs);
    myTabs.value = [...tabs];
  });
});

function normalizeDomain(domain: string) {
  // 使用正则表达式匹配最顶级的两个域名部分
  const regex = /^(?:https?:\/\/)?(?:\w+\.)?(\w+\.\w+)$/;
  const match = domain.match(regex);

  if (match) {
    return match[1];
  }

  return domain;
}

watch(
  myTabs,
  (newVal) => {
    console.log('newVal', newVal);
    const groups: Record<string, TAB_ITEM> = {};
    // 将相同的主域的tab合并到一个group中，并设置group的title为网站的title
    newVal.forEach((tab) => {
      if (!tab.url) return;
      // const url = new URL(tab.url);
      const hostname = normalizeDomain(new URL(tab.url).hostname);
      console.log(hostname);
      if (groups[hostname]) {
        groups[hostname].tabs.push(tab);
      } else {
        groups[hostname] = {
          title: tab.title,
          tabs: [tab],
          icon:
            tab.url == 'chrome://newtab/' ? '/www/favicon.ico' : tab.favIconUrl,
        } as TAB_ITEM;
      }
    });
    console.log('groups', groups);
    tabsView.value = Object.values(groups);
    tabsSource.value = Object.values(groups);
  },
  {
    immediate: true,
    deep: true,
  }
);

watch(
  () => searchText.value,
  (newVal) => {
    if (!newVal) {
      tabsView.value = tabsSource.value;
      return;
    }
    tabsView.value = tabsSource.value.map((group) => {
      const tabs = group.tabs.filter(
        (tab: chrome.tabs.Tab) =>
          (tab.title &&
            tab.title.toLowerCase().includes(newVal.toLowerCase())) ||
          (tab.url && tab.url.toLowerCase().includes(newVal.toLowerCase()))
      );
      return {
        ...group,
        tabs,
      };
    });
  }
);
</script>

<style lang="scss" scoped>
.all-tabs {
  padding: 16px;
  font-size: 20px;
  font-weight: 500;
  color: var(--q-border-text);
}

.icon-box {
  min-width: 56px;
  padding-right: 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.item-title {
  flex-wrap: wrap;
}

.search-tab {
  margin: 0 10px;
  margin-bottom: 20px;
}
</style>
<style lang="scss">
.all-tabs-container {
  .q-field__control {
    color: var(--q-border-text);
    border-radius: 10px;
  }
  .q-item__label {
    color: var(--q-border-text);
  }
  .q-item__section--side > .q-icon {
    color: var(--q-border-text);
  }
  .q-expansion-item__container {
    background-color: var(--q-item-background);
    border-radius: 10px;
  }
  .q-item__section,
  .q-expansion-item {
    color: var(--q-border-text);
  }
  .q-field__native {
    color: var(--q-border-text);
  }
}
</style>
