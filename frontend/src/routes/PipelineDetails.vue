<template>
    <div class="p-12 flex justify-center">
        <div class="max-w-[1600px] grow">
            <h1 class="text-5xl font-semibold my-8">Pipeline #{{ pipeline?.id }} {{ pipeline?.name }}</h1>
            <div class="grid grid-cols-4 gap-3 mb-6">
                <Panel header="Test suites">
                    {{ pipeline?.details.groups }}
                </Panel>
                <Panel header="Total tests">
                    {{ pipeline?.details.total }}
                </Panel>
                <Panel header="Failed tests">
                    {{ pipeline?.details.failed }}
                </Panel>
                <Panel header="Status">
                    <Tag v-if="pipeline?.details.status == 'passed'"
                         severity="success">
                        <Icon name="check-circle"> </Icon>
                        Passed
                    </Tag>
                    <Tag v-else
                         severity="danger">
                        <Icon name="times-circle"></Icon>
                        Failed
                    </Tag>
                </Panel>
            </div>
            <div v-if="pipeline">
                <div class="flex gap-3 items-center p-4 text-muted-color">
                    <div class="basis-[28px]">#</div>
                    <div class="grow-1">Testcase name</div>
                    <div class="basis-[200px]">Status</div>
                    <div class="basis-[200px]">Last updated</div>
                    <div class="basis-[200px]">Actions</div>
                </div>
                <DataPaginated :service="api.testcases"
                               :query="{ pipeline_id: pipeline.id }"
                               sort-field="group"
                               :sort-order="1">
                    <template #list="{ items, reload }">
                        <div>
                            <div class="mb-3"
                                 v-for="entry in groupTestcases(items)">
                                <div class="flex items-center gap-3 p-3 font-bold text-primary">
                                    {{ entry[0] }}
                                </div>
                                <div v-for="item in entry[1]"
                                     class="flex cursor-pointer h-13 gap-3 items-center px-4 py-2 hover:bg-emphasis hover:text-color-emphasis border-b border-surface"
                                     @click="openTestcase(item.id)"
                                     :key="item.id">
                                    <div class="basis-10 flex items-center">
                                        <img :src="item.result_img"
                                             class="block size-10 object-contain border border-surface">
                                    </div>
                                    <div class="font-semibold grow-1">{{ item.name }}</div>
                                    <div class="basis-[200px]">
                                        <Tag v-if="item.status == 'passed'"
                                             severity="success">
                                            <Icon name="check"> </Icon>
                                            Passed
                                        </Tag>
                                        <Tag v-else
                                             severity="danger">
                                            <Icon name="times"></Icon>
                                            Failed
                                        </Tag>
                                    </div>
                                    <div class="flex flex-col justify-start items-start basis-[200px]">
                                        <span v-tooltip.top="format(item.updated_at)">{{
                                            fromNow(item.updated_at)
                                        }}</span>
                                    </div>
                                    <div class="flex gap-2 justify-start items-start basis-[200px]">
                                        <LoadingButton v-if="item.status == 'failed'"
                                                       size="small"
                                                       icon="eye"
                                                       severity="secondary"
                                                       :loading="accepting"
                                                       @click.stop.prevent="openTestcase(item.id)">
                                            Review
                                        </LoadingButton>
                                        <LoadingButton v-if="item.status == 'failed'"
                                                       size="small"
                                                       icon="check"
                                                       severity="success"
                                                       :loading="accepting"
                                                       @click.stop.prevent="onAcceptTestcase(item, reload)">
                                            Accept
                                        </LoadingButton>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </template>
                </DataPaginated>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import Panel from 'primevue/panel';
import vTooltip from 'primevue/tooltip';
import Icon from '../components/Icon.vue';
import Tag from 'primevue/tag';
import Button from 'primevue/button';
import DataPaginated from '../components/DataPaginated.vue';
import { onBeforeMount, ref } from 'vue';
import { useRoute } from 'vue-router';
import type { Pipeline, TestCase } from '@/types';
import { api } from '../api';
import { format, fromNow } from '../utils/dates.ts';
import { useTestcaseView } from '../composables/useTestcaseView.ts';
import { useReview } from '../composables/useReview.ts';

const route = useRoute();
const pipeline = ref<Pipeline>();
const { openTestcase } = useTestcaseView();
const { acceptTestcase, loading: accepting } = useReview();

function groupTestcases(items: TestCase[]) {
    const by_group: Map<string, TestCase[]> = new Map();

    items.forEach((i) => {
        const group = i.group || 'default';
        if (!by_group.has(group)) {
            by_group.set(group, []);
        }
        by_group.get(group)?.push(i);
    });

    return [...by_group.entries()];
}

async function onAcceptTestcase(item: TestCase, reloadTestcases: () => Promise<void>) {
    await acceptTestcase(item.id);
    await load();
    await reloadTestcases();
}

async function load() {
    pipeline.value = await api.pipelines.get(route.params.id as string);
}

onBeforeMount(load);
</script>
