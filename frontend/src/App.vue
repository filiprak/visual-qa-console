<template>
    <div class="app">
        <Nav></Nav>
        <div class="grow bg-surface-200 dark:bg-surface-800">
            <RouterView></RouterView>
        </div>
    </div>
</template>
<script setup lang="ts">
import Nav from './blocks/Nav.vue';
import { RouterView } from 'vue-router';
</script>
<style scoped>
.app {
    display: grid;
    grid-template-columns: var(--nav-w) auto;
}
</style>
