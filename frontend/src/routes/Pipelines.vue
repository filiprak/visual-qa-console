<template>
    <div class="p-12 flex justify-center">
        <div class="max-w-[1600px] grow">
            <div class="my-8">
                <h1 class="text-5xl font-semibold">Pipelines</h1>
                <p class="text-muted-color mt-2">
                    Track automated screenshot comparisons and regression test runs
                </p>
            </div>
            <div class="flex gap-3 items-center p-4 text-muted-color">
                <div class="basis-[28px]">#</div>
                <div class="grow-1">Name</div>
                <div class="basis-[200px]">Branch</div>
                <div class="basis-[200px]">Commit SHA</div>
                <div class="basis-[300px]">Summary</div>
                <div class="basis-[200px]">Created</div>
            </div>
            <DataPaginated :service="api.pipelines"
                           :sort="{ created_at: -1 }">
                <template #list="{ items }">
                    <div class="mb-3">
                        <RouterLink v-for="item in items"
                                    class="flex gap-3 items-center p-4 hover:bg-emphasis hover:text-color-emphasis border-b border-surface"
                                    :to="{ path: `/pipelines/${item.id}` }"
                                    :key="item.id">
                            <div class="basis-[28px] flex items-center">
                                <Icon v-if="item.details.status == 'passed'"
                                      name="check-circle"
                                      size="1.4rem"
                                      class="text-green-600">
                                </Icon>
                                <Icon v-else
                                      name="times-circle"
                                      size="1.4rem"
                                      class="text-red-600">
                                </Icon>
                            </div>
                            <div class="font-semibold grow-1">#{{ item.id }} {{ item.name }}</div>
                            <div class="basis-[200px]">
                                {{ item.branch_name }}
                            </div>
                            <div class="basis-[200px]">
                                <Tag severity="warn">
                                    {{ item.commit_sha }}
                                </Tag>
                            </div>
                            <div class="flex font-semibold flex-col justify-start items-start basis-[300px]">
                                <span class="font-normal">{{ item.details.total }} (total)</span>
                                <span class="inline-flex gap-3 mt-1" v-if="item.details.failed || item.details.new || item.details.reported">
                                    <span class="text-xs text-red-600"
                                          v-if="item.details.failed">
                                        <Icon name="exclamation-triangle"
                                              size="0.7rem" /> Failed: {{ item.details.failed }}
                                    </span>
                                    <span class="text-xs text-blue-400"
                                          v-if="item.details.new">
                                        <Icon name="plus"
                                              size="0.7rem" /> New: {{ item.details.new }}
                                    </span>
                                    <span class="text-xs text-orange-400"
                                          v-if="item.details.reported">
                                        <Icon name="info-circle"
                                              size="0.7rem" /> Reported: {{ item.details.reported }}
                                    </span>
                                </span>
                                <span class="text-xs text-green-400"
                                      v-else>
                                    All passed!
                                </span>
                            </div>
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
import Tag from 'primevue/tag';
import { api } from '../api';
import DataPaginated from '../components/DataPaginated.vue';
import { format, fromNow } from '../utils/dates.ts';
import Icon from '../components/Icon.vue';
</script>
