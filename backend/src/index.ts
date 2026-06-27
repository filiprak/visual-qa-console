import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { feathers } from '@feathersjs/feathers';
import { koa } from '@feathersjs/koa';
import koaConnect from 'koa-connect';
import koaStatic from 'koa-static';
import type { ViteDevServer } from 'vite';


const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const isDev = process.env.NODE_ENV === 'development';
const port = parseInt(process.env.PORT || '8080');
const host = process.env.HOST || 'localhost';

async function createServer() {
    const app = koa(feathers());

    let vite: ViteDevServer;

    if (isDev) {
        const { createServer: createViteServer } = await import('vite');
        vite = await createViteServer({
            configFile: path.resolve(root, 'vite.config.ts'),
            server: { middlewareMode: true },
            appType: 'custom',
        });
        app.use(koaConnect(vite.middlewares));
    } else {
        // 1. Serve assets from production build folder
        app.use(koaStatic(path.resolve(root, 'frontend'), { index: false }));
    }

    // API Routes
    app.use(async (ctx, next) => {
        if (ctx.path === '/api' && ctx.method === 'GET') {
            ctx.body = {
                message: 'Hello from the backend!',
            };
            return;
        }

        await next();
    });

    // SPA fallback
    app.use(async (ctx, next) => {
        try {
            const url = ctx.originalUrl;

            let template: string;

            if (isDev && vite) {
                template = fs.readFileSync(
                    path.resolve(root, 'frontend/index.html'),
                    'utf-8'
                );

                template = await vite.transformIndexHtml(url, template);
            } else {
                template = fs.readFileSync(
                    path.resolve(root, 'frontend/index.html'),
                    'utf-8'
                );
            }

            ctx.type = 'text/html';
            ctx.status = 200;
            ctx.body = template;

        } catch (error) {
            if (isDev && vite) {
                vite.ssrFixStacktrace(error as Error);
            }

            await next();
            throw error;
        }
    });

    app.listen(port, host, () => {
        console.log(`Server running at http://${host}:${port} [${!isDev ? 'PROD' : 'DEV'}]`);
        console.log(`Root: ${root}`);
    });
}

createServer();