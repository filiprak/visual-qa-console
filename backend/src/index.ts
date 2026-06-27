import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const isDev = process.env.NODE_ENV === 'development';
const port = parseInt(process.env.PORT || '8080');
const host = process.env.HOST || 'localhost';

async function createServer() {
    const app = express();
    let vite: any;

    if (isDev) {
        const { createServer: createViteServer } = await import('vite');
        vite = await createViteServer({
            configFile: path.resolve(root, 'vite.config.ts'),
            server: { middlewareMode: true },
            appType: 'custom',
        });
        app.use(vite.middlewares);
    } else {
        // 1. Serve assets from production build folder
        app.use(express.static(path.resolve(root, 'frontend'), { index: false }));
    }

    // API Routes
    app.get('/api', (req, res) => {
        res.json({ message: 'Hello from the backend!' });
    });

    // 3. Fallback: Serve index.html for Single Page Applications (SPA)
    app.use(async (req, res, next) => {
        const url = req.originalUrl;

        try {
            let template: string;

            if (isDev) {
                template = fs.readFileSync(path.resolve(root, 'frontend/index.html'), 'utf-8');
                template = await vite.transformIndexHtml(url, template);
            } else {
                template = fs.readFileSync(path.resolve(root, 'frontend/index.html'), 'utf-8');
            }

            res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
        } catch (e) {
            if (isDev) vite.ssrFixStacktrace(e as Error);
            next(e);
        }
    });

    app.listen(port, host, () => {
        console.log(`Server running at http://${host}:${port} [${!isDev ? 'PROD' : 'DEV'}]`);
        console.log(`Root: ${root}`);
    });
}

createServer();