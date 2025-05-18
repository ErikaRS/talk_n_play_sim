import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  base: './',
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.js',
    include: ['tests-vite/**/*.test.js'],
    deps: {
      inline: ['@testing-library/jest-dom']
    }
  },
  build: {
    outDir: 'dist',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './public')
    }
  }
})