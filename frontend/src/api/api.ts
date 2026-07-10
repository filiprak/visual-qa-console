import { feathers, type ClientService, type HookContext } from '@feathersjs/feathers';
import rest from '@feathersjs/rest-client';
import type { ServiceTypes } from './services';
import { onBeforeMount, onBeforeUnmount, watch } from 'vue';

export type ServiceWatcher = () => void | Promise<void>;

const app = feathers<ServiceTypes>();
const restClient = rest();

let watchers: { apis: ClientService[]; callback: ServiceWatcher }[] = [];

function authFetch(url: RequestInfo | URL, options?: RequestInit): Promise<Response> {
    const token = localStorage.getItem('accessToken');
    const headers = new Headers(options?.headers);
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }
    return window.fetch(url, { ...options, headers });
}

app.configure(restClient.fetch(authFetch));

export const api = {
    pipelines: app.service('/api/v1/pipelines'),
    testcases: app.service('/api/v1/testcases'),
    baselines: app.service('/api/v1/baselines'),
    baselines_pipelines: app.service('/api/v1/baselines/pipelines'),
    baselines_match: app.service('/api/v1/baselines/match'),
    review: app.service('/api/v1/review'),
    users: app.service('/api/v1/users'),
    auth: app.service('/api/v1/auth'),
};

function backendModifiedHook(context: HookContext) {
    watchers.forEach((watcher) => {
        if (watcher.apis.indexOf(context.service) >= 0) {
            watcher.callback();
        }
    });
}

for (const [path, service] of Object.entries(api)) {
    service.hooks({
        after: {
            create: [backendModifiedHook],
            patch: [backendModifiedHook],
            update: [backendModifiedHook],
            remove: [backendModifiedHook],
        },
    });
}

export function onBackendModified(apis: ClientService[], callback: ServiceWatcher) {
    onBeforeMount(() => {
        if (!watchers.find((i) => i.callback === callback)) {
            watchers.push({ apis, callback });
        }
    });
    onBeforeUnmount(() => {
        watchers = watchers.filter((w) => w.callback !== callback);
    });
}
