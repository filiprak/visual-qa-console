<template>
    <div
        class="flex items-center justify-center rounded-full bg-primary-500 text-white font-bold select-none"
        :title="user?.name"
    >
        {{ initials }}
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
    user?: { name?: string; [key: string]: any } | null;
}>();

const initials = computed(() => {
    if (!props.user?.name) return '';
    const parts = props.user.name.trim().split(/\s+/);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
});
</script>
