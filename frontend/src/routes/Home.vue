<template>
    <div class="p-8 flex justify-center">
        <div class="max-w-[1600px] grow">
            <h1 class="text-5xl font-semibold my-8">Pipelines</h1>
            <DataPaginated :service="api.pipelines">
                <template #list="{ items }">
                    <div
                        v-for="item in items"
                        class="p-4"
                        :key="item.id"
                    >
                        {{ item }}
                    </div>
                </template>
            </DataPaginated>
        </div>
    </div>
</template>
<script setup lang="ts">
import Panel from 'primevue/panel';
import Button from 'primevue/button';
import Column from 'primevue/column';
import { api } from '../api';
import { onBeforeMount, ref } from 'vue';
import type { Pipeline } from '@/types';
import DataPaginated from '../components/DataPaginated.vue';

const pipelines = ref<Pipeline[]>([]);

function updateItem(item: Pipeline) {
    api.pipelines.patch(item.id, { commit_sha: (Math.random() * 10e8).toFixed(0) });
}

onBeforeMount(async () => {
    pipelines.value = (
        await api.pipelines.find({
            query: {
                $sort: {
                    name: -1,
                },
            },
        })
    ).data;
});
</script>
