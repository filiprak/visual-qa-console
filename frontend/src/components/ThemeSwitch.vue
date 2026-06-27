<template>
    <select v-model="theme"
            @change="applyTheme(theme)"
            class="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800">
        <option value="light">☀️ Light</option>
        <option value="dark">🌙 Dark</option>
        <option value="system">💻 System</option>
    </select>
</template>
<script setup lang="ts">
import { onMounted, ref } from "vue";

type Theme = "light" | "dark" | "system";

const theme = ref<Theme>("system");

const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

function applyTheme(selected: Theme) {
    const isDark =
        selected === "dark" ||
        (selected === "system" && mediaQuery.matches);

    document.documentElement.classList.toggle("dark", isDark);

    if (selected === "system") {
        localStorage.removeItem("theme");
    } else {
        localStorage.theme = selected;
    }

    theme.value = selected;
}

function loadTheme() {
    if (localStorage.theme === "light") {
        applyTheme("light");
    } else if (localStorage.theme === "dark") {
        applyTheme("dark");
    } else {
        applyTheme("system");
    }
}

onMounted(() => {
    loadTheme();

    mediaQuery.addEventListener("change", () => {
        if (theme.value === "system") {
            applyTheme("system");
        }
    });
});
</script>
