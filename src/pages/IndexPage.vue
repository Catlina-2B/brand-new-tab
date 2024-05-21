<template>
  <div class="index-container">
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
</template>

<script setup lang="ts">
import copywrite from '../assets/copywrite';

defineOptions({
  name: 'IndexPage',
});

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
</script>

<style lang="scss" scoped>
.index-container {
  width: 100%;
  height: 800px;
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
