import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
    root: './frontend',
    plugins: [vue()],
    build: {
        outDir: '../dist/frontend/',
        rolldownOptions: {
            input: 'index.html',
        },
    },
});