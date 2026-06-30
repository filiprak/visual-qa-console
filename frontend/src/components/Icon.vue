<template>
    <i
        :class="{
            pi: true,
            [`pi-${name}`]: true,
        }"
        :style="{ '--p-icon-size': size ?? undefined }"
    >
    </i>
</template>
<script setup lang="ts">
defineProps<{
    name: string;
    size?: string;
}>();
</script>
