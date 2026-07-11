<template>
    <div class="p-12 flex justify-center">
        <div class="max-w-[1600px] grow">
            <div class="my-8">
                <h1 class="text-5xl font-semibold">Baseline screenshots</h1>
                <p class="text-muted-color mt-2">
                    Reference images used for visual comparison and regression validation
                </p>
            </div>
            <div v-if="unique_pipelines.length"
                 class="flex justify-between items-stretch w-full bg-surface-0 dark:bg-surface-900">
                <Tabs v-model:value="pipeline_filter"
                      class="grow">
                    <TabList>
                        <Tab v-for="p in unique_pipelines"
                             :value="p.pipeline_name">
                            {{ p.pipeline_name }}
                        </Tab>
                    </TabList>
                </Tabs>
                <div class="px-3 border-b border-surface">
                    <div class="flex items-center h-full">
                        <IconField>
                            <InputIcon>
                                <Icon name="search" />
                            </InputIcon>
                            <InputText v-model="text_filter"
                                       type="text"
                                       fluid
                                       placeholder="Search by suite name" />
                        </IconField>
                    </div>
                </div>
            </div>
            <div class="flex gap-3 items-center p-4 text-muted-color">
                <div class="basis-[50px]">Prev.</div>
                <div class="grow">Name</div>
                <div class="basis-[200px]">Created</div>
                <div class="basis-[200px]">Actions</div>
            </div>

            <DataPaginated v-if="pipeline_filter || unique_pipelines.length < 1"
                           :service="api.baselines"
                           :query="{ pipeline_name: pipeline_filter, group: { $like: `%${text_filter_d}%` } }"
                           :sort="{ group: 1, id: 1 }">
                <template #list="{ items }">
                    <div class="mb-3"
                         v-for="entry in groupBaselines(items)">
                        <div class="flex items-center gap-3 p-3 font-semibold text-primary">
                            <Icon name="bookmark"></Icon>
                            {{ entry[0] }}
                        </div>
                        <div v-for="(item, item_idx) in entry[1]"
                             class="flex gap-3 cursor-pointer items-center px-3 py-2 hover:bg-emphasis hover:text-color-emphasis border-t border-surface"
                             @click="
                                openImages(entry[1].map(i => ({
                                    src: i.baseline_img!,
                                    title: [i.pipeline_name, i.group, i.name].join(' / '),
                                })), item_idx)
                                "
                             :key="item.id">
                            <div class="basis-[50px] flex items-center">
                                <img :src="item.baseline_img"
                                     class="size-[50px] object-contain bg-surface-200 dark:bg-surface-800" />
                            </div>
                            <div class="grow-1">
                                <div>{{ item.name }}</div>
                                <div class="text-muted-color text-sm">hash: {{ item.unique_key }}</div>
                            </div>
                            <div class="flex flex-col justify-start items-start basis-[200px]">
                                <span v-tooltip.top="format(item.created_at)">{{ fromNow(item.created_at) }}</span>
                                <span class="text-xs"
                                      v-tooltip.top="format(item.updated_at)">
                                    Last updated: {{ fromNow(item.updated_at) }}
                                </span>
                            </div>
                            <div class="flex flex-col justify-start items-start basis-[200px]">
                                <LoadingButton icon-only
                                               class="size-9"
                                               icon="trash"
                                               variant="outlined"
                                               severity="danger"
                                               @click.stop.prevent="onRemove(item)">
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
import { onBeforeMount, ref } from 'vue';
import { useDialog } from '../composables/useDialog';
import { useDebounce } from '../composables/useDebounce';

const { openImages } = useImageView();
const { confirmDialog } = useDialog();

const unique_pipelines = ref<BaselinePipeline[]>([]);
const pipeline_filter = ref<string>('');
const text_filter = ref<string>('');
const text_filter_d = useDebounce(text_filter);

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
    if (
        !(await confirmDialog({
            message: 'Do you want to remove baseline screenshot?',
            acceptLabel: 'Remove',
            severity: 'danger',
        })).confirmed
    )
        return;
    await api.baselines.remove(item.id);
}

onBeforeMount(async () => {
    unique_pipelines.value = await api.baselines_pipelines.find();
    pipeline_filter.value = unique_pipelines.value.at(0)?.pipeline_name || '';
});
</script>
