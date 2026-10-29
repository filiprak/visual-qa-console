<template>
    <div class="flex items-center gap-2 w-full"
         v-tooltip.top="`${received} of ${total} shards received`">
        <ProgressBar :value="percent"
                     :showValue="false"
                     class="grow h-[6px]!"
                     :pt="{ value: { class: complete ? 'bg-green-500!' : '' } }" />
        <span class="text-xs tabular-nums whitespace-nowrap"
              :class="complete ? 'text-green-500' : 'text-muted-color'">
            {{ received }}/{{ total }}
        </span>
    </div>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import ProgressBar from 'primevue/progressbar';
import vTooltip from 'primevue/tooltip';

const props = defineProps<{
    received: number;
    total: number;
}>();

const complete = computed(() => props.received >= props.total);
const percent = computed(() => Math.min(100, Math.round((props.received / props.total) * 100)));
</script>
