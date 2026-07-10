<template>
    <aside
        class="fixed left-0 top-0 bottom-0 flex h-screen w-(--nav-w) flex-col items-center py-5 bg-white dark:bg-black"
    >
        <!-- Logo -->
        <div class="mb-8 p-3 flex h-12 w-12 items-center justify-center">
            <img
                class="w-full h-full"
                src="/logo.svg"
            />
        </div>

        <!-- Menu -->
        <nav class="flex flex-col gap-4 grow">
            <RouterLink
                v-for="item in menuItems"
                :key="item.label"
                :to="item.path"
            >
                <Button
                    severity="secondary"
                    variant="outlined"
                    :icon="'pi ' + item.icon"
                    v-tooltip="item.label"
                >
                </Button>
            </RouterLink>
            <Divider></Divider>
            <ThemeSwitch></ThemeSwitch>
        </nav>

        <div class="mt-auto flex flex-col gap-4 items-center mb-4">
            <Button
                v-if="!isAuthenticated"
                @click="openLogin"
                severity="secondary"
                variant="outlined"
                icon="pi pi-sign-in"
                v-tooltip="'Sign In'"
            />
            <div
                v-else
                class="cursor-pointer"
                @click="togglePopover"
            >
                <UserAvatar class="w-10 h-10" :user="user" />
            </div>
        </div>

        <Popover ref="op">
            <div class="flex flex-col w-64 gap-2">
                <!-- User Info Profile Card -->
                <div class="flex items-center gap-3 p-3 bg-surface-100 dark:bg-surface-800">
                    <UserAvatar class="w-12 h-12 shadow-sm text-lg flex-shrink-0" :user="user" />
                    <div class="flex flex-col overflow-hidden">
                        <span class="font-bold text-color-emphasis truncate" :title="user?.name">{{ user?.name }}</span>
                        <span class="text-xs text-muted-color truncate" :title="user?.email">{{ user?.email }}</span>
                    </div>
                </div>
                
                <Divider class="my-1" />
                
                <!-- Actions -->
                <button
                    class="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-surface-600 dark:text-surface-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 cursor-pointer"
                    @click="handleLogout"
                >
                    <i class="pi pi-sign-out text-base"></i>
                    <span>Sign Out</span>
                </button>
            </div>
        </Popover>
    </aside>
</template>

<script setup lang="ts">
import Button from 'primevue/button';
import ThemeSwitch from '../components/ThemeSwitch.vue';
import vTooltip from 'primevue/tooltip';
import Divider from 'primevue/divider';
import Popover from 'primevue/popover';
import UserAvatar from '../components/UserAvatar.vue';
import { useAuth } from '../composables/useAuth';
import { ref, computed } from 'vue';

const { isAuthenticated, user, openLogin, logout, checkPermission } = useAuth();

const op = ref();

function togglePopover(event: Event) {
    op.value.toggle(event);
}

function handleLogout() {
    logout();
    op.value.hide();
}

interface MenuItem {
    label: string;
    icon: string;
    path: string;
}

const menuItems = computed<MenuItem[]>(() => {
    const items: MenuItem[] = [
        {
            label: 'Pipelines',
            icon: 'pi-bolt',
            path: '/',
        },
        {
            label: 'Baseline Screenshots',
            icon: 'pi-image',
            path: '/baselines',
        },
    ];

    if (checkPermission('users.')) {
        items.push({
            label: 'Users',
            icon: 'pi-users',
            path: '/users',
        });
    }

    return items;
});
</script>
