import { computed, onBeforeMount, onBeforeUnmount, Ref, ref, watch, watchEffect, WatchSource } from 'vue';

export interface SampleData {
    src: string,
    width: number,
    height: number,
    error?: boolean,
    empty: boolean,
}

export interface SampleOptions {
    src: string,
}

const cache = new Map<string, SampleData>();

const getDefaults: () => SampleData = () => ({
    empty: true,
    src: '',
    width: 0,
    height: 0,
});

export function useSample(src: WatchSource<string | undefined>) {
    const info = ref<SampleData>(getDefaults());

    watch(src, (url) => {
        if (url) {
            info.value.src = url;

            if (cache.has(url)) {
                info.value = cache.get(url)!;
            } else {
                const img = new Image();
                img.src = url;
                img.onload = (e: Event) => {
                    const img = e.target as HTMLImageElement;

                    info.value.src = img.src;
                    info.value.width = img.naturalWidth;
                    info.value.height = img.naturalHeight;
                    info.value.empty = false;
                };
                img.onerror = () => {
                    info.value.error = true;
                    info.value.empty = true;
                }
            }
        } else {
            info.value = getDefaults();
        }
    }, { immediate: true });

    return info;
}
