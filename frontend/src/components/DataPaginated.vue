<template>
    <DataView :value="rows"
              lazy
              paginator
              :loading="loading"
              :rows="rowsPerPage"
              :totalRecords="total"
              :first="first"
              :sortField="sortField"
              :sortOrder="sortOrder"
              @page="onPage">
        <template #list="{ items }">
            <slot name="list"
                  :reload="load"
                  :items="typeItems(items)">
                <div class="mb-3"
                     v-if="items.length > 0">
                    <div v-for="item in items"
                         class="flex p-4 hover:bg-emphasis hover:text-color-emphasis border-b border-surface">
                        {{ item }}
                    </div>
                </div>
                <div v-else>asds</div>
            </slot>
        </template>
        <template #empty>
            <div class="flex justify-center p-6 mb-3">
                <span>No items found</span>
            </div>
        </template>
    </DataView>
</template>

<script setup lang="ts" generic="T">
import type { ClientService, FeathersService } from '@feathersjs/feathers';
import DataView from 'primevue/dataview';
import { ref, watch, onMounted, resolveComponent } from 'vue';
import { onBackendModified } from '../api/api';

interface Props {
    service: FeathersService<unknown, ClientService<T>>;
    query?: Record<string, unknown>;
    rows?: number;
    watchApis?: ClientService[];
    sortField?: string;
    sortOrder?: number;
}

function typeItems(items: unknown[]): T[] {
    return items as T[];
}

const props = withDefaults(defineProps<Props>(), {
    query: () => ({}),
    watchApis: () => ([]),
    rows: 30,
});

const rows = ref<T[]>([]);
const total = ref(0);
const loading = ref(false);

const first = ref(0);
const rowsPerPage = ref(props.rows);

async function load() {
    loading.value = true;

    try {
        const query: any = {
            ...props.query,
            $limit: rowsPerPage.value,
            $skip: first.value,
        };

        if (props.sortField) {
            query.$sort = {
                [props.sortField]: props.sortOrder === 1 ? 1 : -1,
            };
        }

        const result = await props.service.find({
            query,
        });

        rows.value = result.data;
        total.value = result.total;
    } finally {
        loading.value = false;
    }
}

function onPage(event: any) {
    first.value = event.first;
    rowsPerPage.value = event.rows;
    load();
}

watch(() => props.query, load, { deep: true });

onBackendModified([...props.watchApis, props.service], () => {
    load();
});

onMounted(() => {
    load();
});
</script>
