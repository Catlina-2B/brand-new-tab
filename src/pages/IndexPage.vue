<template>
  <div class="mode-toggle">
    <q-toggle v-model="isNotebookModeLocal" color="primary" icon="book" @update:model-value="toggleNotebookMode">
      <q-tooltip>{{ isNotebookModeLocal ? '已启用笔记本模式' : '点击启用笔记本模式' }}</q-tooltip>
    </q-toggle>
  </div>
  <div v-if="!isNotebookModeLocal">
    <div class="update flex-left-center">
      <IconUpdate width="18" height="18" />
      <p class="update-text">
        增加Solana链关闭账户功能
      </p>
    </div>
    <div class="index-container">
      <div class="times">
        <p><span>时间戳</span>{{ timestamp }}</p>
        <p><span>UTC时间</span>{{ utcTime }}</p>
        <p><span>北京时间</span>{{ beijingTime }}</p>
        <p><span>伦敦时间</span>{{ londonTime }}</p>
        <p><span>纽约时间</span>{{ newYorkTime }}</p>
        <p><span>太平洋时间</span>{{ pacificTime }}</p>
      </div>
      <div class="flex-center-center main-content">
        <div class="index-content flex-column-right-center">
          <div class="img-box">
            <div class="hero-bg"></div>
            <img :src="imgList[radomImageIndex].url" alt="img" />
          </div>
          <p class="content">
            {{ imgList[radomImageIndex].copywrite.content }}
          </p>
          <p class="split"></p>
          <p class="author">
            {{ imgList[radomImageIndex].copywrite.author }}
          </p>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="papper-container">
    <Papper />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import copywrite from '../assets/copywrite';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { useModeStore } from 'src/stores/mode-store';
import Papper from 'src/pages/Papper/index.vue';

import IconUpdate from 'src/assets/svg/IconUpdate.vue';

dayjs.extend(utc);
dayjs.extend(timezone);

defineOptions({
  name: 'IndexPage',
});

const modeStore = useModeStore();
const isNotebookModeLocal = computed({
  get: () => modeStore.isNotebookMode,
  set: (value) => {
    // 这里不需要做任何事情，因为我们使用 toggleNotebookMode 来更新状态
  }
});

// 切换笔记本模式
const toggleNotebookMode = () => {
  modeStore.toggleNotebookMode();
};

const timestamp = ref<number>(Date.now());
const beijingTime = ref<string>(
  dayjs().tz('Asia/Shanghai').format('YYYY-MM-DD HH:mm:ss')
);
const newYorkTime = ref<string>(
  dayjs().tz('America/New_York').format('YYYY-MM-DD HH:mm:ss')
);
const utcTime = ref<string>(dayjs().utc().format('YYYY-MM-DD HH:mm:ss'));
const londonTime = ref<string>(
  dayjs().tz('Europe/London').format('YYYY-MM-DD HH:mm:ss')
);
const singaporeTime = ref<string>(
  dayjs().tz('Asia/Singapore').format('YYYY-MM-DD HH:mm:ss')
);
const pacificTime = ref<string>(
  dayjs().tz('America/Los_Angeles').format('YYYY-MM-DD HH:mm:ss')
);

const list = import.meta.globEager('../assets/img/light*.png');

const randomContentIndex = Math.floor(Math.random() * copywrite.length);

// 获取所有图片
const imgList = Object.keys(list).map((key) => {
  return {
    url: list[key].default,
    copywrite: copywrite[randomContentIndex],
  };
});

const radomImageIndex = Math.floor(Math.random() * imgList.length);

onMounted(() => {
  setInterval(() => {
    timestamp.value = Date.now();
    beijingTime.value = dayjs()
      .tz('Asia/Shanghai')
      .format('YYYY-MM-DD HH:mm:ss');
    newYorkTime.value = dayjs()
      .tz('America/New_York')
      .format('YYYY-MM-DD HH:mm:ss');
    utcTime.value = dayjs().utc().format('YYYY-MM-DD HH:mm:ss');
    londonTime.value = dayjs()
      .tz('Europe/London')
      .format('YYYY-MM-DD HH:mm:ss');
    singaporeTime.value = dayjs()
      .tz('Asia/Singapore')
      .format('YYYY-MM-DD HH:mm:ss');
    pacificTime.value = dayjs()
      .tz('America/Los_Angeles')
      .format('YYYY-MM-DD HH:mm:ss');
  }, 1000);
});
</script>

<style lang="scss" scoped>
.mode-toggle {
  position: fixed;
  top: 10px;
  right: 20px;
  z-index: 100;
  padding: 5px;
  border-radius: 4px;
}

.papper-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.index-container {
  width: 100%;
  height: 800px;
  position: relative;
  padding: 60px;

  .times {
    position: absolute;
    right: 20px;
    top: 0px;
    font-size: 12px;
    font-weight: 600;

    span {
      display: inline-block;
      width: 180px;
      text-align: right;
      margin-right: 20px;
    }
  }
}

.update {
  position: absolute;
  bottom: 10px;
  left: 80px;

  .update-text {
    margin-bottom: 0;
    margin-left: 10px;
  }
}

.main-content {
  height: 800px;
}

.index-content {
  width: 500px;

  .img-box {
    width: 100%;
    text-align: center;
    position: relative;

    .hero-bg {
      position: absolute;
      width: 320px;
      height: 320px;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      background-image: var(--q-hero-image-background-image);
      filter: var(--q-hero-image-filter);
      z-index: -1;
    }
  }

  img {
    width: 200px;
    height: 240px;
    object-fit: cover;
    border-radius: 20px;
    box-shadow: 8px 8px 30px 0 rgba(0, 0, 0, 0.25);
  }

  .content {
    width: 100%;
    font-size: 22px;
    font-weight: 500;
    margin: 50px 0;
    margin-top: 140px;
    text-align: left;
    font-family: MaShanZheng;
  }

  .author {
    width: 100%;
    text-align: right;
    font-size: 18px;
    font-weight: 700;
    font-family: MaShanZheng;
  }

  .split {
    width: 200px;
    font-weight: 800;
    height: 4px;
    background: var(--q-primary);
    margin-bottom: 40px;
  }
}
</style>
