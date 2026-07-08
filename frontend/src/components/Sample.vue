<template>
    <img class="block outline-2 outline-surface-400"
         :src="src" />
</template>
<script setup lang="ts">
const props = defineProps<{
    src: string;
}>();
</script>
