/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
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
