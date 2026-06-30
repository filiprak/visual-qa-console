<template>
    <Button
        @click="toggle()"
        v-tooltip="'Switch dark/light mode'"
        :icon="theme == 'dark' ? 'pi pi-moon' : 'pi pi-sun'"
        severity="secondary"
        variant="text"
    >
    </Button>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue';
import Button from 'primevue/button';
import vTooltip from 'primevue/tooltip';
import type { Theme } from '../types';

const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
const theme = ref<Theme>(localStorage.theme || systemTheme());

function systemTheme() {
    return mediaQuery.matches ? 'dark' : 'light';
}

function toggle() {
    const seq: Theme[] = ['light', 'dark'];
    applyTheme(seq[(seq.indexOf(theme.value) + 1) % seq.length]);
}

function applyTheme(selected: Theme) {
    const isDark = selected === 'dark';

    document.documentElement.classList.toggle('dark', isDark);

    localStorage.theme = selected;
    theme.value = selected;
}

function loadTheme() {
    if (localStorage.theme === 'dark') {
        applyTheme('dark');
    } else {
        applyTheme('light');
    }
}

onMounted(() => {
    loadTheme();
});
</script>
