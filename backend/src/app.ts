import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { feathers } from '@feathersjs/feathers';
import { koa, rest, bodyParser, errorHandler } from '@feathersjs/koa';
import koaConnect from 'koa-connect';
import koaStatic from 'koa-static';
import koaSslifyModule from 'koa-sslify';
import type { ViteDevServer } from 'vite';
import { db } from './db.js';
import { appServices } from './services/index.js';
import { hooks } from './app.hooks.js';
import type { Configuration, ServiceTypes } from './declarations.js';

const koaSslify = koaSslifyModule.default;
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

export async function createServer(opts?: { port?: number, isDev?: boolean }) {
    const isDev = !!opts?.isDev;
    const app = koa(feathers<ServiceTypes, Configuration>());

    !isDev && app.use(koaSslify({ port: opts?.port }));
    app.set('db', db);
    app.use(errorHandler());
    app.use(bodyParser());
    app.configure(rest());
    app.hooks(hooks);

    // API Services
    app.configure(appServices);

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
        app.use(koaStatic(path.resolve(root, 'dist/frontend'), { index: false }));
    }

    // SPA fallback
    app.use(async (ctx, next) => {
        try {
            const url = ctx.originalUrl;

            let template: string;

            if (isDev && vite) {
                template = fs.readFileSync(path.resolve(root, 'frontend/index.html'), 'utf-8');

                template = await vite.transformIndexHtml(url, template);
            } else {
                template = fs.readFileSync(path.resolve(root, 'dist/frontend/index.html'), 'utf-8');
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

    return app;
}
