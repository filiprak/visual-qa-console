<template>
    <div class="p-12 flex justify-center">
        <div class="max-w-[1600px] grow">
            <h1 class="text-5xl font-semibold my-8">Pipelines</h1>
            <DataPaginated :service="api.pipelines">
                <template #list="{ items }">
                    <div class="min-h-200">
                        <RouterLink
                            v-for="item in items"
                            class="flex gap-3 items-center p-4 hover:bg-emphasis hover:text-color-emphasis border-b border-surface"
                            :to="{ path: `/pipelines/${item.id}` }"
                            :key="item.id"
                        >
                            <div class="shrink-0 grow-0 flex items-center">
                                <Icon
                                    name="check-circle"
                                    size="1.3rem"
                                    class="text-green-500"
                                >
                                </Icon>
                            </div>
                            <div class="basis-[200px]">#{{ item.id }} {{ item.name }}</div>
                            <div class="basis-[200px]">
                                <Tag severity="secondary">
                                    {{ item.commit_sha }}
                                </Tag>
                            </div>
                            <div class="basis-[200px]">
                                <Tag severity="secondary">
                                    {{ item.branch_name }}
                                </Tag>
                            </div>
                            <div class="basis-[200px]">
                                <span v-tooltip.top="format(item.created_at)">{{ fromNow(item.created_at) }}</span>
                            </div>
                            <div class="basis-[200px]">
                                <span v-tooltip.top="format(item.updated_at)">{{ fromNow(item.updated_at) }}</span>
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
import Panel from 'primevue/panel';
import vTooltip from 'primevue/tooltip';
import Tag from 'primevue/tag';
import Button from 'primevue/button';
import { api } from '../api';
import DataPaginated from '../components/DataPaginated.vue';
import { format, fromNow } from '../utils/dates.ts';
import Icon from '../components/Icon.vue';
</script>
