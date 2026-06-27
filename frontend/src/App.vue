<template>
    <div>{{ res }}</div>
</template>
<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';

const res = ref<unknown>();

onBeforeMount(() => {
    fetch('/api').then(r => r.json()).then((d) => {
        res.value = d;
    })
});
</script>