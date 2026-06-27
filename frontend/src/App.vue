<template>
    <div class="text-3xl font-bold underline">{{ res }}
        <ThemeSwitch />
    </div>
</template>
<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import ThemeSwitch from './components/ThemeSwitch.vue';

const res = ref<unknown>();

onBeforeMount(() => {
    fetch('/api').then(r => r.json()).then((d) => {
        res.value = d;
    })
});
</script>