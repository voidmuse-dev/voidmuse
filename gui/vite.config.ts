import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

/**
 * This plugin enables local static pages to access resources without CORS issues
 * by modifying HTML attributes that may cause cross-origin restrictions
 */
const htmlTransformPlugin = (): Plugin => {
  return {
    name: 'html-transform',
    transformIndexHtml(html) {
      // 1. Change rel="manifest" to rel="stylesheet"
      html = html.replace(
        /<link rel="manifest" href="\.\/manifest\.json" \/>/g, 
        '<link rel="stylesheet" href="./manifest.json" />'
      );
      
      // 2. Replace script type="module" crossorigin with script defer
      html = html.replace(
        /<script type="module" crossorigin src="(\.\/assets\/index-[^"]+\.js)"><\/script>/g,
        '<script defer src="$1"></script>'
      );
      
      // 3. Remove crossorigin attribute from CSS links
      html = html.replace(
        /<link rel="stylesheet" crossorigin href="(\.\/assets\/[^"]+\.css)">/g,
        '<link rel="stylesheet" href="$1">'
      );
      
      return html;
    }
  };
};

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
    htmlTransformPlugin() 
  ],
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern",
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 3002, 
    open: true,
  },
  build: {
    outDir: 'dist', 
    sourcemap: true
  }
});