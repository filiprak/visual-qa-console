<template>
    <div>
        Are you sure you want to change status of this UI visual test(s)?
    </div>
    <div class="mb-3">
        This action will update testcase status:
    </div>
    <div class="flex justify-start items-center gap-2 mb-6">
        <div class="w-full">
            <span class="text-xs text-primary">Select new status:</span>
            <div class="mt-2 flex flex-col gap-3">
                <label v-for="status in statuses"
                       :key="status.value"
                       :for="'preview-' + status.value"
                       :class="'flex-1 flex items-start gap-2 p-3 rounded-lg border hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors cursor-pointer ' + (update_status === status.value ? 'border-primary' : 'border-surface')">
                    <div class="flex-1 flex flex-col gap-1">
                        <div class="inline-flex items-center gap-2">
                            <span class="font-medium leading-none">{{ status.name }}</span>
                        </div>
                    </div>
                    <RadioButton v-model="update_status"
                                 :inputId="'preview-' + status.value"
                                 name="preview-card"
                                 :value="status.value" />
                </label>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { inject, type Ref } from 'vue';

const dialogRef = inject('dialogData') as { update_status: Ref<string> };
const update_status = dialogRef.update_status;
const statuses = [
    { value: 'reported', name: 'Reported' },
    { value: 'passed', name: 'Passed' },
    { value: 'failed', name: 'Failed' },
    { value: 'new', name: 'New' },
] as const;
</script>