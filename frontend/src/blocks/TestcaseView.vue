<template>
    <div class="flex justify-center">
        <Drawer v-model:visible="visible"
                :header="[testcase?.group, testcase?.name].join(': ')"
                position="full">
            <template v-if="testcase">
                <div>
                    {{ testcase }}
                </div>
                <div class="flex justify-center">
                    <ImageDiff :before="testcase.result_img!"
                               :after="testcase.diff_img!"
                               :max-width="1400">
                    </ImageDiff>
                </div>
            </template>
        </Drawer>
    </div>
</template>
<script setup lang="ts">
import Drawer from 'primevue/drawer';
import { useTestcaseView } from '../composables/useTestcaseView.ts';
import type { TestCase } from '@/types';
import { ref, watch } from 'vue';
import { api } from '../api/api.ts';
import ImageDiff from '../components/ImageDiff.vue';

const testcase = ref<TestCase>();

const { visible, id } = useTestcaseView();

watch(visible, async (v) => {
    if (v && id.value) {
        testcase.value = await api.testcases.get(id.value);
    }
});
</script>