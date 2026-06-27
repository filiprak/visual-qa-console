<template>
    <span v-if="svg"
          v-html="svg"
          class="fa-icon" />
</template>
<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

interface Props {
    family?: 'solid' | 'regular' | 'brands'
    icon: string
}

const props = withDefaults(defineProps<Props>(), {
    family: 'solid',
})

const svg = ref('')
const loading = ref(false)
const error = ref<string | null>(null)

const url = computed(() => {
    return `https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@latest/svgs/${props.family}/${props.icon}.svg`
})

async function loadIcon() {
    loading.value = true
    error.value = null
    svg.value = ''

    try {
        const response = await fetch(url.value)

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`)
        }

        svg.value = await response.text()
    } catch (e) {
        error.value = e instanceof Error ? e.message : String(e)
    } finally {
        loading.value = false
    }
}

onMounted(loadIcon)
watch(() => [props.family, props.icon], loadIcon)
</script>
<style scoped>
.fa-icon {
    display: inline-flex;
    width: 1em;
    height: 1em;
}

.fa-icon :deep(svg) {
    width: 100%;
    height: 100%;
    fill: currentColor;
}
</style>