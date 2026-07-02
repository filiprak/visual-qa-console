<template>
    <div ref="container"
         :style="{
            width: `100%`,
        }"
         class="img-diff flex justify-center">
        <div class="relative outline outline-surface-300 overflow-hidden bg-purple-300 select-none"
             ref="viewport"
             :style="{
                width: `${displayWidth}px`,
                height: `${displayHeight}px`,
            }"
             @mousedown="startDrag"
             @touchstart.prevent="startDrag">
            <!-- BEFORE -->
            <img ref="beforeImg"
                 :src="before"
                 class="absolute top-0 left-0"
                 :style="beforeStyle"
                 draggable="false"
                 @load="refreshSizes" />

            <!-- AFTER (clipped wrapper) -->
            <div class="absolute top-0 left-0 overflow-hidden bg-purple-600/50"
                 :style="overlayClipStyle">
                <img ref="afterImg"
                     :src="after"
                     class="block max-w-none"
                     :style="afterStyle"
                     draggable="false"
                     @load="refreshSizes" />
            </div>

            <!-- Divider -->
            <div class="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg"
                 :style="{ left: `${position}%`, transform: 'translateX(-50%)' }">
                <div
                     class="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white bg-white shadow-lg">
                    <i class="pi pi-arrows-h text-gray-700" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue';
import type { CSSProperties } from 'vue';
import { useResize } from '../composables/useResize';

interface Props {
    before: string;
    after: string;
    initial?: number;
}

const props = withDefaults(defineProps<Props>(), {
    initial: 50,
});

const container = ref<HTMLDivElement>();
const viewport = ref<HTMLDivElement>();
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

type Box = {
    width: number;
    height: number;
};

function getContainScale(boxA: Box, boxB: Box): number {
    return Math.min(
        boxA.width / boxB.width,
        boxA.height / boxB.height
    );
}

function refreshSizes() {
    if (!beforeImg.value || !afterImg.value) return;

    const containerWidth = container.value?.getBoundingClientRect().width || 500;
    const containerHeight = container.value?.getBoundingClientRect().height || 500;

    const b = beforeImg.value;
    const a = afterImg.value;

    if (!a.naturalHeight || !b.naturalHeight) return;
    if (!a.naturalWidth || !b.naturalWidth) return;

    const virtualW = Math.max(b.naturalWidth, a.naturalWidth);
    const virtualH = Math.max(b.naturalHeight, a.naturalHeight);

    const scale = getContainScale({ width: containerWidth, height: containerHeight }, { width: virtualW, height: virtualH });

    displayWidth.value = virtualW * scale;
    displayHeight.value = virtualH * scale;

    beforeStyle.value = {
        width: `${b.naturalWidth * scale}px`,
        height: `${b.naturalHeight * scale}px`,
    };

    afterStyle.value = {
        width: `${a.naturalWidth * scale}px`,
        height: `${a.naturalHeight * scale}px`,
    };
}

/* slider */
let dragging = false;

function updatePosition(x: number) {
    if (!viewport.value) return;

    const rect = viewport.value.getBoundingClientRect();

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
