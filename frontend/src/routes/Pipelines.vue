<template>
    <div class="p-12 flex justify-center">
        <div class="max-w-[1600px] grow">
            <div class="my-8">
                <h1 class="text-5xl font-semibold">Pipelines</h1>
                <p class="text-muted-color mt-2">
                    Track automated screenshot comparisons and regression test runs
                </p>
            </div>
            <div class="flex gap-3 items-center p-4 text-muted-color">
                <div class="basis-[28px]">#</div>
                <div class="grow-1">Name</div>
                <div class="basis-[200px]">Branch</div>
                <div class="basis-[200px]">Commit SHA</div>
                <div class="basis-[300px]">Summary</div>
                <div class="basis-[200px]">Created</div>
            </div>
            <DataView :value="rows"
                      lazy
                      paginator
                      :loading="loading"
                      :rows="limit"
                      :totalRecords="total"
                      :first="offset"
                      @page="onPage">
                <template #list="{ items }">
                    <div class="mb-3">
                        <RouterLink v-for="item in (items as Pipeline[])"
                                    class="flex gap-3 items-center p-4 hover:bg-emphasis hover:text-color-emphasis border-b border-surface"
                                    :to="{ path: `/pipelines/${item.id}` }"
                                    :key="item.id">
                            <div class="basis-[28px] flex items-center">
                                <Icon v-if="item.details.status == 'passed'"
                                      name="check-circle"
                                      size="1.4rem"
                                      class="text-green-600">
                                </Icon>
                                <Icon v-else
                                      name="times-circle"
                                      size="1.4rem"
                                      class="text-red-600">
                                </Icon>
                            </div>
                            <div class="font-semibold grow-1 flex items-center gap-2">#{{ item.id }} {{ item.name }} <Tag v-if="isLatest(item)" severity="success" class="text-xs">latest run</Tag></div>
                            <div class="basis-[200px]">
                                {{ item.branch_name }}
                            </div>
                            <div class="basis-[200px]">
                                <Tag severity="warn">
                                    {{ item.commit_sha }}
                                </Tag>
                            </div>
                            <div class="flex font-semibold flex-col justify-start items-start basis-[300px]">
                                <span class="font-normal">{{ item.details.total }} (total)</span>
                                <span class="inline-flex gap-3 mt-1" v-if="item.details.failed || item.details.new || item.details.reported">
                                    <span class="text-xs text-red-600"
                                          v-if="item.details.failed">
                                        <Icon name="exclamation-triangle"
                                              size="0.7rem" /> Failed: {{ item.details.failed }}
                                    </span>
                                    <span class="text-xs text-blue-400"
                                          v-if="item.details.new">
                                        <Icon name="plus"
                                              size="0.7rem" /> New: {{ item.details.new }}
                                    </span>
                                    <span class="text-xs text-orange-400"
                                          v-if="item.details.reported">
                                        <Icon name="info-circle"
                                              size="0.7rem" /> Reported: {{ item.details.reported }}
                                    </span>
                                </span>
                                <span class="text-xs text-green-400"
                                      v-else>
                                    All passed!
                                </span>
                            </div>
                            <div class="flex flex-col justify-start items-start basis-[200px]">
                                <span v-tooltip.top="format(item.created_at)">{{ fromNow(item.created_at) }}</span>
                                <span class="text-xs"
                                      v-tooltip.top="format(item.updated_at)">
                                    Last updated: {{ fromNow(item.updated_at) }}
                                </span>
                            </div>
                        </RouterLink>
                    </div>
                </template>
                <template #empty>
                    <div class="flex justify-center p-6 mb-3">
                        <span v-if="loading">Loading...</span>
                        <span v-else>No items found</span>
                    </div>
                </template>
            </DataView>
        </div>
    </div>
</template>
<script setup lang="ts">
import { RouterLink } from 'vue-router';
import vTooltip from 'primevue/tooltip';
import Tag from 'primevue/tag';
import DataView from 'primevue/dataview';
import { computed, onMounted, ref, watch } from 'vue';
import { api } from '../api';
import { format, fromNow } from '../utils/dates.ts';
import Icon from '../components/Icon.vue';
import { useDataView } from '../composables/useDataView.ts';
import type { Pipeline } from '@/types';

const sort = computed<Record<string, 1 | -1>>(() => ({ created_at: -1 }));

const { rows, loading, offset, limit, total, onPage, reload } = useDataView<Pipeline>({
    service: api.pipelines,
    perPage: 30,
    sort,
});

// Frontend-only: map branch_name -> pipeline id of the most recent pipeline for that branch (global, not just current page)
const latestByBranch = ref<Map<string, number>>(new Map());

async function fetchLatestForBranches(branches: string[]) {
    const missing = branches.filter((b) => !latestByBranch.value.has(b));
    if (missing.length === 0) return;
    const results = await Promise.all(
        missing.map(async (branch) => {
            try {
                const res = await api.pipelines.find({
                    query: {
                        branch_name: branch,
                        $sort: { created_at: -1 },
                        $limit: 1,
                    } as any,
                });
                const latest = (res as any).data?.[0] as Pipeline | undefined;
                if (latest) return { branch, id: latest.id };
            } catch {
                // ignore fetch errors, fallback to per-page logic will still show something
            }
            return null;
        }),
    );
    let changed = false;
    for (const r of results) {
        if (r) {
            latestByBranch.value.set(r.branch, r.id);
            changed = true;
        }
    }
    if (changed) {
        // create new Map to trigger reactivity (Vue tracks Map reference)
        latestByBranch.value = new Map(latestByBranch.value);
    }
}

// when visible rows change (pagination / reload), ensure we know global latest for each branch in view
watch(
    () => rows.value as Pipeline[],
    (newRows) => {
        if (!newRows || newRows.length === 0) return;
        const branches = [...new Set(newRows.map((r) => r.branch_name))] as string[];
        fetchLatestForBranches(branches);
    },
    { immediate: true },
);

function isLatest(item: Pipeline): boolean {
    // if we have fetched global latest for this branch, use it
    if (latestByBranch.value.has(item.branch_name)) {
        return latestByBranch.value.get(item.branch_name) === item.id;
    }
    // fallback (before fetch completes): mark most recent among currently loaded rows per branch
    // this keeps UI responsive without extra request latency
    const perBranchLatestId = (() => {
        const map = new Map<string, Pipeline>();
        for (const p of rows.value as Pipeline[]) {
            const existing = map.get(p.branch_name);
            if (!existing) {
                map.set(p.branch_name, p);
                continue;
            }
            const aTime = new Date(p.created_at).getTime();
            const bTime = new Date(existing.created_at).getTime();
            if (aTime > bTime || (aTime === bTime && p.id > existing.id)) {
                map.set(p.branch_name, p);
            }
        }
        return map.get(item.branch_name)?.id;
    })();
    return perBranchLatestId === item.id;
}

onMounted(() => {
    reload();
});
</script>
