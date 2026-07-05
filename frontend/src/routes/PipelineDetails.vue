<template>
    <div class="p-12 flex justify-center">
        <div class="max-w-[1600px] grow">
            <h1 class="text-5xl font-semibold mt-8 mb-2">
                Pipeline
                <span class="text-primary-600">#{{ pipeline?.id }} {{ pipeline?.name }}</span>
            </h1>
            <div class="mb-6 text-muted-color">
                Commit <Tag severity="warn">{{ pipeline?.commit_sha }}</Tag>
                on branch <span class="font-bold">{{ pipeline?.branch_name }}</span>
            </div>
            <div class="grid grid-cols-4 gap-3 mb-6">
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
                <Panel header="Test suites">
                    {{ pipeline?.details.groups }}
                </Panel>
                <Panel header="Total tests">
                    {{ pipeline?.details.total }}
                </Panel>
                <Panel header="Failed tests">
                    {{ pipeline?.details.failed }}
                </Panel>
            </div>
            <div v-if="pipeline">
                <div class="flex justify-between items-stretch w-full bg-surface-0 dark:bg-surface-900">
                    <Tabs v-model:value="status_filter"
                          class="grow">
                        <TabList>
                            <Tab v-for="s in tabs_opts"
                                 :value="s.value">
                                {{ s.label }}
                                <Badge v-if="s.count"
                                       size="small"
                                       severity="secondary">
                                    {{ s.count }}
                                </Badge>
                            </Tab>
                        </TabList>
                    </Tabs>
                    <div class="px-3 border-b border-surface">
                        <div class="flex gap-3 items-center h-full">
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
                <div class="flex gap-3 items-center p-3 text-muted-color group h-[52px]">
                    <template v-if="!batch_mode">
                        <div class="basis-[28px]">#</div>
                        <div class="grow-1">Testcase name</div>
                        <div class="basis-[200px]">Status</div>
                        <div class="basis-[200px]">Last updated</div>
                        <div class="basis-[200px]">Actions</div>
                    </template>
                    <template v-else>
                        <div class="grow-1 flex justify-between gap-3">
                            <div>{{ selected.length }} item(s) selected</div>
                            <div class="flex gap-5 items-center">
                                <div><span class="text-primary-600 hover:text-primary-900 cursor-pointer"
                                          @click="cancelBatch">Cancel</span></div>
                                <div v-if="batch_mode">
                                    <Button size="small"
                                            :disabled="selected.length < 1"
                                            @click="onBatchAccept">
                                        Batch accept ({{ selected.length }})
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </template>
                    <div class="basis-[30px] flex items-center gap-4 justify-end">
                        <AllCheckbox class="group-hover:opacity-100 outline-2 outline-primary-400"
                                     size="large"
                                     :class="{ 'opacity-0': !batch_mode }">
                        </AllCheckbox>
                    </div>
                </div>
                <div class="testcases-view bg-white dark:bg-surface-900 mb-3">
                    <div class="mb-3"
                         v-for="entry in groupTestcases(rows)">
                        <div class="flex items-center justify-between gap-3 p-3 group">
                            <div class="flex items-center gap-3 font-semibold text-primary">
                                <Icon name="bookmark"></Icon>
                                {{ entry[0] }}
                            </div>
                            <div class="group-hover:opacity-100"
                                 :class="{ 'opacity-0': !batch_mode }">
                                <GroupCheckbox :group="entry[0]"
                                               size="large"
                                               class="outline-2 outline-primary-400" />
                            </div>
                        </div>
                        <div v-for="item in entry[1]"
                             class="flex cursor-pointer h-13 gap-3 items-center px-3 py-2 hover:bg-emphasis hover:text-color-emphasis border-t border-surface group"
                             @click="batch_mode ? toggleItem(item.id) : openTestcase(item.id)"
                             :key="item.id">
                            <div class="basis-10 flex items-center">
                                <img :src="item.result_img"
                                     :class="[item.status == 'failed' ? 'border-red-600' : 'border-surface']"
                                     class="block size-10 object-contain border" />
                            </div>
                            <div class="grow-1"
                                 :class="{ 'text-red-600': item.status == 'failed' }">
                                {{ item.name }}
                            </div>
                            <div class="basis-[200px] flex gap-2 items-center">
                                <TestStatus :status="item.status"
                                            v-tooltip="item.failed_msg" />
                                <Icon v-if="item.accepted_at"
                                      v-tooltip.top="`Accepted at: ${format(item.accepted_at)}`"
                                      class="text-green-700"
                                      name="user">
                                </Icon>
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
                                               @click.stop.prevent="onAcceptTestcase(item)">
                                    Accept
                                </LoadingButton>
                            </div>
                            <div class="flex flex-col justify-end items-end basis-[30px] group-hover:opacity-100"
                                 :class="{ 'opacity-0': !batch_mode }">
                                <ItemCheckbox :value="item.id"
                                              class="outline-2 outline-surface-200"
                                              @click.stop="() => null"
                                              size="large">
                                </ItemCheckbox>
                            </div>
                        </div>
                    </div>
                    <div v-if="loading">
                        <div class="flex justify-center p-6 mb-3">
                            <span>Loading...</span>
                        </div>
                    </div>
                    <div v-else-if="rows.length < 1">
                        <div class="flex justify-center p-6 mb-3">
                            <span>No items found</span>
                        </div>
                    </div>
                </div>
                <div>
                    <Paginator v-model:first="offset"
                               v-model:rows="limit"
                               :total-records="total"
                               @page="onPage">
                    </Paginator>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import Panel from 'primevue/panel';
import vTooltip from 'primevue/tooltip';
import Icon from '../components/Icon.vue';
import Tag from 'primevue/tag';
import { computed, nextTick, onBeforeMount, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import type { Pipeline, TestCase } from '@/types';
import { api } from '../api';
import { format, fromNow } from '../utils/dates.ts';
import { useTestcaseView } from '../composables/useTestcaseView.ts';
import { useReview } from '../composables/useReview.ts';
import { onBackendModified } from '../api/api.ts';
import TestStatus from '../components/TestStatus.vue';
import { testcaseStatusOpts } from '../utils/statuses';
import { useDebounce } from '../composables/useDebounce';
import { useBatchCheckbox } from '../composables/useBatchCheckbox.ts';
import { useDataView } from '../composables/useDataView.ts';

const route = useRoute();
const pipeline = ref<Pipeline>();
const status_filter = ref<string>('all');
const text_filter = ref<string>('');
const text_filter_d = useDebounce(text_filter);
const batch_mode = ref(false);

const query = computed(() => ({
    pipeline_id: route.params.id,
    status: status_filter.value !== 'all' ? status_filter.value : undefined,
    group: { $like: `%${text_filter_d.value}%` },
}));
const sortField = ref('group');
const sortOrder = ref<1 | -1>(1);

const { rows, loading, total, limit, offset, onPage, reload } = useDataView<TestCase>({
    service: api.testcases,
    query,
    perPage: 30,
    sortField,
    sortOrder,
});

const { selected,
    AllCheckbox,
    GroupCheckbox,
    ItemCheckbox,
    toggleItem,
} = useBatchCheckbox(rows);
const { openTestcase } = useTestcaseView();
const { acceptTestcase, loading: accepting } = useReview();

const tabs_opts = computed(() => {
    const details = pipeline.value?.details || {};
    return [
        { value: 'all', label: 'All tests', count: pipeline.value?.details.total },
        ...testcaseStatusOpts.map((i) => ({
            ...i,
            count: details[i.value as keyof typeof details],
        })),
    ];
});

function cancelBatch() {
    selected.value = [];
    nextTick(() => { batch_mode.value = false; });
}

async function onBatchAccept() {
    await acceptTestcase(selected.value);
    selected.value = [];
    nextTick(() => { batch_mode.value = false; });
}

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

async function onAcceptTestcase(item: TestCase) {
    await acceptTestcase([item.id]);
}

async function load() {
    pipeline.value = await api.pipelines.get(route.params.id as string);
    reload();
}

watch(selected, () => {
    batch_mode.value = true;
});

onBackendModified([api.review], async () => {
    await load();
});
onBeforeMount(load);
</script>
