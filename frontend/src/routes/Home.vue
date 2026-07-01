<template>
    <div class="p-12 flex justify-center">
        <div class="max-w-[1600px] grow">
            <h1 class="text-5xl font-semibold my-8">Pipelines</h1>
            <div class="flex gap-3 items-center p-4 text-muted-color">
                <div class="basis-[28px]">#</div>
                <div class="grow-1">Name</div>
                <div class="basis-[200px]">Branch</div>
                <div class="basis-[200px]">Commit SHA</div>
                <div class="basis-[200px]">Tests</div>
                <div class="basis-[200px]">Created</div>
            </div>
            <DataPaginated
                :service="api.pipelines"
                sort-field="created_at"
                :sort-order="-1"
            >
                <template #list="{ items }">
                    <div class="mb-3">
                        <RouterLink
                            v-for="item in items"
                            class="flex gap-3 items-center p-4 hover:bg-emphasis hover:text-color-emphasis border-b border-surface"
                            :to="{ path: `/pipelines/${item.id}` }"
                            :key="item.id"
                        >
                            <div class="basis-[28px] flex items-center">
                                <Icon
                                    v-if="item.details.status == 'passed'"
                                    name="check-circle"
                                    size="1.4rem"
                                    class="text-green-600"
                                >
                                </Icon>
                                <Icon
                                    v-else
                                    name="times-circle"
                                    size="1.4rem"
                                    class="text-red-600"
                                >
                                </Icon>
                            </div>
                            <div class="font-semibold grow-1">#{{ item.id }} {{ item.name }}</div>
                            <div class="basis-[200px]">
                                {{ item.branch_name }}
                            </div>
                            <div class="basis-[200px]">
                                <Tag severity="secondary">
                                    {{ item.commit_sha }}
                                </Tag>
                            </div>
                            <div class="flex flex-col justify-start items-start basis-[200px]">
                                <span>Total: {{ item.details.total }}</span>
                                <span
                                    class="text-xs text-yellow-600"
                                    v-if="item.details.failed"
                                >
                                    <Icon name="exclamation-triangle" /> Failed tests: {{ item.details.failed }}
                                </span>
                                <span
                                    class="text-xs"
                                    v-else
                                >
                                    All passed!
                                </span>
                            </div>
                            <div class="flex flex-col justify-start items-start basis-[200px]">
                                <span v-tooltip.top="format(item.created_at)">{{ fromNow(item.created_at) }}</span>
                                <span
                                    class="text-xs"
                                    v-tooltip.top="format(item.updated_at)"
                                >
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
import Tag from 'primevue/tag';
import Button from 'primevue/button';
import { api } from '../api';
import DataPaginated from '../components/DataPaginated.vue';
import { format, fromNow } from '../utils/dates.ts';
import Icon from '../components/Icon.vue';
</script>
