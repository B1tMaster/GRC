import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@payload-config': path.resolve(__dirname, './src/payload.config.ts'),
      'payload/dist/fields/validations.js': path.resolve(
        __dirname,
        './node_modules/payload/dist/fields/validations.js',
      ),
    },
  },
})
