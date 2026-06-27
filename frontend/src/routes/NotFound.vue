<template>
    <div class="min-h-screen flex items-center justify-center px-6">
        <div class="text-center">
            <p class="text-9xl font-bold text-primary">404</p>

            <h1 class="mt-4 text-3xl font-semibold tracking-tight">Page not found</h1>

            <p class="mt-3 text-muted-color max-w-md">
                Sorry, we couldn't find the page you're looking for. It may have been moved or doesn't exist anymore.
            </p>

            <div class="mt-8">
                <Button @click="onClick"> Go back home </Button>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import Button from 'primevue/button';

function onClick() {
    window.location.assign('/');
}
</script>
