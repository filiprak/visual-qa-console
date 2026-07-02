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

export function useImageView() {
    function openImages(images: ImageView[]) {
        current_images.value = images;
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

    return { openImages, visible, current_images };
}
