<template>
    <Button :loading="loading">
        <Icon
            v-if="loading"
            name="spinner"
            class="animate-spin"
        >
        </Icon>
        <Icon
            v-else-if="icon"
            :name="icon"
        >
        </Icon>
        <slot></slot>
        <Icon
            v-if="!loading && append_icon"
            :name="append_icon"
        >
        </Icon>
    </Button>
</template>
<script setup lang="ts">
import Icon from './Icon.vue';

defineProps<{
    loading?: boolean;
    icon?: string;
    append_icon?: string;
}>();
</script>
