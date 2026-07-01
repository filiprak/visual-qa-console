<template>
    <div class="p-12 flex justify-center">
        <div class="max-w-[1600px] grow">
            <h1 class="text-5xl font-semibold my-8">Baseline Screenshots</h1>
            <div class="flex gap-3 items-center p-4 text-muted-color">
                <div class="basis-[28px]">#</div>
                <div class="grow">Testcase</div>
                <div class="basis-[200px]">Created</div>
            </div>
            <DataPaginated :service="api.baselines"
                           sort-field="group"
                           :sort-order="-1">
                <template #list="{ items }">
                    <div class="mb-3">
                        <RouterLink v-for="item in items"
                                    class="flex gap-3 items-center p-4 hover:bg-emphasis hover:text-color-emphasis border-b border-surface"
                                    :to="{ path: `/pipelines/${item.id}` }"
                                    :key="item.id">
                            <div class="basis-[28px] flex items-center">
                                <Image :src="item.baseline_url"></Image>
                            </div>
                            <div class="font-semibold grow-1">#{{ item.id }} {{ item.group }} / {{ item.name }}</div>
                            <div class="flex flex-col justify-start items-start basis-[200px]">
                                <span v-tooltip.top="format(item.created_at)">{{ fromNow(item.created_at) }}</span>
                                <span class="text-xs"
                                      v-tooltip.top="format(item.updated_at)">
                                    Last updated: {{ fromNow(item.updated_at) }}
                                </span>
                            </div>
                        </RouterLink>
                    </div>
                </template>
            </DataPaginated>
        </div>
    </div>
</template>
<script setup lang="ts">
import { RouterLink } from 'vue-router';
import vTooltip from 'primevue/tooltip';
import { api } from '../api';
import DataPaginated from '../components/DataPaginated.vue';
import { format, fromNow } from '../utils/dates.ts';
</script>
