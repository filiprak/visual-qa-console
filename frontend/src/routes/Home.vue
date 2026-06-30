<template>
    <div class="p-12 flex justify-center">
        <div class="max-w-[1600px] grow">
            <h1 class="text-5xl font-semibold my-8">Pipelines</h1>
            <DataPaginated :service="api.pipelines">
                <template #list="{ items }">
                    <div>
                        <div v-for="item in items"
                             class="p-4 border-b border-b-gray-200"
                             :key="item.id">
                            {{ item }}
                        </div>
                    </div>
                </template>
            </DataPaginated>
        </div>
    </div>
</template>
<script setup lang="ts">
import Panel from 'primevue/panel';
import Button from 'primevue/button';
import { api } from '../api';
import DataPaginated from '../components/DataPaginated.vue';
</script>
