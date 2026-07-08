import { ref } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';

export interface ImageView {
    src: string;
    title?: string;
    width?: number;
    height?: number;
}

const visible = ref(false);
const current_images = ref<ImageView[]>([]);
const initial_idx = ref<number>(0);

export function useImageView() {
    function openImages(images: ImageView[], open_idx = 0) {
        current_images.value = images;
        initial_idx.value = open_idx;
        visible.value = true;
    }

    onBeforeRouteLeave((_, from, next) => {
        if (visible.value) {
            visible.value = false;
            next(from);
        } else {
            next();
        }
    });

    return { openImages, visible, current_images, initial_idx };
}
