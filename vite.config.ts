import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '.');

export default defineConfig({
    root: './frontend',
    plugins: [
        vue(),
        tailwindcss(),
    ],
    build: {
        outDir: '../dist/frontend/',
        rolldownOptions: {
            input: path.resolve(root, 'frontend/index.html'),
        },
    },
});