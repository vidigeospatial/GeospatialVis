import { defineConfig  } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath  } from 'url'
import path from 'path'
// import fs from 'vite-plugin-fs'
// import ViteFS from 'vite-fs'
import renderer from 'vite-plugin-electron-renderer'
const filename = fileURLToPath(import.meta.url)
const pathSegments = path.dirname(filename)

export default defineConfig({
    root: 'src/',
    plugins: [vue(), renderer()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
        extensions: ['.mjs', '.scss', '.js', '.ts', '.jsx', '.tsx', '.json', '.csv'],
    },
    define: {
        'process.env': {}
    },
    build: {
        outDir: '../dist',
        chunkSizeWarningLimit: 1000,
    },
    base: '',
    server: {
        port: 3000,
    },
    esbuild: {
        target: 'esnext',
    },
})
