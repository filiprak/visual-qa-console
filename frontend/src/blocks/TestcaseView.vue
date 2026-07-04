<template>
    <div class="flex justify-center">
        <Drawer
            v-model:visible="visible"
            :show-close-icon="false"
            block-scroll
            class="no-transition"
            position="full"
        >
            <template #header>
                <template v-if="!loading && testcase">
                    <div class="flex items-center gap-3">
                        <Button
                            icon="pi pi-chevron-left"
                            severity="secondary"
                            @click="visible = false"
                        >
                        </Button>
                        <div class="text-xl font-semibold">
                            <span class="text-primary">{{ testcase?.group }}</span> /
                            <span>{{ testcase?.name }}</span>
                        </div>
                        <div>
                            <TestStatus :status="testcase.status" />
                        </div>
                    </div>
                    <div class="flex gap-3">
                        <Button
                            @click="visible = false"
                            severity="secondary"
                        >
                            <Icon name="times"></Icon>
                            Exit
                        </Button>
                        <Button
                            v-if="testcase?.status == 'failed'"
                            severity="secondary"
                        >
                            <Icon name="flag"></Icon>
                            Report issue
                        </Button>
                        <LoadingButton
                            v-if="testcase?.status == 'failed' || !baseline"
                            @click="onAccept"
                            severity="success"
                        >
                            <Icon name="check"></Icon>
                            Accept
                        </LoadingButton>
                    </div>
                </template>
                <div
                    v-else
                    class="flex gap-3 w-full items-center"
                >
                    <Button
                        icon="pi pi-chevron-left"
                        size="small"
                        severity="secondary"
                        @click="visible = false"
                    >
                    </Button>
                    <Skeleton
                        width="10%"
                        height="20px"
                    />
                </div>
            </template>
            <template v-if="loading || !testcase">
                <div class="flex gap-3 flex-col">
                    <Skeleton
                        width="50%"
                        height="30px"
                    />
                    <Skeleton
                        width="60%"
                        height="30px"
                    />
                    <Skeleton
                        width="30%"
                        height="30px"
                    />
                    <Skeleton
                        width="30%"
                        height="30px"
                    />
                    <Skeleton
                        width="40%"
                        height="30px"
                    />
                </div>
            </template>
            <template v-else>
                <div class="flex justify-center">
                    <div class="samples-container">
                        <div class="flex justify-center mb-4">
                            <SelectButton
                                v-model="view"
                                :allow-empty="false"
                                option-label="label"
                                option-value="value"
                                :options="view_options"
                            >
                                <template #option="{ option }">
                                    <div class="flex flex-col">
                                        <div>
                                            {{ option.label }}
                                        </div>
                                        <div
                                            class="text-xs text-muted-color"
                                            v-if="option.info"
                                        >
                                            {{ formatSize(option.info) }}
                                        </div>
                                    </div>
                                </template>
                            </SelectButton>
                        </div>
                        <div></div>
                        <div class="flex flex-col items-center">
                            <template v-if="view == 'compare'">
                                <div
                                    class="diff-container"
                                    v-if="baseline"
                                >
                                    <ImageDiff
                                        :before="testcase.result_img!"
                                        :after="baseline_src"
                                    >
                                    </ImageDiff>
                                </div>
                                <div v-else>
                                    <Sample
                                        class="block outline outline-surface-300 w-[500px] h-[500px]"
                                        :src="fallback_url"
                                    />
                                </div>
                            </template>
                            <template v-if="view == 'result'">
                                <div>
                                    <Sample
                                        class="block outline outline-surface-300"
                                        :src="testcase.result_img || fallback_url"
                                    />
                                </div>
                            </template>
                            <template v-if="view == 'diff'">
                                <div>
                                    <Sample
                                        class="block outline outline-surface-300"
                                        :src="testcase.diff_img || fallback_url"
                                    />
                                </div>
                            </template>
                            <template v-if="view == 'baseline'">
                                <div v-if="baseline">
                                    <Sample
                                        class="block outline outline-surface-300"
                                        :src="baseline_src"
                                    />
                                </div>
                                <div v-else>
                                    <Sample
                                        class="block outline outline-surface-300 w-full h-full"
                                        :style="{
                                            width: `${result_info.width}px`,
                                            aspectRatio: result_info.width / result_info.height,
                                        }"
                                        :src="fallback_url"
                                    />
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
import { computed, ref, watch } from 'vue';
import { api } from '../api/api.ts';
import Skeleton from 'primevue/skeleton';
import SelectButton from 'primevue/selectbutton';
import ImageDiff from '../components/ImageDiff.vue';
import Icon from '../components/Icon.vue';
import { useReview } from '../composables/useReview.ts';
import TestStatus from '../components/TestStatus.vue';
import { SampleData, useSample } from '../composables/useSample';

function formatSize(info: SampleData) {
    return info.empty ? '? x ?' : `${info.width} x ${info.height}`;
}

const fallback_url = '/placeholder.svg';
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
const baseline_src = computed(() => baseline.value?.baseline_img || fallback_url);

const result_info = useSample(() => testcase.value?.result_img);
const diff_info = useSample(() => testcase.value?.diff_img);
const baseline_info = useSample(() => baseline.value?.baseline_img);

const { visible, id } = useTestcaseView();
const { acceptTestcase } = useReview();
const view = ref<'compare' | 'result' | 'diff' | 'baseline'>('compare');
const loading = ref<boolean>(true);

async function onAccept() {
    const comitted = await acceptTestcase([id.value!]);

    if (comitted) {
        visible.value = false;
    }
}

watch(visible, async (v) => {
    if (v && id.value) {
        try {
            loading.value = true;
            testcase.value = await api.testcases.get(id.value);
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
});
</script>
<style scoped>
.samples-container {
    max-width: 1600px;
    width: 100%;
}

.diff-container {
    height: calc(100vh - 300px);
    width: 100%;
}
</style>
