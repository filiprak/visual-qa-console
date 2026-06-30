<template>
    <div class="p-8">
        <div class="grid grid-cols-4 gap-3">
            <Panel v-for="p in pipelines">
                <template #header>
                    {{ p.name }}
                </template>
                {{ p }}
                <template #footer>
                    <Button @click="updateItem(p)">update</Button>
                </template>
            </Panel>
        </div>
    </div>
</template>
<script setup lang="ts">
import Panel from 'primevue/panel';
import Button from 'primevue/button';
import { api } from '../api';
import { onBeforeMount, ref } from 'vue';
import type { Pipeline } from '@/types';

const pipelines = ref<Pipeline[]>([]);

function updateItem(item: Pipeline) {
    api.pipelines.patch(item.id, { hash: (Math.random() * 10e8).toFixed(0) });
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
