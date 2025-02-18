/* eslint-env node */

/*
 * This file runs in a Node context (it's NOT transpiled by Babel), so use only
 * the ES6 features that are supported by your Node version. https://node.green/
 */

// Configuration for your app
// https://v2.quasar.dev/quasar-cli-vite/quasar-config-js

const { configure } = require('quasar/wrappers');
const path = require('path');
const { nodePolyfills } = require('vite-plugin-node-polyfills');

module.exports = configure(function (/* ctx */) {
  return {
    // https://v2.quasar.dev/quasar-cli-vite/prefetch-feature
    // preFetch: true,

    // app boot file (/src/boot)
    // --> boot files are part of "main.js"
    // https://v2.quasar.dev/quasar-cli-vite/boot-files
    boot: ['i18n', 'axios'],

    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#css
    css: ['app.scss', 'index.scss', 'tailwind.css'],

    // https://github.com/quasarframework/quasar/tree/dev/extras
    extras: [
      // 'ionicons-v4',
      // 'mdi-v7',
      // 'fontawesome-v6',
      // 'eva-icons',
      // 'themify',
      // 'line-awesome',
      // 'roboto-font-latin-ext', // this or either 'roboto-font', NEVER both!

      'roboto-font', // optional, you are not bound to it
      'material-icons', // optional, you are not bound to it
    ],

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#build
    build: {
      target: {
        browser: ['es2020'],
        node: 'node20',
      },

      vueRouterMode: 'hash', // available values: 'hash', 'history'
      // vueRouterBase,
      // vueDevtools,
      // vueOptionsAPI: false,

      // rebuildCache: true, // rebuilds Vite/linter/etc cache on startup

      // publicPath: '/',
      // analyze: true,
      // env: {},
      // rawDefine: {}
      // ignorePublicFolder: true,
      // minify: false,
      // polyfillModulePreload: true,
      // distDir

      // extendViteConf (viteConf) {},
      // viteVuePluginOptions: {},

      rollupOptions: {
        external: [
          '#alloc',
          // Remove these node-specific externals since we want to use polyfills instead
          // 'node:crypto',
          // 'node:buffer',
          // 'node:path',
          // 'node:process',
          // 'node:fs/promises',
          // 'node:http',
        ],
        output: {
          manualChunks: {
            web3: ['@solana/web3.js'],
            'spl-token': ['@solana/spl-token'],
            raydium: ['@raydium-io/raydium-sdk-v2'],
          },
        },
      },

      optimizeDeps: {
        exclude: ['uint8arrays', '@soceanfi/solana-cli-config'],
        include: [
          '@solana/web3.js',
          '@solana/spl-token',
          '@raydium-io/raydium-sdk-v2',
        ],
        esbuildOptions: {
          target: 'es2020',
          supported: {
            bigint: true,
          },
        },
      },

      alias: {
        '#alloc': path.resolve(
          __dirname,
          'node_modules/uint8arrays/dist/src/alloc.js'
        ),
        '#util': path.resolve(
          __dirname,
          'node_modules/uint8arrays/dist/src/util'
        ),
        '#from-string': path.resolve(
          __dirname,
          'node_modules/uint8arrays/dist/src/from-string.js'
        ),
        '#to-string': path.resolve(
          __dirname,
          'node_modules/uint8arrays/dist/src/to-string.js'
        ),
        '#compare': path.resolve(
          __dirname,
          'node_modules/uint8arrays/dist/src/compare.js'
        ),
        '#concat': path.resolve(
          __dirname,
          'node_modules/uint8arrays/dist/src/concat.js'
        ),
        'uint8arrays/to-string': path.resolve(
          __dirname,
          'node_modules/uint8arrays/dist/src/to-string.js'
        ),
        'uint8arrays/from-string': path.resolve(
          __dirname,
          'node_modules/uint8arrays/dist/src/from-string.js'
        ),
        'uint8arrays/concat': path.resolve(
          __dirname,
          'node_modules/uint8arrays/dist/src/concat.js'
        ),
        'uint8arrays/compare': path.resolve(
          __dirname,
          'node_modules/uint8arrays/dist/src/compare.js'
        ),
        'uint8arrays/alloc': path.resolve(
          __dirname,
          'node_modules/uint8arrays/dist/src/alloc.js'
        ),
        'uint8arrays/equals': path.resolve(
          __dirname,
          'node_modules/uint8arrays/dist/src/equals.js'
        ),
        'uint8arrays/xor': path.resolve(
          __dirname,
          'node_modules/uint8arrays/dist/src/xor.js'
        ),
        'uint8arrays/xor-compare': path.resolve(
          __dirname,
          'node_modules/uint8arrays/dist/src/xor-compare.js'
        ),
        uint8arrays: path.resolve(
          __dirname,
          'node_modules/uint8arrays/dist/src/index.js'
        ),
        fs: 'rollup-plugin-node-polyfills/polyfills/fs',
        path: 'rollup-plugin-node-polyfills/polyfills/path',
        os: 'rollup-plugin-node-polyfills/polyfills/os',
      },

      define: {
        'process.env.NODE_DEBUG': 'false',
        'process.platform': JSON.stringify('browser'),
        'process.version': JSON.stringify('v16.0.0'),
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
        global: 'globalThis',
      },

      build: {
        commonjsOptions: {
          transformMixedEsModules: true,
          include: [/uint8arrays/, /node_modules/],
        },
      },

      vitePlugins: [
        [
          '@intlify/vite-plugin-vue-i18n',
          {
            // if you want to use Vue I18n Legacy API, you need to set `compositionOnly: false`
            // compositionOnly: false,

            // if you want to use named tokens in your Vue I18n messages, such as 'Hello {name}',
            // you need to set `runtimeOnly: false`
            // runtimeOnly: false,

            // you need to set i18n resource including paths !
            include: path.resolve(__dirname, './src/i18n/**'),
          },
        ],
        [
          'vite-plugin-checker',
          {
            vueTsc: {
              tsconfigPath: 'tsconfig.vue-tsc.json',
            },
            eslint: {
              lintCommand: 'eslint "./**/*.{js,ts,mjs,cjs,vue}"',
            },
          },
          { server: false },
        ],
        nodePolyfills({
          globals: {
            Buffer: true,
            global: true,
            process: true,
          },
          protocolImports: true,
          include: [
            'buffer',
            'process',
            'util',
            'stream',
            'events',
            'crypto',
            'path',
            'fs',
            'os',
            'http',
          ],
        }),
      ],
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#devServer
    devServer: {
      // https: true
      open: false, // opens browser window automatically
    },

    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#framework
    framework: {
      config: {},

      // iconSet: 'material-icons', // Quasar icon set
      // lang: 'en-US', // Quasar language pack

      // For special cases outside of where the auto-import strategy can have an impact
      // (like functional components as one of the examples),
      // you can manually specify Quasar components/directives to be available everywhere:
      //
      // components: [],
      // directives: [],

      // Quasar plugins
      plugins: [],
    },

    // animations: 'all', // --- includes all animations
    // https://v2.quasar.dev/options/animations
    animations: [],

    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#sourcefiles
    // sourceFiles: {
    //   rootComponent: 'src/App.vue',
    //   router: 'src/router/index',
    //   store: 'src/store/index',
    //   registerServiceWorker: 'src-pwa/register-service-worker',
    //   serviceWorker: 'src-pwa/custom-service-worker',
    //   pwaManifestFile: 'src-pwa/manifest.json',
    //   electronMain: 'src-electron/electron-main',
    //   electronPreload: 'src-electron/electron-preload'
    // },

    // https://v2.quasar.dev/quasar-cli-vite/developing-ssr/configuring-ssr
    ssr: {
      // ssrPwaHtmlFilename: 'offline.html', // do NOT use index.html as name!
      // will mess up SSR

      // extendSSRWebserverConf (esbuildConf) {},
      // extendPackageJson (json) {},

      pwa: false,

      // manualStoreHydration: true,
      // manualPostHydrationTrigger: true,

      prodPort: 3000, // The default port that the production server should use
      // (gets superseded if process.env.PORT is specified at runtime)

      middlewares: [
        'render', // keep this as last one
      ],
    },

    // https://v2.quasar.dev/quasar-cli-vite/developing-pwa/configuring-pwa
    pwa: {
      workboxMode: 'generateSW', // or 'injectManifest'
      injectPwaMetaTags: true,
      swFilename: 'sw.js',
      manifestFilename: 'manifest.json',
      useCredentialsForManifestTag: false,
      // useFilenameHashes: true,
      // extendGenerateSWOptions (cfg) {}
      // extendInjectManifestOptions (cfg) {},
      // extendManifestJson (json) {}
      // extendPWACustomSWConf (esbuildConf) {}
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-cordova-apps/configuring-cordova
    cordova: {
      // noIosLegacyBuildFlag: true, // uncomment only if you know what you are doing
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-capacitor-apps/configuring-capacitor
    capacitor: {
      hideSplashscreen: true,
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-electron-apps/configuring-electron
    electron: {
      // extendElectronMainConf (esbuildConf)
      // extendElectronPreloadConf (esbuildConf)

      inspectPort: 5858,

      bundler: 'packager', // 'packager' or 'builder'

      packager: {
        // https://github.com/electron-userland/electron-packager/blob/master/docs/api.md#options
        // OS X / Mac App Store
        // appBundleId: '',
        // appCategoryType: '',
        // osxSign: '',
        // protocol: 'myapp://path',
        // Windows only
        // win32metadata: { ... }
      },

      builder: {
        // https://www.electron.build/configuration/configuration

        appId: 'mytab',
      },
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-browser-extensions/configuring-bex
    bex: {
      contentScripts: ['my-content-script'],

      // extendBexScriptsConf (esbuildConf) {}
      // extendBexManifestJson (json) {}
    },
  };
});
