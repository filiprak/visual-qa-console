<template>
    <div class="p-12 flex justify-center">
        <div class="max-w-[1600px] grow">
            <h1 class="text-5xl font-semibold my-8">Pipelines</h1>
            <DataPaginated :service="api.pipelines">
                <template #list="{ items }">
                    <div>
                        <RouterLink
                            v-for="item in items"
                            class="flex p-4 border-b border-b-gray-200 hover:bg-primary-50"
                            :to="{ path: `/pipelines/${item.id}` }"
                            :key="item.id"
                        >
                            {{ item }}
                        </RouterLink>
                    </div>
                </template>
            </DataPaginated>
        </div>
    </div>
</template>
<script setup lang="ts">
import { RouterLink } from 'vue-router';
import Panel from 'primevue/panel';
import Button from 'primevue/button';
import { api } from '../api';
import DataPaginated from '../components/DataPaginated.vue';
</script>
