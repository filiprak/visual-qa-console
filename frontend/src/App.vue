<template>
    <div class="app">
        <Nav></Nav>
        <div>
            <RouterView></RouterView>
        </div>
    </div>
    <div>
        <TestcaseView />
        <ImageView />
    </div>
    <div>
        <Toast position="top-center" />
        <ConfirmDialog class="max-w-200"></ConfirmDialog>
    </div>
</template>
<script setup lang="ts">
import Nav from './blocks/Nav.vue';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';
import { RouterView } from 'vue-router';
import { registerToast } from './errors';
import { onBeforeMount } from 'vue';
import TestcaseView from './blocks/TestcaseView.vue';
import ImageView from './blocks/ImageView.vue';

const toast = useToast();

onBeforeMount(() => {
    registerToast(toast);
});
</script>
<style scoped>
.app {
    padding-left: var(--nav-w);
}
</style>
