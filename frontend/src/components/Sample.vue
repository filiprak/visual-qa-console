<template>
    <img class="block outline-2 outline-surface-400 cursor-pointer"
         @click="openImages([{ src: src, title: title }])"
         :src="src" />
</template>
<script setup lang="ts">
import { useImageView } from '../composables/useImageView';

const props = defineProps<{
    src: string;
    title: string;
}>();

const { openImages } = useImageView();
</script>
