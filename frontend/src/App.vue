<template>
    <div class="flex">
        <Nav></Nav>
        <div class="grow bg-surface-200 dark:bg-surface-800">
            <RouterView></RouterView>
        </div>
    </div>
</template>
<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import Nav from './blocks/Nav.vue';
import { RouterView } from 'vue-router';

const res = ref<unknown>();
const text = ref<string>();

onBeforeMount(() => {
    fetch('/api').then(r => r.json()).then((d) => {
        res.value = d;
    })
});
</script>