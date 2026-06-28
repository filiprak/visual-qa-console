<template>
    <div class="p-8">
        <div class="grid grid-cols-4 gap-3">
            <Panel v-for="p in pipelines">
                <template #header>
                    {{ p.name }}
                </template>
                {{ p }}
            </Panel>
        </div>
    </div>
</template>
<script setup lang="ts">
import Panel from 'primevue/panel';
import { api } from '../api';
import { onBeforeMount, ref } from 'vue';
import type { Pipeline } from '@/types';

const pipelines = ref<Pipeline[]>([]);

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
