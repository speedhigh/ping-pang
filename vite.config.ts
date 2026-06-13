/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'

function heroiconsResolver() {
  return {
    type: 'component' as const,
    resolve: (name: string) => {
      if (!name.endsWith('Icon')) return
      return { name, from: '@heroicons/vue/24/outline' }
    },
  }
}

export default defineConfig({
  // 相对路径：兼容 GitHub Pages 子路径与 jsDelivr 镜像
  base: './',
  plugins: [
    vue(),
    AutoImport({
      imports: ['vue', '@vueuse/core'],
      dts: 'src/auto-imports.d.ts',
      vueTemplate: true,
    }),
    Components({
      dirs: ['src/components'],
      extensions: ['vue'],
      deep: true,
      dts: 'src/components.d.ts',
      resolvers: [heroiconsResolver()],
    }),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.jpg'],
      manifest: {
        name: '乒乓球计分器',
        short_name: '乒乓球计分器',
        description: '球桌旁快速记分的乒乓球计分器',
        lang: 'zh-CN',
        theme_color: '#E84855',
        background_color: '#E84855',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'favicon.jpg',
            sizes: '512x512',
            type: 'image/jpeg',
            purpose: 'any',
          },
          {
            src: 'favicon.jpg',
            sizes: '512x512',
            type: 'image/jpeg',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,svg,jpg,jpeg,png,woff2}'],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
  },
})
