import type { ClientService, FeathersService } from '@feathersjs/feathers';
import { ref, watch, onMounted, type Ref } from 'vue';
import { onBackendModified } from '../api/api';

interface Params<T> {
    service: FeathersService<unknown, ClientService<T>>;
    query?: Ref<Record<string, unknown>>;
    perPage?: number;
    watchApis?: ClientService[];
    sort?: Ref<Record<string, 1 | -1>>;
}

export function useDataView<T>(params: Params<T>) {
    const rows = ref<T[]>([]);
    const total = ref(0);
    const loading = ref(false);

    const offset = ref(0);
    const rowsPerPage = ref(params.perPage || 30);

    async function load() {
        loading.value = true;

        try {
            const query: any = {
                ...(params.query?.value || {}),
                $limit: rowsPerPage.value,
                $skip: offset.value,
            };

            if (params.sort?.value) {
                query.$sort = {
                    ...params.sort.value,
                };
            }

            const result = await params.service.find({
                query,
            });

            rows.value = result.data;
            total.value = result.total;
        } finally {
            loading.value = false;
        }
    }

    function onPage(event: { first: number, rows: number }) {
        offset.value = event.first;
        rowsPerPage.value = event.rows;
        load();
    }

    async function prevPage() {
        if (offset.value > 0) {
            offset.value = Math.max(offset.value - rowsPerPage.value, 0);
            await load();
            return true;
        } else {
            return false;
        }
    }

    async function nextPage() {
        if (offset.value + rowsPerPage.value < total.value) {
            offset.value += rowsPerPage.value;
            await load();
            return true;
        } else {
            return false;
        }
    }

    watch(() => params.query?.value, load, { deep: true });

    onBackendModified([...(params.watchApis || []), params.service], () => {
        load();
    });

    return {
        rows,
        total,
        offset,
        limit: rowsPerPage,
        count: rows,
        loading,
        onPage,
        nextPage,
        prevPage,
        reload: load,
    };
}