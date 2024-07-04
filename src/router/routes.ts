import { RouteRecordRaw } from 'vue-router';
import ETH from 'src/pages/ETH/index.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      {
        path: 'eth',
        component: ETH,
        children: [
          {
            path: 'encode',
            component: () => import('pages/ETH/Encode/index.vue')
          },
          {
            path: 'decode',
            component: () => import('pages/ETH/Decode/index.vue')
          },
          {
            path: 'rpc',
            component: () => import('pages/ETH/RPC/index.vue')
          },
          {
            path: 'sign',
            component: () => import('pages/ETH/Sign/index.vue')
          },
          {
            path: 'address',
            component: () => import('pages/ETH/Address/index.vue')
          },
          {
            path: 'kdf',
            component: () => import('pages/ETH/KDF/index.vue')
          }
        ]
      },
      {
        path: 'convert',
        component: () => import('pages/Convert/index.vue'),
        children: [
          {
            path: 'encode-decode',
            component: () => import('pages/Convert/EncodeOrDecode/index.vue')
          },
          {
            path: 'hash',
            component: () => import('pages/Convert/Hash/index.vue')
          },
          {
            path: 'convert',
            component: () => import('pages/Convert/Convert/index.vue')
          }
        ]
      },
      {
        path: 'front-end',
        component: () => import('pages/Frontend/index.vue'),
        children: [
          {
            path: 'json-diff',
            component: () => import('pages/Frontend/JSONDiff/index.vue')
          },
          {
            path: 'image-to-base64',
            component: () => import('pages/Frontend/ImageToBase64/index.vue')
          },
          {
            path: 'draw-online',
            component: () => import('pages/Frontend/Draw/index.vue')
          },
          {
            path: 'color-select',
            component: () => import('pages/Frontend/Color/index.vue')
          }
        ]
      }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
];

export default routes;
