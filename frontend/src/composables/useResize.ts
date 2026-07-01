import type { Ref } from 'vue';
import { onBeforeUnmount, watch } from 'vue';

export type ResizeObserverCallback = (entry: ResizeObserverEntry) => void;

export function useResize(
    target: Ref<HTMLElement | null | undefined>,
    callback: ResizeObserverCallback
) {
    let observer: ResizeObserver | null = null;

    const stopObserver = () => {
        if (observer) {
            observer.disconnect();
            observer = null;
        }
    };

    const startObserver = (el: HTMLElement | null | undefined) => {
        stopObserver();

        if (!el || typeof ResizeObserver === 'undefined') return;

        observer = new ResizeObserver((entries) => {
            if (entries.length > 0) {
                callback(entries[0]);
            }
        });

        observer.observe(el);
    };

    watch(
        () => target.value,
        (newEl) => {
            startObserver(newEl);
        },
        { immediate: true, flush: 'post' } // flush: 'post' ensures the DOM element is mounted
    );

    onBeforeUnmount(() => {
        stopObserver();
    });

    return {
        stop: stopObserver
    };
}