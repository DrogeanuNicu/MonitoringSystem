import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

// const backendAddress = 'https://drogeanunicusor.go.ro:443';
const backendAddress = 'http://localhost:5000';

export default defineConfig({
  plugins: [
    solidPlugin(),
  ],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: backendAddress,
        changeOrigin: true,
        rewrite: (path) => {
          return backendAddress + path;;
        },
      },
    },
  },
  build: {
    target: 'esnext',
  },
});
