<template>
    <div>
        Are you sure you want to accept this UI visual test(s)?
    </div>
    <div class="mb-3">
        This action will mark the testcase as <span class="font-bold text-green-600">passed</span>
    </div>
    <div class="flex justify-start items-center gap-2 mb-6">
        <label for="baseline"
               class="font-semibold cursor-pointer">Update baseline screenshot</label>
        <ToggleSwitch v-model="update_baseline"
                      input-id="baseline">
        </ToggleSwitch>
    </div>
</template>

<script setup lang="ts">
import { inject, type Ref } from 'vue';

const dialogRef = inject('dialogData') as { update_baseline: Ref<boolean> };
const update_baseline = dialogRef.update_baseline;
</script>