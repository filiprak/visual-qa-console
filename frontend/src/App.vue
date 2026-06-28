<template>
    <div class="app">
        <Nav></Nav>
        <div class="grow bg-surface-200 dark:bg-surface-800">
            <RouterView></RouterView>
        </div>
    </div>
    <div>
        <Toast position="top-center" />
    </div>
</template>
<script setup lang="ts">
import Nav from './blocks/Nav.vue';
import Toast from "primevue/toast";
import { useToast } from "primevue/usetoast";
import { RouterView } from 'vue-router';
import { registerToast } from './errors';
import { onBeforeMount } from 'vue';

const toast = useToast();

onBeforeMount(() => {
    registerToast(toast);
});

</script>
<style scoped>
.app {
    display: grid;
    grid-template-columns: var(--nav-w) auto;
}
</style>
