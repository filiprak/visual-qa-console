<template>
    <DataView :value="rows"
              lazy
              paginator
              :loading="loading"
              :rows="limit"
              :totalRecords="total"
              :first="offset"
              @page="onPage">
        <template #list="{ items }">
            <slot name="list"
                  :reload="reload"
                  :items="typeItems(items)">
                <div class="mb-3">
                    <div v-for="item in items"
                         class="flex p-4 hover:bg-emphasis hover:text-color-emphasis border-b border-surface">
                        {{ item }}
                    </div>
                </div>
            </slot>
        </template>
        <template #empty>
            <div class="flex justify-center p-6 mb-3">
                <span v-if="loading">Loading...</span>
                <span v-else>No items found</span>
            </div>
        </template>
    </DataView>
</template>

<script setup lang="ts" generic="T">
import type { ClientService, FeathersService } from '@feathersjs/feathers';
import DataView from 'primevue/dataview';
import { computed, onMounted } from 'vue';
import { useDataView } from '../composables/useDataView';

interface Props {
    service: FeathersService<unknown, ClientService<T>>;
    query?: Record<string, unknown>;
    perPage?: number;
    watchApis?: ClientService[];
    sort?: Record<string, 1 | -1>;
}

function typeItems(items: unknown[]): T[] {
    return items as T[];
}

const props = withDefaults(defineProps<Props>(), {
    query: () => ({}),
    watchApis: () => [],
    rows: 30,
});

const { rows, loading, offset, limit, total, onPage, reload } = useDataView({
    service: props.service,
    perPage: props.perPage,
    query: computed(() => props.query),
    watchApis: props.watchApis,
    sort: computed(() => props.sort ?? {}),
});

onMounted(() => {
    reload();
});
</script>
