<template>
    <div class="flex justify-center">
        <Drawer
            v-model:visible="visible"
            :show-close-icon="false"
            position="full"
        >
            <template
                #header
                v-if="!loading"
            >
                <div class="flex items-center gap-3">
                    <Button
                        icon="pi pi-chevron-left"
                        outlined
                        size="small"
                        severity="secondary"
                        @click="visible = false"
                    >
                    </Button>
                    <div class="text-xl font-extrabold">{{ testcase?.group }} / {{ testcase?.name }}</div>
                </div>
                <div class="flex gap-3">
                    <Button
                        v-if="testcase?.status == 'failed'"
                        rounded
                        outlined
                        severity="warn"
                    >
                        <Icon name="flag"></Icon>
                        Report issue
                    </Button>
                    <Button
                        v-if="testcase?.status == 'failed'"
                        rounded
                        severity="success"
                    >
                        <Icon name="check"></Icon>
                        Accept
                    </Button>
                    <Button
                        @click="visible = false"
                        rounded
                        outlined
                        severity="secondary"
                    >
                        <Icon name="times"></Icon>
                        Exit
                    </Button>
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
                <div class="mb-4"></div>
                <div>
                    <div class="flex justify-center mb-4">
                        <SelectButton
                            v-model="view"
                            :allow-empty="false"
                            option-label="label"
                            option-value="value"
                            :options="[
                                { label: 'Side By Side', value: 'all' },
                                { label: 'Compare', value: 'slider' },
                            ]"
                        >
                        </SelectButton>
                    </div>
                    <div
                        v-if="view == 'all'"
                        class="flex justify-center"
                    >
                        <div class="flex gap-3 justify-center">
                            <div>
                                <div class="uppercase text-primary text-sm font-bold">Baseline</div>
                                <div>
                                    <img
                                        class="block outline outline-surface-300"
                                        :src="testcase.result_img"
                                    />
                                </div>
                            </div>
                            <div>
                                <div class="uppercase text-primary text-sm font-bold">Result</div>
                                <div>
                                    <img
                                        class="block outline outline-surface-300"
                                        :src="testcase.result_img"
                                    />
                                </div>
                            </div>
                            <div>
                                <div class="uppercase text-primary text-sm font-bold">Diff</div>
                                <div>
                                    <img
                                        class="block outline outline-surface-300"
                                        :src="testcase.diff_img"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div
                        v-if="view == 'slider'"
                        class="flex justify-center"
                    >
                        <ImageDiff
                            :before="testcase.result_img!"
                            :after="testcase.diff_img!"
                            :max-width="1400"
                        >
                        </ImageDiff>
                    </div>
                </div>
            </template>
        </Drawer>
    </div>
</template>
<script setup lang="ts">
import Drawer from 'primevue/drawer';
import { useTestcaseView } from '../composables/useTestcaseView.ts';
import type { Pipeline, TestCase } from '@/types';
import { ref, watch } from 'vue';
import { api } from '../api/api.ts';
import Skeleton from 'primevue/skeleton';
import SelectButton from 'primevue/selectbutton';
import ImageDiff from '../components/ImageDiff.vue';
import Icon from '../components/Icon.vue';

const testcase = ref<TestCase>();
const pipeline = ref<Pipeline>();

const { visible, id } = useTestcaseView();
const view = ref<'all' | 'slider'>('all');
const loading = ref<boolean>(false);

watch(visible, async (v) => {
    if (v && id.value) {
        try {
            loading.value = true;
            testcase.value = await api.testcases.get(id.value);
            pipeline.value = await api.pipelines.get(testcase.value!.pipeline_id);
        } finally {
            loading.value = false;
        }
    }
});
</script>
