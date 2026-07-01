<template>
    <div
        ref="container"
        class="relative outline outline-surface-300 mt-10 overflow-hidden bg-gray-300 select-none"
        :style="{
            width: `${displayWidth}px`,
            height: `${displayHeight}px`,
        }"
        @mousedown="startDrag"
        @touchstart.prevent="startDrag"
    >
        <!-- BEFORE -->
        <img
            ref="beforeImg"
            :src="before"
            class="absolute top-0 left-0"
            :style="beforeStyle"
            draggable="false"
            @load="refreshSizes"
        />

        <!-- AFTER (clipped wrapper) -->
        <div
            class="absolute top-0 left-0 overflow-hidden bg-purple-600/50"
            :style="overlayClipStyle"
        >
            <img
                ref="afterImg"
                :src="after"
                class="block max-w-none"
                :style="afterStyle"
                draggable="false"
                @load="refreshSizes"
            />
        </div>

        <!-- Divider -->
        <div
            class="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg"
            :style="{ left: `${position}%`, transform: 'translateX(-50%)' }"
        >
            <div
                class="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white bg-white shadow-lg"
            >
                <i class="pi pi-arrows-h text-gray-700" />
            </div>
        </div>

        <!-- Labels -->
        <div class="absolute top-3 left-3 rounded bg-black/70 px-3 py-2 text-xs text-white">
            <div class="font-semibold">Before</div>
            <div v-if="beforeImg">{{ beforeImg.naturalWidth }} × {{ beforeImg.naturalHeight }}</div>
        </div>

        <div class="absolute top-3 right-3 rounded bg-black/70 px-3 py-2 text-xs text-white">
            <div class="font-semibold">After</div>
            <div v-if="afterImg">{{ afterImg.naturalWidth }} × {{ afterImg.naturalHeight }}</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import type { CSSProperties } from 'vue';
import { useResize } from '../composables/useResize';

interface Props {
    before: string;
    after: string;
    maxWidth?: number;
    initial?: number;
}

const props = withDefaults(defineProps<Props>(), {
    initial: 50,
});

const container = ref<HTMLDivElement>();
const beforeImg = ref<HTMLImageElement>();
const afterImg = ref<HTMLImageElement>();

const position = ref(props.initial);

const displayWidth = ref(0);
const displayHeight = ref(0);

const beforeStyle = ref<CSSProperties>({});
const afterStyle = ref<CSSProperties>({});

useResize(container, () => {
    refreshSizes();
});

const overlayClipStyle = computed<CSSProperties>(() => ({
    width: `${(displayWidth.value * position.value) / 100}px`,
    height: `${displayHeight.value}px`,
}));

function refreshSizes() {
    if (!beforeImg.value || !afterImg.value) return;

    const parentWidth = container.value?.parentElement?.getBoundingClientRect().width || 900;

    const maxWidth = Math.min(parentWidth, props.maxWidth || 3000);
    const b = beforeImg.value;
    const a = afterImg.value;

    // pick a shared canvas based on max width
    const scale = maxWidth / Math.max(b.naturalWidth, a.naturalWidth);

    const beforeW = b.naturalWidth * scale;
    const beforeH = b.naturalHeight * scale;

    const afterW = a.naturalWidth * scale;
    const afterH = a.naturalHeight * scale;

    displayWidth.value = Math.max(beforeW, afterW);
    displayHeight.value = Math.max(beforeH, afterH);

    // IMPORTANT: BOTH fill full canvas width (no independent scaling)
    beforeStyle.value = {
        width: `${displayWidth.value}px`,
        height: 'auto',
    };

    afterStyle.value = {
        width: `${displayWidth.value}px`,
        height: 'auto',
    };
}

/* slider */
let dragging = false;

function updatePosition(x: number) {
    if (!container.value) return;

    const rect = container.value.getBoundingClientRect();

    position.value = Math.min(100, Math.max(0, ((x - rect.left) / rect.width) * 100));
}

function startDrag(e: MouseEvent | TouchEvent) {
    dragging = true;

    const x = e instanceof MouseEvent ? e.clientX : e.touches[0].clientX;
    updatePosition(x);

    window.addEventListener('mousemove', move);
    window.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('mouseup', stop);
    window.addEventListener('touchend', stop);
}

function move(e: MouseEvent | TouchEvent) {
    if (!dragging) return;
    updatePosition(e instanceof MouseEvent ? e.clientX : e.touches[0].clientX);
}

function stop() {
    dragging = false;

    window.removeEventListener('mousemove', move);
    window.removeEventListener('touchmove', move);
    window.removeEventListener('mouseup', stop);
    window.removeEventListener('touchend', stop);
}

onBeforeUnmount(stop);
</script>
