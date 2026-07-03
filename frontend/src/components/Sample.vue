<template>
    <img :src="src">
</template>
<script setup lang="ts">
const props = defineProps<{
    src: string;
}>();
</script>
