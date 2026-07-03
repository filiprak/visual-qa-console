<template>
    <div class="p-12 flex justify-center">
        <div class="max-w-[1600px] grow">
            <h1 class="text-5xl font-semibold my-8">Baseline Screenshots</h1>
            <div class="mb-3">
                <Tabs v-model:value="pipeline_filter">
                    <TabList>
                        <Tab
                            v-for="p in unique_pipelines"
                            :value="p.pipeline_name"
                        >
                            {{ p.pipeline_name }}
                        </Tab>
                    </TabList>
                </Tabs>
            </div>
            <div class="flex gap-3 items-center p-4 text-muted-color">
                <div class="basis-[50px]">Prev.</div>
                <div class="grow">Name</div>
                <div class="basis-[200px]">Created</div>
                <div class="basis-[200px]">Actions</div>
            </div>

            <DataPaginated
                v-if="pipeline_filter"
                :service="api.baselines"
                :query="{ pipeline_name: pipeline_filter }"
                sort-field="group"
                :sort-order="-1"
            >
                <template #list="{ items }">
                    <div
                        class="mb-3"
                        v-for="entry in groupBaselines(items)"
                    >
                        <div class="flex items-center gap-3 p-3 font-semibold text-primary">
                            <Icon name="bookmark"></Icon>
                            {{ entry[0] }}
                        </div>
                        <div
                            v-for="item in entry[1]"
                            class="flex gap-3 cursor-pointer items-center px-3 py-2 hover:bg-emphasis hover:text-color-emphasis border-t border-surface"
                            @click="
                                openImages([
                                    {
                                        src: item.baseline_img!,
                                        title: [item.pipeline_name, item.group, item.name].join(' / '),
                                    },
                                ])
                            "
                            :key="item.id"
                        >
                            <div class="basis-[50px] flex items-center">
                                <img
                                    :src="item.baseline_img"
                                    class="size-[50px] object-contain border border-surface"
                                />
                            </div>
                            <div class="grow-1">
                                <div>{{ item.name }}</div>
                                <div class="text-muted-color text-sm">hash: {{ item.slug }}</div>
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
                            <div class="flex flex-col justify-start items-start basis-[200px]">
                                <LoadingButton
                                    icon-only
                                    icon="trash"
                                    severity="danger"
                                    @click.stop.prevent="onRemove(item)"
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
import type { Baseline, BaselinePipeline } from '@/types';
import { useImageView } from '../composables/useImageView.ts';
import { computed, onBeforeMount, ref } from 'vue';

const { openImages } = useImageView();

const unique_pipelines = ref<BaselinePipeline[]>([]);
const pipeline_filter = ref<string>('');

function groupBaselines(items: Baseline[]) {
    const by_group: Map<string, Baseline[]> = new Map();

    items.forEach((i) => {
        const group = i.group || 'default';
        if (!by_group.has(group)) {
            by_group.set(group, []);
        }
        by_group.get(group)?.push(i);
    });

    return [...by_group.entries()];
}

async function onRemove(item: Baseline) {
    if (!confirm()) return;
    await api.baselines.remove(item.id);
}

onBeforeMount(async () => {
    unique_pipelines.value = await api.baselines_pipelines.find();
    pipeline_filter.value = unique_pipelines.value.at(0)?.pipeline_name || '';
});
</script>
