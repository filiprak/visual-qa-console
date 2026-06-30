<template>
    <div class="p-12 flex justify-center">
        <div class="max-w-[1600px] grow">
            <h1 class="text-5xl font-semibold my-8">Pipeline #{{ pipeline?.id }}</h1>
            <div class="flex mb-6 bg-white dark:bg-black shadow shadow-gray-300 p-6 rounded-md">
                {{ pipeline }}
            </div>
            <div>
                <DataPaginated :service="api.testcases"></DataPaginated>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import Panel from 'primevue/panel';
import Button from 'primevue/button';
import DataPaginated from '../components/DataPaginated.vue';
import { onBeforeMount, ref } from 'vue';
import { useRoute } from 'vue-router';
import type { Pipeline } from '@/types';
import { api } from '../api';

const route = useRoute();
const pipeline = ref<Pipeline>();

onBeforeMount(async () => {
    pipeline.value = await api.pipelines.get(route.params.id as string);
});
</script>
