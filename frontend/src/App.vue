<template>
    <div class="app">
        <Nav></Nav>
        <div>
            <RouterView></RouterView>
        </div>
    </div>
    <div>
        <Toast position="top-center" />
    </div>
</template>
<script setup lang="ts">
import Nav from './blocks/Nav.vue';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';
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
    padding-left: var(--nav-w);
}
</style>
