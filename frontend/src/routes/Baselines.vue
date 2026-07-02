<template>
    <div class="p-12 flex justify-center">
        <div class="max-w-[1600px] grow">
            <h1 class="text-5xl font-semibold my-8">Baseline Screenshots</h1>
            <div class="flex gap-3 items-center p-4 text-muted-color">
                <div class="basis-[28px]">#</div>
                <div class="grow">Testcase</div>
                <div class="basis-[200px]">Created</div>
                <div class="basis-[200px]">Actions</div>
            </div>
            <DataPaginated
                :service="api.baselines"
                sort-field="group"
                :sort-order="-1"
            >
                <template #list="{ items, reload }">
                    <div class="mb-3">
                        <div
                            v-for="item in items"
                            class="flex gap-3 cursor-pointer items-center p-4 hover:bg-emphasis hover:text-color-emphasis border-b border-surface"
                            @click="
                                openImages([
                                    { src: item.baseline_img, title: [item.group, item.name].join(' / ') },
                                    { src: item.baseline_img, title: [item.group, item.name].join(' / ') },
                                    { src: item.baseline_img, title: [item.group, item.name].join(' / ') },
                                ])
                            "
                            :key="item.id"
                        >
                            <div class="basis-[50px] flex items-center">
                                <img
                                    :src="item.baseline_img"
                                    class="size-[50px] object-cover"
                                />
                            </div>
                            <div class="font-semibold grow-1">{{ item.group }} / {{ item.name }}</div>
                            <div class="flex flex-col justify-start items-start basis-[200px]">
                                <span v-tooltip.top="format(item.created_at)">{{ fromNow(item.created_at) }}</span>
                                <span
                                    class="text-xs"
                                    v-tooltip.top="format(item.updated_at)"
                                >
                                    Last updated: {{ fromNow(item.updated_at) }}
                                </span>
                            </div>
                            <div class="flex flex-col justify-start items-start basis-[200px]">
                                <LoadingButton
                                    size="small"
                                    icon-only
                                    icon="trash"
                                    rounded
                                    severity="danger"
                                    outlined
                                    @click.stop.prevent="onRemove(item, reload)"
                                >
                                </LoadingButton>
                            </div>
                        </div>
                    </div>
                </template>
            </DataPaginated>
        </div>
    </div>
</template>
<script setup lang="ts">
import vTooltip from 'primevue/tooltip';
import { api } from '../api';
import DataPaginated from '../components/DataPaginated.vue';
import { format, fromNow } from '../utils/dates.ts';
import type { Baseline } from '@/types';
import { useImageView } from '../composables/useImageView.ts';

const { openImages } = useImageView();

async function onRemove(item: Baseline, reload: () => Promise<void>) {
    if (!confirm()) return;
    await api.baselines.remove(item.id);
    await reload();
}
</script>
