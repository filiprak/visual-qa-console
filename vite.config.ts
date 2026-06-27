import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
    root: './frontend',
    plugins: [
        vue(),
        tailwindcss(),
    ],
    build: {
        outDir: '../dist/frontend/',
        rolldownOptions: {
            input: 'index.html',
        },
    },
});