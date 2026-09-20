/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    server: {
      proxy: { '/api': env.VITE_DEV_API_TARGET ?? 'http://localhost:8080' },
    },
    test: {
      environment: 'jsdom',
      globals: true,
      pool: 'threads',
      setupFiles: ['./src/test/setup.ts'],
    },
  };
});
