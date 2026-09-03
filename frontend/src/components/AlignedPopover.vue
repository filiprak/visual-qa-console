<template>
    <Popover
        ref="popoverRef"
        :dismissable="dismissable"
        :append-to="appendTo"
        :base-z-index="baseZIndex"
        :auto-z-index="autoZIndex"
        :breakpoints="breakpoints"
        :close-on-escape="closeOnEscape"
        :pt="{ root: { class: rootClass } }"
        @show="emit('show')"
        @hide="emit('hide')"
    >
        <slot></slot>
        <template
            v-if="$slots.container"
            #container="scope"
        >
            <slot
                name="container"
                v-bind="scope"
            ></slot>
        </template>
    </Popover>
</template>
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import Popover from 'primevue/popover';
import type { PopoverMethods } from 'primevue/popover';

export type AlignedPopoverPlacement = 'right' | 'left' | 'top' | 'bottom';

export interface AlignedPopoverMethods extends PopoverMethods {}

const props = withDefaults(
    defineProps<{
        /** Side of the activator the overlay anchors to. Defaults to 'right'. */
        placement?: AlignedPopoverPlacement;
        /** Gap in px between activator and overlay. Defaults to 8. */
        gutter?: number;
        /** Hide PrimeVue's top/bottom arrow nub (misleading for side placements). Defaults to true. */
        hideArrow?: boolean;
        dismissable?: boolean;
        appendTo?: string | HTMLElement;
        baseZIndex?: number;
        autoZIndex?: boolean;
        breakpoints?: Record<string, string>;
        closeOnEscape?: boolean;
    }>(),
    {
        placement: 'right',
        gutter: 8,
        hideArrow: true,
    },
);

const emit = defineEmits<{
    show: [];
    hide: [];
}>();

const popoverRef = ref<PopoverMethods>();

const rootClass = computed(() => (props.hideArrow ? 'aligned-popover aligned-popover-no-arrow' : 'aligned-popover'));

interface PopoverInternals {
    alignOverlay?: () => void;
    container?: HTMLElement | null;
    target?: HTMLElement | null;
}

// PrimeVue Popover has no position prop and always anchors below the target,
// so we override its internal alignOverlay(). Patching (instead of
// repositioning once after show) also survives Popover's internal re-aligns
// (onEnter + content ResizeObserver, e.g. when images load).
function align() {
    const popover = popoverRef.value as unknown as PopoverInternals | undefined;
    const container = popover?.container;
    const target = popover?.target;
    if (!container || !target) return;

    const gutter = props.gutter;
    const rect = target.getBoundingClientRect();
    const overlayWidth = container.offsetWidth;
    const overlayHeight = container.offsetHeight;
    const scrollX = window.scrollX ?? document.documentElement.scrollLeft;
    const scrollY = window.scrollY ?? document.documentElement.scrollTop;

    let left = 0;
    let top = 0;
    let origin = 'left top';

    if (props.placement === 'left') {
        left = rect.left + scrollX - overlayWidth - gutter;
        if (left < scrollX) {
            left = rect.right + scrollX + gutter;
        }
        top = rect.top + scrollY;
        if (top + overlayHeight > scrollY + window.innerHeight) {
            top = Math.max(scrollY + gutter, scrollY + window.innerHeight - overlayHeight - gutter);
        }
        origin = 'right top';
    } else if (props.placement === 'top') {
        top = rect.top + scrollY - overlayHeight - gutter;
        if (top < scrollY) {
            top = rect.bottom + scrollY + gutter;
        }
        left = rect.left + scrollX;
        if (left + overlayWidth > scrollX + window.innerWidth) {
            left = Math.max(scrollX + gutter, scrollX + window.innerWidth - overlayWidth - gutter);
        }
        origin = 'left bottom';
    } else if (props.placement === 'bottom') {
        top = rect.bottom + scrollY + gutter;
        if (top + overlayHeight > scrollY + window.innerHeight) {
            top = rect.top + scrollY - overlayHeight - gutter;
        }
        left = rect.left + scrollX;
        if (left + overlayWidth > scrollX + window.innerWidth) {
            left = Math.max(scrollX + gutter, scrollX + window.innerWidth - overlayWidth - gutter);
        }
        origin = 'left top';
    } else {
        left = rect.right + scrollX + gutter;
        if (left + overlayWidth > scrollX + window.innerWidth) {
            left = rect.left + scrollX - overlayWidth - gutter;
        }
        if (left < scrollX) {
            left = scrollX + gutter;
        }
        top = rect.top + scrollY;
        if (top + overlayHeight > scrollY + window.innerHeight) {
            top = Math.max(scrollY + gutter, scrollY + window.innerHeight - overlayHeight - gutter);
        }
        origin = 'left top';
    }

    container.style.insetInlineStart = `${left}px`;
    container.style.left = `${left}px`;
    container.style.setProperty('inset-inline-end', 'auto');
    container.style.top = `${top}px`;
    container.style.marginTop = '0';
    container.style.transformOrigin = origin;

    // Point the arrow nub down only when the overlay sits above the target.
    const flipped = props.placement === 'top';
    container.toggleAttribute('data-p-popover-flipped', flipped);
    container.classList.toggle('p-popover-flipped', flipped);
}

function show(event: Event, target?: any) {
    popoverRef.value?.show(event, target);
}

function hide() {
    popoverRef.value?.hide();
}

function toggle(event: Event, target?: any) {
    popoverRef.value?.toggle(event, target);
}

function alignOverlay() {
    align();
}

onMounted(() => {
    const popover = popoverRef.value as unknown as PopoverInternals | undefined;
    if (popover) {
        popover.alignOverlay = align;
    }
});

defineExpose({
    show,
    hide,
    toggle,
    alignOverlay,
});
</script>
<style>
/* Arrow nub points up/down by default; hide it for side-anchored overlays. */
.aligned-popover-no-arrow::before,
.aligned-popover-no-arrow::after {
    display: none !important;
}
</style>
