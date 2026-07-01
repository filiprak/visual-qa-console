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
                    <Tag
                        v-if="pipeline?.details.status == 'passed'"
                        rounded
                        severity="success"
                    >
                        <Icon name="check-circle"> </Icon>
                        Passed
                    </Tag>
                    <Tag
                        v-else
                        rounded
                        severity="danger"
                    >
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
                    <div class="basis-[200px]">Suite</div>
                    <div class="basis-[200px]">Last updated</div>
                    <div class="basis-[200px]">Actions</div>
                </div>
                <DataPaginated
                    :service="api.testcases"
                    :query="{ pipeline_id: pipeline.id }"
                >
                    <template #list="{ items }">
                        <div>
                            <RouterLink
                                v-for="item in items"
                                class="flex gap-3 items-center p-4 hover:bg-emphasis hover:text-color-emphasis border-b border-surface"
                                :to="{ path: `/testcases/${item.id}` }"
                                :key="item.id"
                            >
                                <div class="basis-[28px] flex items-center">
                                    <Icon
                                        v-if="item.status == 'passed'"
                                        name="check"
                                        size="1.4rem"
                                        class="text-green-600"
                                    >
                                    </Icon>
                                    <Icon
                                        v-else
                                        name="times"
                                        size="1.4rem"
                                        class="text-red-600"
                                    >
                                    </Icon>
                                </div>
                                <div class="font-semibold grow-1">{{ item.name }}</div>
                                <div class="basis-[200px]">
                                    <Tag
                                        v-if="item.status == 'passed'"
                                        rounded
                                        severity="success"
                                    >
                                        <Icon name="check"> </Icon>
                                        Passed
                                    </Tag>
                                    <Tag
                                        v-else
                                        rounded
                                        severity="danger"
                                    >
                                        <Icon name="times"></Icon>
                                        Failed
                                    </Tag>
                                </div>
                                <div class="basis-[200px]">
                                    {{ item.group }}
                                </div>
                                <div class="flex flex-col justify-start items-start basis-[200px]">
                                    <span v-tooltip.top="format(item.updated_at)">{{ fromNow(item.updated_at) }}</span>
                                </div>
                                <div class="flex flex-col justify-start items-start basis-[200px]">
                                    <Button
                                        v-if="item.status == 'failed'"
                                        size="small"
                                        outlined
                                        @click.stop.prevent="() => {}"
                                    >
                                        <Icon name="check"></Icon>
                                        Accept
                                    </Button>
                                </div>
                            </RouterLink>
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
import type { Pipeline } from '@/types';
import { api } from '../api';
import { format, fromNow } from '../utils/dates.ts';

const route = useRoute();
const pipeline = ref<Pipeline>();

onBeforeMount(async () => {
    pipeline.value = await api.pipelines.get(route.params.id as string);
});
</script>
