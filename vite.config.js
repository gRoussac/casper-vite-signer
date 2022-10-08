import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      // string shorthand
      '/rpc': 'http://localhost:11101/',
    },
  },
});
