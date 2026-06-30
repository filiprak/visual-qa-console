<template>
    <DataView
        :value="rows"
        lazy
        paginator
        :loading="loading"
        :rows="rowsPerPage"
        :totalRecords="total"
        :first="first"
        :sortField="sortField"
        :sortOrder="sortOrder"
        @page="onPage"
        @sort="onSort"
    >
        <template #list="{ items }">
            <slot
                name="list"
                :items="typeItems(items)"
            >
            </slot>
        </template>
    </DataView>
</template>

<script setup lang="ts" generic="T">
import type { ClientService, FeathersService, Service } from '@feathersjs/feathers';
import DataView from 'primevue/dataview';
import { ref, watch, onMounted } from 'vue';

interface Props {
    service: FeathersService<unknown, ClientService<T>>;
    query?: Record<string, unknown>;
    rows?: number;
}

function typeItems(items: unknown[]): T[] {
    return items as T[];
}

const props = withDefaults(defineProps<Props>(), {
    query: () => ({}),
    rows: 30,
});

const rows = ref<T[]>([]);
const total = ref(0);
const loading = ref(false);

const first = ref(0);
const rowsPerPage = ref(props.rows);

const sortField = ref<string>();
const sortOrder = ref<number>();

async function load() {
    loading.value = true;

    try {
        const query: any = {
            ...props.query,
            $limit: rowsPerPage.value,
            $skip: first.value,
        };

        if (sortField.value) {
            query.$sort = {
                [sortField.value]: sortOrder.value === 1 ? 1 : -1,
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

function onSort(event: any) {
    sortField.value = event.sortField;
    sortOrder.value = event.sortOrder;
    load();
}

watch(() => props.query, load, { deep: true });

onMounted(load);
</script>
