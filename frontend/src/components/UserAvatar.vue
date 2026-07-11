<template>
    <div class="flex items-center justify-center rounded-full text-white select-none"
         :style="colors"
         :title="user?.name">
        {{ initials }}
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
    user?: {
        id?: number;
        name?: string;
        [key: string]: any;
    } | null;
}>();

const initials = computed(() => {
    if (!props.user?.name) return '';

    const parts = props.user.name.trim().split(/\s+/);

    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }

    return parts[0].substring(0, 2).toUpperCase();
});

const colors = computed(() => {
    const id = props.user?.id ?? 0;
    const hue = (id * 137.508) % 360; // golden angle

    return {
        backgroundColor: `hsl(${hue}, 65%, 45%)`,
    };
});
</script>