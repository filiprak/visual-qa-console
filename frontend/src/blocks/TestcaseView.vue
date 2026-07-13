<template>
    <div class="flex justify-center">
        <Drawer v-model:visible="visible"
                :show-close-icon="false"
                block-scroll
                class="test-drawer no-transition"
                position="full">
            <template #header>
                <template v-if="!loading && testcase">
                    <div class="flex items-center gap-3">
                        <Button icon="pi pi-chevron-left"
                                severity="secondary"
                                @click="visible = false">
                        </Button>
                        <div class="text-xl font-semibold">
                            <span class="text-primary">{{ testcase?.group }}</span> /
                            <span>{{ testcase?.name }}</span>
                        </div>
                        <div class="flex items-center cursor-pointer"
                             @click="onErrorDetails">
                            <TestStatus :status="testcase.status" />
                            <span v-if="testcase.status == 'failed' && testcase.failed_msg"
                                  class="text-red-700 hover:text-red-600 font-semibold ml-3 inline-block whitespace-nowrap max-w-150 overflow-hidden text-ellipsis">
                                {{ testcase.failed_msg }}
                            </span>
                        </div>
                    </div>
                    <div class="flex gap-3">
                        <Button v-if="options?.prevId"
                                @click="onPrevClick"
                                severity="secondary">
                            <Icon name="chevron-left"></Icon>
                        </Button>
                        <Button v-if="options?.nextId"
                                @click="onNextClick"
                                severity="secondary">
                            <Icon name="chevron-right"></Icon>
                        </Button>
                        <Button @click="visible = false"
                                severity="secondary">
                            <Icon name="times"></Icon>
                            Exit
                        </Button>
                        <Button v-if="testcase?.status == 'failed'"
                                severity="secondary">
                            <Icon name="flag"></Icon>
                            Report issue
                        </Button>
                        <LoadingButton v-if="testcase?.status == 'failed' || !baseline"
                                       @click="onAccept"
                                       severity="success">
                            <Icon name="check"></Icon>
                            Accept
                        </LoadingButton>
                    </div>
                </template>
                <div v-else
                     class="flex gap-3 w-full items-center">
                    <Button icon="pi pi-chevron-left"
                            size="small"
                            severity="secondary"
                            @click="visible = false">
                    </Button>
                    <Skeleton width="10%"
                              height="20px" />
                </div>
            </template>
            <template v-if="loading || !testcase">
                <div class="flex gap-3 flex-col">
                    <Skeleton width="50%"
                              height="30px" />
                    <Skeleton width="60%"
                              height="30px" />
                    <Skeleton width="30%"
                              height="30px" />
                    <Skeleton width="30%"
                              height="30px" />
                    <Skeleton width="40%"
                              height="30px" />
                </div>
            </template>
            <template v-else>
                <div class="flex justify-center">
                    <div class="samples-container">
                        <div class="flex justify-center mb-4">
                            <SelectButton v-model="view"
                                          :allow-empty="false"
                                          option-label="label"
                                          option-value="value"
                                          :options="view_options">
                                <template #option="{ option }">
                                    <div class="flex flex-col">
                                        <div>
                                            {{ option.label }}
                                        </div>
                                        <div class="text-xs text-muted-color"
                                             v-if="option.info">
                                            {{ formatSize(option.info) }}
                                        </div>
                                    </div>
                                </template>
                            </SelectButton>
                        </div>
                        <div></div>
                        <div class="flex flex-col items-center">
                            <template v-if="view == 'compare'">
                                <div class="screen-container"
                                     v-if="baseline_src && testcase.result_img">
                                    <ImageDiff :before="baseline_src"
                                               :after="testcase.result_img">
                                    </ImageDiff>
                                </div>
                                <div v-else>
                                    <Message severity="error"
                                             icon="pi pi-exclamation-triangle">
                                        Baseline or result screenshot was image not found
                                    </Message>
                                </div>
                            </template>
                            <template v-if="view == 'result'">
                                <div class="screen-container"
                                     v-if="testcase.result_img">
                                    <Sample class="screen"
                                            title="Result"
                                            :src="testcase.result_img" />
                                </div>
                                <div v-else>
                                    <Message severity="error"
                                             icon="pi pi-exclamation-triangle">
                                        Result screenshot image was not found
                                    </Message>
                                </div>
                            </template>
                            <template v-if="view == 'diff'">
                                <div class="screen-container"
                                     v-if="testcase.diff_img">
                                    <Sample class="screen"
                                            title="Diff"
                                            :src="testcase.diff_img" />
                                </div>
                                <div v-else>
                                    <Message severity="error"
                                             icon="pi pi-exclamation-triangle">
                                        Diff screenshot image was not found
                                    </Message>
                                </div>
                            </template>
                            <template v-if="view == 'baseline'">
                                <div class="screen-container"
                                     v-if="baseline_src">
                                    <Sample class="screen"
                                            title="Baseline"
                                            :src="baseline_src" />
                                </div>
                                <div v-else>
                                    <Message severity="error"
                                             icon="pi pi-exclamation-triangle">
                                        Baseline screenshot image was not found
                                    </Message>
                                </div>
                            </template>
                        </div>
                    </div>
                </div>
            </template>
        </Drawer>
    </div>
</template>
<script setup lang="ts">
import Drawer from 'primevue/drawer';
import { useTestcaseView } from '../composables/useTestcaseView.ts';
import type { Baseline, Pipeline, TestCase } from '@/types';
import { computed, h, ref, watch } from 'vue';
import { api } from '../api/api.ts';
import Skeleton from 'primevue/skeleton';
import SelectButton from 'primevue/selectbutton';
import ImageDiff from '../components/ImageDiff.vue';
import Icon from '../components/Icon.vue';
import { useReview } from '../composables/useReview.ts';
import TestStatus from '../components/TestStatus.vue';
import { SampleData, useSample } from '../composables/useSample';
import { useToast } from 'primevue/usetoast';
import { useDialog } from '../composables/useDialog';

function formatSize(info: SampleData) {
    return info.empty ? '? x ?' : `${info.width} x ${info.height}`;
}

const { openDialog } = useDialog();
const toast = useToast();
const hide_diff = computed(() => testcase.value?.status == 'passed' || !baseline.value);
const view_options = computed(() => {
    return [
        { label: 'Compare', value: 'compare', hide: hide_diff.value },
        { label: 'Result', value: 'result', info: result_info.value },
        { label: 'Diff', value: 'diff', hide: hide_diff.value, info: diff_info.value },
        {
            label: 'Baseline' + (baseline.value ? '' : ' ⚠'),
            icon: 'home',
            value: 'baseline',
            info: baseline_info.value,
        },
    ].filter((i) => !i.hide);
});

const testcase = ref<TestCase>();
const pipeline = ref<Pipeline>();
const baseline = ref<Baseline>();
const baseline_src = computed(() => baseline.value?.baseline_img);

const result_info = useSample(() => testcase.value?.result_img);
const diff_info = useSample(() => testcase.value?.diff_img);
const baseline_info = useSample(() => baseline.value?.baseline_img);

const { visible, options, id } = useTestcaseView();
const { acceptTestcase } = useReview();
const view = ref<'compare' | 'result' | 'diff' | 'baseline'>('compare');
const loading = ref<boolean>(true);

function onErrorDetails() {
    if (!testcase.value?.failed_msg) return;
    openDialog({
        header: 'Error details',
        content: {
            setup() {
                return () => h('pre', { class: 'text-red-600 max-w-[1000px] overflow-auto' }, testcase.value?.failed_msg)
            },
        },
        severity: 'danger',
        blockScroll: false,
    });
}

async function onPrevClick() {
    const prev_id = await options.value?.prevId?.(id.value);
    prev_id && await load(prev_id);

    if (!prev_id) {
        toast.add({
            severity: 'warn',
            summary: 'No more previous testcases',
            life: 1000,
        });
    }
}

async function onNextClick() {
    const next_id = await options.value?.nextId?.(id.value);
    next_id && await load(next_id);

    if (!next_id) {
        toast.add({
            severity: 'warn',
            summary: 'No more next testcases',
            life: 1000,
        });
    }
}

async function onAccept() {
    const comitted = await acceptTestcase([id.value!]);

    if (comitted) {
        visible.value = false;
    }
}

async function load(testcase_id: number) {
    try {
        loading.value = true;
        id.value = testcase_id;
        testcase.value = await api.testcases.get(testcase_id);
        pipeline.value = await api.pipelines.get(testcase.value!.pipeline_id);

        if (pipeline.value?.name && testcase.value?.unique_key) {
            baseline.value = (
                await api.baselines.find({
                    query: {
                        unique_key: testcase.value?.unique_key,
                    },
                })
            ).data.at(0);
        } else {
            baseline.value = undefined;
        }
        view.value = hide_diff.value ? 'result' : 'compare';
    } finally {
        loading.value = false;
    }
}

watch(visible, async (v) => {
    if (v && id.value) {
        await load(id.value);
    }
});
</script>
<style scoped>
.samples-container {
    max-width: 1600px;
    width: 100%;
}

.screen {
    max-width: 100%;
    max-height: 100%;
    margin: 0 auto;
}

.screen-container {
    height: calc(100vh - 300px);
    width: 100%;
}
</style>
