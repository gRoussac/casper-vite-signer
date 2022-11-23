import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      // string shorthand
      '/rpc': 'http://localhost:11101/',
      // '/rpc': 'http://3.23.146.54:7777',
    },
  },
});
