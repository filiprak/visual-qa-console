import { feathers, type ClientService, type HookContext } from '@feathersjs/feathers';
import rest from '@feathersjs/rest-client';
import type { ServiceTypes } from './services';
import { onBeforeMount, onBeforeUnmount, watch } from 'vue';

export type ServiceWatcher = () => void | Promise<void>;

const app = feathers<ServiceTypes>();
const restClient = rest();

let watchers: { apis: ClientService[]; callback: ServiceWatcher }[] = [];

app.configure(restClient.fetch(window.fetch.bind(window)));

export const api = {
    pipelines: app.service('/api/v1/pipelines'),
    testcases: app.service('/api/v1/testcases'),
    baselines: app.service('/api/v1/baselines'),
    baselines_pipelines: app.service('/api/v1/baselines/pipelines'),
    baselines_match: app.service('/api/v1/baselines/match'),
    review: app.service('/api/v1/review'),
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
