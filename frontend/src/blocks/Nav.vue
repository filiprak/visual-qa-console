<template>
    <aside class="flex h-screen w-20 flex-col items-center py-5 bg-white dark:bg-black">
        <!-- Logo -->
        <div class="mb-8 p-3 flex h-12 w-12 items-center justify-center">
            <img class="w-full h-full"
                 src="/logo.svg">
        </div>

        <!-- Menu -->
        <nav class="flex flex-col gap-4 grow">
            <RouterLink v-for="item in menuItems"
                        :key="item.label"
                        :to="item.path">
                <Button severity="secondary"
                        variant="outlined"
                        :icon="'pi ' + item.icon"
                        v-tooltip="item.label">
                </Button>
            </RouterLink>
            <Divider></Divider>
            <ThemeSwitch></ThemeSwitch>
        </nav>
    </aside>
</template>

<script setup lang="ts">
import Button from 'primevue/button';
import ThemeSwitch from '../components/ThemeSwitch.vue';
import vTooltip from 'primevue/tooltip';
import Divider from 'primevue/divider';

interface MenuItem {
    label: string;
    icon: string;
    path: string;
}

const menuItems: MenuItem[] = [
    {
        label: "Dashboard",
        icon: "pi-home",
        path: '/',
    },
    {
        label: "Analytics",
        icon: "pi-chart-bar",
        path: '/analytics',
    },
    {
        label: "Settings",
        icon: "pi-cog",
        path: '/settings',
    },
];
</script>